import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const DEFAULT_COMPANY_ID = "fortlife-default-company";
const DEFAULT_COMPANY_NAME = "FortLife Group";

type AuthCompanyContextResult =
  | { ok: true; userId: string; companyId: string }
  | { ok: false; status: number; error: string };

export async function resolveAuthCompanyContext(): Promise<AuthCompanyContextResult> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return { ok: false, status: 401, error: "No autorizado. Inicia sesion nuevamente." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, companyId: true },
  });

  if (!user) {
    return { ok: false, status: 401, error: "Usuario no encontrado." };
  }

  if (user.companyId) {
    return { ok: true, userId: user.id, companyId: user.companyId };
  }

  const company = await prisma.company.upsert({
    where: { id: DEFAULT_COMPANY_ID },
    update: { name: DEFAULT_COMPANY_NAME },
    create: { id: DEFAULT_COMPANY_ID, name: DEFAULT_COMPANY_NAME },
    select: { id: true },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { companyId: company.id },
    select: { id: true },
  });

  return { ok: true, userId: user.id, companyId: company.id };
}
