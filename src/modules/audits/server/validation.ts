export type AuditCreateInput = {
  activity: string;
  responsible: string;
  auditDate: string;
  details?: string;
};

type ValidationResult<T> = { ok: true; data: T } | { ok: false; message: string };

export function validateAuditCreate(input: AuditCreateInput): ValidationResult<{
  activity: string;
  responsible: string;
  auditDate: Date;
  details: string | null;
}> {
  const activity = String(input.activity ?? "").trim();
  const responsible = String(input.responsible ?? "").trim();
  const auditDateRaw = String(input.auditDate ?? "").trim();
  const details = String(input.details ?? "").trim();

  if (!activity || activity.length < 3) {
    return { ok: false, message: "La actividad debe tener al menos 3 caracteres." };
  }

  if (!responsible || responsible.length < 3) {
    return { ok: false, message: "El responsable debe tener al menos 3 caracteres." };
  }

  if (!auditDateRaw) {
    return { ok: false, message: "La fecha de auditoria es obligatoria." };
  }

  const auditDate = new Date(auditDateRaw);
  if (Number.isNaN(auditDate.getTime())) {
    return { ok: false, message: "La fecha de auditoria no es valida." };
  }

  return {
    ok: true,
    data: {
      activity,
      responsible,
      auditDate,
      details: details || null,
    },
  };
}
