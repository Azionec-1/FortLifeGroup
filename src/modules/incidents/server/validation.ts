import { ContractType } from "@prisma/client";

export type IncidentCreateInput = {
  workerId: string;
  occurredAt: string;
  activityAtTime: string;
  contractType: ContractType;
  hoursWorkedBefore?: number;
  procedureApplied: string;
  workerStatement: string;
  companyObservations?: string;
  accidentPhotoUrl?: string;
  areaPhotoUrl?: string;
  workTypePhotoUrl?: string;
};

type ValidationResult<T> = { ok: true; data: T } | { ok: false; message: string };

function parseOptionalUrl(value: string | undefined): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return raw;
  } catch {
    return null;
  }
}

export function validateIncidentCreate(
  input: IncidentCreateInput
): ValidationResult<{
  workerId: string;
  occurredAt: Date;
  activityAtTime: string;
  contractType: ContractType;
  hoursWorkedBefore: number | null;
  procedureApplied: string;
  workerStatement: string;
  companyObservations: string | null;
  accidentPhotoUrl: string | null;
  areaPhotoUrl: string | null;
  workTypePhotoUrl: string | null;
}> {
  const workerId = String(input.workerId ?? "").trim();
  const occurredAtRaw = String(input.occurredAt ?? "").trim();
  const activityAtTime = String(input.activityAtTime ?? "").trim();
  const procedureApplied = String(input.procedureApplied ?? "").trim();
  const workerStatement = String(input.workerStatement ?? "").trim();
  const companyObservations = String(input.companyObservations ?? "").trim();

  if (!workerId) return { ok: false, message: "Selecciona un trabajador." };
  if (!occurredAtRaw) return { ok: false, message: "La fecha del accidente es obligatoria." };
  if (!activityAtTime || activityAtTime.length < 3) {
    return { ok: false, message: "La actividad realizada debe tener al menos 3 caracteres." };
  }
  if (!procedureApplied || procedureApplied.length < 3) {
    return { ok: false, message: "El procedimiento aplicado debe tener al menos 3 caracteres." };
  }
  if (!workerStatement || workerStatement.length < 5) {
    return { ok: false, message: "La declaracion del trabajador debe tener al menos 5 caracteres." };
  }

  const occurredAt = new Date(occurredAtRaw);
  if (Number.isNaN(occurredAt.getTime())) {
    return { ok: false, message: "La fecha del accidente no es valida." };
  }

  if (!Object.values(ContractType).includes(input.contractType)) {
    return { ok: false, message: "El tipo de contrato no es valido." };
  }

  let hoursWorkedBefore: number | null = null;
  if (input.hoursWorkedBefore !== undefined && input.hoursWorkedBefore !== null) {
    const parsed = Number(input.hoursWorkedBefore);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 24) {
      return { ok: false, message: "Las horas trabajadas deben estar entre 0 y 24." };
    }
    hoursWorkedBefore = parsed;
  }

  const accidentPhotoUrl = parseOptionalUrl(input.accidentPhotoUrl);
  const areaPhotoUrl = parseOptionalUrl(input.areaPhotoUrl);
  const workTypePhotoUrl = parseOptionalUrl(input.workTypePhotoUrl);

  if (String(input.accidentPhotoUrl ?? "").trim() && !accidentPhotoUrl) {
    return { ok: false, message: "La URL de foto del accidente no es valida." };
  }
  if (String(input.areaPhotoUrl ?? "").trim() && !areaPhotoUrl) {
    return { ok: false, message: "La URL de foto del area no es valida." };
  }
  if (String(input.workTypePhotoUrl ?? "").trim() && !workTypePhotoUrl) {
    return { ok: false, message: "La URL de foto del tipo de trabajo no es valida." };
  }

  return {
    ok: true,
    data: {
      workerId,
      occurredAt,
      activityAtTime,
      contractType: input.contractType,
      hoursWorkedBefore,
      procedureApplied,
      workerStatement,
      companyObservations: companyObservations || null,
      accidentPhotoUrl,
      areaPhotoUrl,
      workTypePhotoUrl,
    },
  };
}
