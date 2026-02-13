// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

/**
 * En desarrollo, Next.js hace hot-reload constantemente.
 * Si creamos una nueva instancia de Prisma en cada reload,
 * se generan demasiadas conexiones.
 *
 * Este patrón evita ese problema.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
