import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/validation";
import { generatePasswordResetToken, getBaseUrl } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";

const GENERIC_RESPONSE = {
  message: "Si el correo existe, enviaremos instrucciones para recuperar la contrasena.",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
      },
    });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });

    if (user?.passwordHash) {
      const { token, tokenHash, expiresAt } = generatePasswordResetToken();
      await prisma.passwordResetToken.create({
        data: {
          email,
          tokenHash,
          expiresAt,
        },
      });

      const origin = new URL(req.url).origin;
      const baseUrl = getBaseUrl(origin);
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

      await sendPasswordResetEmail({
        to: email,
        resetUrl,
      });
    }

    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("email provider is not configured")) {
      return NextResponse.json(
        { error: "El servicio SMTP no esta configurado en el servidor." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "No se pudo procesar la solicitud. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
