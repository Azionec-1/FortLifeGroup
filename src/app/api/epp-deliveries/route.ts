import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveAuthCompanyContext } from "@/modules/shared/server/company-context";
import { validateEppCreate, type EppCreateInput } from "@/modules/epp/server/validation";

export async function GET(req: Request) {
  try {
    const authContext = await resolveAuthCompanyContext();
    if (!authContext.ok) {
      return NextResponse.json({ error: authContext.error }, { status: authContext.status });
    }

    const url = new URL(req.url);
    const workerId = url.searchParams.get("workerId")?.trim();

    let deliveries;
    try {
      deliveries = await prisma.eppDelivery.findMany({
        where: {
          companyId: authContext.companyId,
          ...(workerId ? { workerId } : {}),
        },
        orderBy: [{ deliveredAt: "desc" }, { createdAt: "desc" }],
        take: 200,
        select: {
          id: true,
          deliveredAt: true,
          equipment: true,
          quantity: true,
          deliveredBy: true,
          notes: true,
          deliveryPhotoUrl: true,
          worker: {
            select: {
              id: true,
              workerCode: true,
              fullName: true,
            },
          },
        },
      });
    } catch {
      const legacyDeliveries = await prisma.eppDelivery.findMany({
        where: {
          companyId: authContext.companyId,
          ...(workerId ? { workerId } : {}),
        },
        orderBy: [{ deliveredAt: "desc" }, { createdAt: "desc" }],
        take: 200,
        select: {
          id: true,
          deliveredAt: true,
          equipment: true,
          quantity: true,
          deliveredBy: true,
          notes: true,
          worker: {
            select: {
              id: true,
              workerCode: true,
              fullName: true,
            },
          },
        },
      });
      deliveries = legacyDeliveries.map((delivery) => ({
        ...delivery,
        deliveryPhotoUrl: null,
      }));
    }

    return NextResponse.json({ deliveries }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "La base de datos no esta actualizada. Ejecuta migraciones y vuelve a intentar." },
          { status: 503 }
        );
      }
    }
    return NextResponse.json({ error: "No se pudo cargar entregas de EPP." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authContext = await resolveAuthCompanyContext();
  if (!authContext.ok) {
    return NextResponse.json({ error: authContext.error }, { status: authContext.status });
  }

  try {
    const body = (await req.json()) as EppCreateInput;
    const validation = validateEppCreate(body);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const worker = await prisma.worker.findFirst({
      where: {
        id: validation.data.workerId,
        companyId: authContext.companyId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!worker) {
      return NextResponse.json({ error: "Trabajador no encontrado." }, { status: 404 });
    }
    if (worker.status !== "ACTIVE") {
      return NextResponse.json({ error: "Solo se permite registrar EPP para trabajadores activos." }, { status: 400 });
    }

    const created = await prisma.eppDelivery.create({
      data: {
        companyId: authContext.companyId,
        workerId: validation.data.workerId,
        deliveredAt: validation.data.deliveredAt,
        equipment: validation.data.equipment,
        quantity: validation.data.quantity,
        deliveredBy: validation.data.deliveredBy,
        notes: validation.data.notes,
        deliveryPhotoUrl: validation.data.deliveryPhotoUrl,
      },
      select: {
        id: true,
        deliveredAt: true,
        equipment: true,
        quantity: true,
        deliveredBy: true,
        notes: true,
        deliveryPhotoUrl: true,
        worker: {
          select: {
            id: true,
            workerCode: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({ delivery: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "La base de datos no esta actualizada. Ejecuta migraciones y vuelve a intentar." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({ error: "No se pudo registrar la entrega de EPP." }, { status: 500 });
  }
}
