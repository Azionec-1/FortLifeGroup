import { PrismaClient } from "@prisma/client";

import { seedCommercialBase } from "./seeds/core/commercial-base.mjs";

const prisma = new PrismaClient();

async function main() {
  await seedCommercialBase(prisma);
  console.log("Seed completado: servicios y planes base.");
}

main()
  .catch((error) => {
    console.error("Error en seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
