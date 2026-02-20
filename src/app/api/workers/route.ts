import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveAuthCompanyContext } from "@/modules/shared/server/company-context";
import {
  validateWorkerCreate,
  validateWorkerUpdate,
  type WorkerCreateInput,
  type WorkerUpdateInput,
} from "@/modules/workers/server/validation";

export async function GET() {
  try {
    const authContext = await resolveAuthCompanyContext();
    if (!authContext.ok) {
      return NextResponse.json({ error: authContext.error }, { status: authContext.status });
    }

    let workers;
    try {
      workers = await prisma.worker.findMany({
        where: { companyId: authContext.companyId },
        orderBy: [{ workerCode: "asc" }],
        select: {
          id: true,
          workerCode: true,
          fullName: true,
          dni: true,
          status: true,
          initialSstTrainingCompleted: true,
          initialSstTrainingDate: true,
          initialSstTrainingPhotoUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch {
      const legacyWorkers = await prisma.worker.findMany({
        where: { companyId: authContext.companyId },
        orderBy: [{ workerCode: "asc" }],
        select: {
          id: true,
          workerCode: true,
          fullName: true,
          dni: true,
          status: true,
          initialSstTrainingCompleted: true,
          initialSstTrainingDate: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      workers = legacyWorkers.map((worker) => ({
        ...worker,
        initialSstTrainingPhotoUrl: null,
      }));
    }

    return NextResponse.json({ workers }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "La base de datos no esta actualizada. Ejecuta migraciones y vuelve a intentar." },
          { status: 503 }
        );
      }
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: "No se pudo conectar a la base de datos. Verifica DATABASE_URL y DIRECT_URL." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "No se pudo cargar trabajadores." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authContext = await resolveAuthCompanyContext();
  if (!authContext.ok) {
    return NextResponse.json({ error: authContext.error }, { status: authContext.status });
  }

  try {
    const body = (await req.json()) as WorkerCreateInput;
    const validation = validateWorkerCreate(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const created = await prisma.$transaction(async (tx) => {
      if (validation.data.dni) {
        const existingDni = await tx.worker.findFirst({
          where: { companyId: authContext.companyId, dni: validation.data.dni },
          select: { id: true },
        });
        if (existingDni) {
          throw new Error("DNI_ALREADY_EXISTS");
        }
      }

      const lastWorker = await tx.worker.findFirst({
        where: { companyId: authContext.companyId },
        orderBy: { workerCode: "desc" },
        select: { workerCode: true },
      });

      const nextWorkerCode = (lastWorker?.workerCode ?? 0) + 1;
      return tx.worker.create({
        data: {
          companyId: authContext.companyId,
          workerCode: nextWorkerCode,
          fullName: validation.data.fullName,
          dni: validation.data.dni,
          initialSstTrainingCompleted: validation.data.initialSstTrainingCompleted,
          initialSstTrainingDate: validation.data.initialSstTrainingDate,
          initialSstTrainingPhotoUrl: validation.data.initialSstTrainingPhotoUrl,
        },
        select: {
          id: true,
          workerCode: true,
          fullName: true,
          dni: true,
          status: true,
          initialSstTrainingCompleted: true,
          initialSstTrainingDate: true,
          initialSstTrainingPhotoUrl: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json({ worker: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "La base de datos no esta actualizada. Ejecuta migraciones y vuelve a intentar." },
          { status: 503 }
        );
      }
    }

    if (error instanceof Error && error.message === "DNI_ALREADY_EXISTS") {
      return NextResponse.json({ error: "Ya existe un trabajador con ese DNI." }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo registrar el trabajador." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authContext = await resolveAuthCompanyContext();
  if (!authContext.ok) {
    return NextResponse.json({ error: authContext.error }, { status: authContext.status });
  }

  try {
    const body = (await req.json()) as WorkerUpdateInput;
    const validation = validateWorkerUpdate(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const existing = await prisma.worker.findFirst({
      where: { id: validation.data.id, companyId: authContext.companyId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Trabajador no encontrado." }, { status: 404 });
    }

    if (validation.data.dni) {
      const duplicated = await prisma.worker.findFirst({
        where: {
          companyId: authContext.companyId,
          dni: validation.data.dni,
          id: { not: validation.data.id },
        },
        select: { id: true },
      });
      if (duplicated) {
        return NextResponse.json({ error: "Ese DNI ya esta asociado a otro trabajador." }, { status: 409 });
      }
    }

    const updated = await prisma.worker.update({
      where: { id: validation.data.id },
      data: {
        fullName: validation.data.fullName,
        dni: validation.data.dni,
        status: validation.data.status,
        initialSstTrainingCompleted: validation.data.initialSstTrainingCompleted,
        initialSstTrainingDate: validation.data.initialSstTrainingDate,
        initialSstTrainingPhotoUrl: validation.data.initialSstTrainingPhotoUrl,
      },
      select: {
        id: true,
        workerCode: true,
        fullName: true,
        dni: true,
        status: true,
        initialSstTrainingCompleted: true,
        initialSstTrainingDate: true,
        initialSstTrainingPhotoUrl: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ worker: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "La base de datos no esta actualizada. Ejecuta migraciones y vuelve a intentar." },
          { status: 503 }
        );
      }
    }
    return NextResponse.json(
      { error: "No se pudo actualizar el trabajador." },
      { status: 500 }
    );
  }
}
