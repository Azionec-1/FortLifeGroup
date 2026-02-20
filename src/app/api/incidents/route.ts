import { AttachmentType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { resolveAuthCompanyContext } from "@/modules/shared/server/company-context";
import {
  type IncidentCreateInput,
  validateIncidentCreate,
} from "@/modules/incidents/server/validation";

export async function GET() {
  try {
    const authContext = await resolveAuthCompanyContext();
    if (!authContext.ok) {
      return NextResponse.json({ error: authContext.error }, { status: authContext.status });
    }

    const incidents = await prisma.incidentRecord.findMany({
      where: { companyId: authContext.companyId },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
      take: 200,
      select: {
        id: true,
        occurredAt: true,
        activityAtTime: true,
        contractType: true,
        hoursWorkedBefore: true,
        procedureApplied: true,
        workerStatement: true,
        companyObservations: true,
        worker: {
          select: {
            id: true,
            workerCode: true,
            fullName: true,
          },
        },
        attachments: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ incidents }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "La base de datos no esta actualizada. Ejecuta migraciones y vuelve a intentar." },
          { status: 503 }
        );
      }
    }
    return NextResponse.json({ error: "No se pudieron cargar accidentes." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authContext = await resolveAuthCompanyContext();
    if (!authContext.ok) {
      return NextResponse.json({ error: authContext.error }, { status: authContext.status });
    }

    const body = (await req.json()) as IncidentCreateInput;
    const validation = validateIncidentCreate(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const worker = await prisma.worker.findFirst({
      where: {
        id: validation.data.workerId,
        companyId: authContext.companyId,
      },
      select: { id: true },
    });
    if (!worker) {
      return NextResponse.json({ error: "Trabajador no encontrado." }, { status: 404 });
    }

    const incident = await prisma.$transaction(async (tx) => {
      const created = await tx.incidentRecord.create({
        data: {
          companyId: authContext.companyId,
          workerId: validation.data.workerId,
          occurredAt: validation.data.occurredAt,
          activityAtTime: validation.data.activityAtTime,
          contractType: validation.data.contractType,
          hoursWorkedBefore: validation.data.hoursWorkedBefore,
          procedureApplied: validation.data.procedureApplied,
          workerStatement: validation.data.workerStatement,
          companyObservations: validation.data.companyObservations,
        },
        select: {
          id: true,
          occurredAt: true,
          activityAtTime: true,
          contractType: true,
          hoursWorkedBefore: true,
          procedureApplied: true,
          workerStatement: true,
          companyObservations: true,
          worker: {
            select: {
              id: true,
              workerCode: true,
              fullName: true,
            },
          },
        },
      });

      const attachments: { incidentId: string; type: AttachmentType; fileUrl: string }[] = [];
      if (validation.data.accidentPhotoUrl) {
        attachments.push({
          incidentId: created.id,
          type: AttachmentType.INCIDENT_ACCIDENT,
          fileUrl: validation.data.accidentPhotoUrl,
        });
      }
      if (validation.data.areaPhotoUrl) {
        attachments.push({
          incidentId: created.id,
          type: AttachmentType.INCIDENT_AREA,
          fileUrl: validation.data.areaPhotoUrl,
        });
      }
      if (validation.data.workTypePhotoUrl) {
        attachments.push({
          incidentId: created.id,
          type: AttachmentType.INCIDENT_WORK_TYPE,
          fileUrl: validation.data.workTypePhotoUrl,
        });
      }

      if (attachments.length > 0) {
        await tx.incidentAttachment.createMany({ data: attachments });
      }

      return created;
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "La base de datos no esta actualizada. Ejecuta migraciones y vuelve a intentar." },
          { status: 503 }
        );
      }
    }
    return NextResponse.json({ error: "No se pudo registrar el accidente." }, { status: 500 });
  }
}
