// src/app/api/users/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { validateRegisterInput } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name ?? "");
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    // 1) Validación
    const validation = validateRegisterInput({ name, email, password });
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // 2) Evitar email duplicado
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 }
      );
    }

    // 3) Hash
    const passwordHash = await bcrypt.hash(password, 10);

    // 4) Crear usuario
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ocurrió un error al registrar. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
