// src/lib/current-user.ts
import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  try {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase();

    if (!email) return null;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (e) {
    // Si algo falla (auth/cookies/prisma), devolvemos null
    // para que /profile redirija a /login sin romper el render.
    return null;
  }
}
