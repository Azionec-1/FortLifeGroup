import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveAuthCompanyContext } from "@/modules/shared/server/company-context";
import { type AuditCreateInput, validateAuditCreate } from "@/modules/audits/server/validation";

export async function GET() {
  try {
    const authContext = await resolveAuthCompanyContext();
    if (!authContext.ok) {
      return NextResponse.json({ error: authContext.error }, { status: authContext.status });
    }

    const audits = await prisma.auditRecord.findMany({
      where: { companyId: authContext.companyId },
      orderBy: [{ auditDate: "desc" }, { createdAt: "desc" }],
      take: 200,
      select: {
        id: true,
        activity: true,
        responsible: true,
        auditDate: true,
        details: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ audits }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "La base de datos no esta actualizada. Ejecuta migraciones y vuelve a intentar." },
          { status: 503 }
        );
      }
    }
    return NextResponse.json({ error: "No se pudo cargar auditorias." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authContext = await resolveAuthCompanyContext();
    if (!authContext.ok) {
      return NextResponse.json({ error: authContext.error }, { status: authContext.status });
    }

    const body = (await req.json()) as AuditCreateInput;
    const validation = validateAuditCreate(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const audit = await prisma.auditRecord.create({
      data: {
        companyId: authContext.companyId,
        activity: validation.data.activity,
        responsible: validation.data.responsible,
        auditDate: validation.data.auditDate,
        details: validation.data.details,
      },
      select: {
        id: true,
        activity: true,
        responsible: true,
        auditDate: true,
        details: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ audit }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "La base de datos no esta actualizada. Ejecuta migraciones y vuelve a intentar." },
          { status: 503 }
        );
      }
    }
    return NextResponse.json({ error: "No se pudo registrar la auditoria." }, { status: 500 });
  }
}
