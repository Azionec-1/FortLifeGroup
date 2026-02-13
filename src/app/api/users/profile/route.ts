// src/app/api/users/profile/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateProfileUpdateInput } from "@/lib/validation";

/**
 * PUT /api/users/profile
 * Body:
 * {
 *   name: string,
 *   email: string,
 *   currentPassword?: string,
 *   newPassword?: string
 * }
 */
export async function PUT(req: Request) {
  try {
    // 1) Verificar autenticación (JWT)
    const session = await auth();
    const sessionEmail = session?.user?.email?.toLowerCase();

    if (!sessionEmail) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión nuevamente." },
        { status: 401 }
      );
    }

    // 2) Leer body
    const body = await req.json();

    const name = String(body?.name ?? "");
    const email = String(body?.email ?? "").trim().toLowerCase();
    const currentPassword = String(body?.currentPassword ?? "");
    const newPassword =
      typeof body?.newPassword === "string" ? body.newPassword : undefined;

    // 3) Validación
    const validation = validateProfileUpdateInput({
      name,
      email,
      newPassword,
    });

    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // 4) Obtener usuario actual desde DB usando el email de la sesión
    const user = await prisma.user.findUnique({
      where: { email: sessionEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado. Inicia sesión nuevamente." },
        { status: 401 }
      );
    }

    // 5) Si el email cambió, prevenir duplicados
    if (email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: "Ese email ya está en uso por otra cuenta." },
          { status: 409 }
        );
      }
    }

    // 6) Si quiere cambiar contraseña:
    // - debe enviar currentPassword
    // - verificamos bcrypt
    // - guardamos nuevo hash
    let passwordHashToSave: string | undefined = undefined;

    if (newPassword && newPassword.trim().length > 0) {
      if (!currentPassword || currentPassword.trim().length === 0) {
        return NextResponse.json(
          { error: "Debes ingresar tu contraseña actual para cambiarla." },
          { status: 400 }
        );
      }

      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "Tu cuenta no tiene contraseña local configurada." },
          { status: 400 }
        );
      }

      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) {
        return NextResponse.json(
          { error: "La contraseña actual es incorrecta." },
          { status: 400 }
        );
      }

      passwordHashToSave = await bcrypt.hash(newPassword, 10);
    }

    // 7) Actualizar usuario
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        email,
        ...(passwordHashToSave ? { passwordHash: passwordHashToSave } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    });

    /**
     * IMPORTANTE (JWT):
     * Si cambiaste el email, el JWT anterior aún puede tener el email viejo.
     * En el siguiente paso podemos forzar re-login, o refrescar sesión.
     * Por ahora devolvemos "updated" y el front redirige.
     */
    return NextResponse.json({ user: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Ocurrió un error al actualizar el perfil." },
      { status: 500 }
    );
  }
}
