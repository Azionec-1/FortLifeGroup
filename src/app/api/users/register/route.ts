// src/app/api/users/register/route.ts
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { validateRegisterInput } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name ?? "");
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    const validation = validateRegisterInput({ name, email, password });
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: "No se pudo conectar a la base de datos. Verifica DATABASE_URL y DIRECT_URL." },
        { status: 503 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P1001" || error.code === "P1002" || error.code === "P1017") {
        return NextResponse.json(
          { error: "No hay conexion con la base de datos. Intenta nuevamente en unos minutos." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Ocurrio un error al registrar. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
