export type EppCreateInput = {
  workerId: string;
  equipment: string;
  quantity?: number;
  deliveredAt?: string;
  deliveredBy?: string;
  notes?: string;
  deliveryPhotoUrl?: string;
};

type ValidationResult<T> = { ok: true; data: T } | { ok: false; message: string };

export function validateEppCreate(input: EppCreateInput): ValidationResult<{
  workerId: string;
  equipment: string;
  quantity: number;
  deliveredAt: Date;
  deliveredBy: string | null;
  notes: string | null;
  deliveryPhotoUrl: string;
}> {
  const workerId = String(input.workerId ?? "").trim();
  const equipment = String(input.equipment ?? "").trim();
  const quantity = Number(input.quantity ?? 1);
  const deliveredAtRaw = String(input.deliveredAt ?? "").trim();
  const deliveredBy = String(input.deliveredBy ?? "").trim();
  const notes = String(input.notes ?? "").trim();
  const deliveryPhotoUrlRaw = String(input.deliveryPhotoUrl ?? "").trim();

  if (!workerId) return { ok: false, message: "Selecciona un trabajador." };
  if (!equipment || equipment.length < 2) {
    return { ok: false, message: "El equipo entregado debe tener al menos 2 caracteres." };
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, message: "La cantidad debe ser un numero entero mayor a 0." };
  }
  if (!deliveryPhotoUrlRaw) {
    return { ok: false, message: "Debes subir una foto del trabajador con el EPP entregado." };
  }

  let deliveryPhotoUrl: string;
  try {
    const parsedUrl = new URL(deliveryPhotoUrlRaw);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return { ok: false, message: "La URL de la foto de EPP no es valida." };
    }
    deliveryPhotoUrl = deliveryPhotoUrlRaw;
  } catch {
    return { ok: false, message: "La URL de la foto de EPP no es valida." };
  }

  const deliveredAt = deliveredAtRaw ? new Date(deliveredAtRaw) : new Date();
  if (Number.isNaN(deliveredAt.getTime())) {
    return { ok: false, message: "La fecha de entrega no es valida." };
  }

  return {
    ok: true,
    data: {
      workerId,
      equipment,
      quantity,
      deliveredAt,
      deliveredBy: deliveredBy || null,
      notes: notes || null,
      deliveryPhotoUrl,
    },
  };
}
