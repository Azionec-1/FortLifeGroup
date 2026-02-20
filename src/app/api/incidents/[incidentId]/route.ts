import { AttachmentType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  type IncidentCreateInput,
  validateIncidentCreate,
} from "@/modules/incidents/server/validation";
import { resolveAuthCompanyContext } from "@/modules/shared/server/company-context";

type IncidentRouteContext = {
  params: { incidentId: string } | Promise<{ incidentId: string }>;
};

const INCIDENT_ATTACHMENT_TYPES = [
  AttachmentType.INCIDENT_ACCIDENT,
  AttachmentType.INCIDENT_AREA,
  AttachmentType.INCIDENT_WORK_TYPE,
];

async function getIncidentId(context: IncidentRouteContext): Promise<string> {
  const params = await context.params;
  return String(params.incidentId ?? "").trim();
}

async function ensureCompanyIncident(incidentId: string, companyId: string) {
  return prisma.incidentRecord.findFirst({
    where: { id: incidentId, companyId },
    select: { id: true },
  });
}

function withPrismaError(error: unknown, fallbackMessage: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021" || error.code === "P2022") {
      return NextResponse.json(
        { error: "La base de datos no esta actualizada. Ejecuta migraciones y vuelve a intentar." },
        { status: 503 }
      );
    }
  }
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

export async function PUT(req: Request, context: IncidentRouteContext) {
  try {
    const authContext = await resolveAuthCompanyContext();
    if (!authContext.ok) {
      return NextResponse.json({ error: authContext.error }, { status: authContext.status });
    }

    const incidentId = await getIncidentId(context);
    if (!incidentId) {
      return NextResponse.json({ error: "Id de accidente invalido." }, { status: 400 });
    }

    const currentIncident = await ensureCompanyIncident(incidentId, authContext.companyId);
    if (!currentIncident) {
      return NextResponse.json({ error: "Accidente no encontrado." }, { status: 404 });
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
      await tx.incidentRecord.update({
        where: { id: incidentId },
        data: {
          workerId: validation.data.workerId,
          occurredAt: validation.data.occurredAt,
          activityAtTime: validation.data.activityAtTime,
          contractType: validation.data.contractType,
          hoursWorkedBefore: validation.data.hoursWorkedBefore,
          procedureApplied: validation.data.procedureApplied,
          workerStatement: validation.data.workerStatement,
          companyObservations: validation.data.companyObservations,
        },
      });

      await tx.incidentAttachment.deleteMany({
        where: { incidentId, type: { in: INCIDENT_ATTACHMENT_TYPES } },
      });

      const attachments: { incidentId: string; type: AttachmentType; fileUrl: string }[] = [];
      if (validation.data.accidentPhotoUrl) {
        attachments.push({
          incidentId,
          type: AttachmentType.INCIDENT_ACCIDENT,
          fileUrl: validation.data.accidentPhotoUrl,
        });
      }
      if (validation.data.areaPhotoUrl) {
        attachments.push({
          incidentId,
          type: AttachmentType.INCIDENT_AREA,
          fileUrl: validation.data.areaPhotoUrl,
        });
      }
      if (validation.data.workTypePhotoUrl) {
        attachments.push({
          incidentId,
          type: AttachmentType.INCIDENT_WORK_TYPE,
          fileUrl: validation.data.workTypePhotoUrl,
        });
      }

      if (attachments.length > 0) {
        await tx.incidentAttachment.createMany({ data: attachments });
      }

      return tx.incidentRecord.findUnique({
        where: { id: incidentId },
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
    });

    return NextResponse.json({ incident }, { status: 200 });
  } catch (error) {
    return withPrismaError(error, "No se pudo actualizar el accidente.");
  }
}

export async function DELETE(_req: Request, context: IncidentRouteContext) {
  try {
    const authContext = await resolveAuthCompanyContext();
    if (!authContext.ok) {
      return NextResponse.json({ error: authContext.error }, { status: authContext.status });
    }

    const incidentId = await getIncidentId(context);
    if (!incidentId) {
      return NextResponse.json({ error: "Id de accidente invalido." }, { status: 400 });
    }

    const currentIncident = await ensureCompanyIncident(incidentId, authContext.companyId);
    if (!currentIncident) {
      return NextResponse.json({ error: "Accidente no encontrado." }, { status: 404 });
    }

    await prisma.incidentRecord.delete({ where: { id: incidentId } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return withPrismaError(error, "No se pudo eliminar el accidente.");
  }
}
