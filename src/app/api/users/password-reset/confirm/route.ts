import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { hashPasswordResetToken } from "@/lib/password-reset";
import { validatePassword } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawToken = String(body?.token ?? "").trim();
    const newPassword = String(body?.password ?? "");

    if (!rawToken) {
      return NextResponse.json({ error: "Token invalido." }, { status: 400 });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.ok) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(rawToken);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token invalido o expirado." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Token invalido o expirado." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          email: resetToken.email,
          id: { not: resetToken.id },
        },
      }),
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo restablecer la contrasena. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
