export type WorkerCreateInput = {
  fullName: string;
  dni?: string;
  initialSstTrainingCompleted?: boolean;
  initialSstTrainingDate?: string;
  initialSstTrainingPhotoUrl?: string;
};

export type WorkerUpdateInput = {
  id: string;
  fullName?: string;
  dni?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  initialSstTrainingCompleted?: boolean;
  initialSstTrainingDate?: string | null;
  initialSstTrainingPhotoUrl?: string | null;
};

type ValidationResult<T> = { ok: true; data: T } | { ok: false; message: string };

function isValidDni(value: string) {
  return /^[0-9]{8,12}$/.test(value);
}

export function validateWorkerCreate(input: WorkerCreateInput): ValidationResult<{
  fullName: string;
  dni: string | null;
  initialSstTrainingCompleted: boolean;
  initialSstTrainingDate: Date | null;
  initialSstTrainingPhotoUrl: string | null;
}> {
  const fullName = String(input.fullName ?? "").trim();
  const dniRaw = String(input.dni ?? "").trim();
  const initialSstTrainingCompleted = Boolean(input.initialSstTrainingCompleted);
  const initialSstTrainingDateRaw = String(input.initialSstTrainingDate ?? "").trim();
  const initialSstTrainingPhotoUrlRaw = String(input.initialSstTrainingPhotoUrl ?? "").trim();

  if (!fullName || fullName.length < 3) {
    return { ok: false, message: "El nombre del trabajador debe tener al menos 3 caracteres." };
  }

  if (dniRaw && !isValidDni(dniRaw)) {
    return { ok: false, message: "El DNI debe tener entre 8 y 12 digitos numericos." };
  }
  let initialSstTrainingPhotoUrl: string | null = null;
  if (initialSstTrainingPhotoUrlRaw) {
    try {
      const parsedUrl = new URL(initialSstTrainingPhotoUrlRaw);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return { ok: false, message: "La foto de capacitacion inicial no es valida." };
      }
      initialSstTrainingPhotoUrl = initialSstTrainingPhotoUrlRaw;
    } catch {
      return { ok: false, message: "La foto de capacitacion inicial no es valida." };
    }
  }

  if (initialSstTrainingCompleted && !initialSstTrainingPhotoUrl) {
    return {
      ok: false,
      message: "Debes subir una foto del trabajador recibiendo la capacitacion inicial.",
    };
  }

  if (initialSstTrainingDateRaw) {
    const parsed = new Date(initialSstTrainingDateRaw);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, message: "La fecha de capacitacion inicial no es valida." };
    }
    return {
      ok: true,
      data: {
        fullName,
        dni: dniRaw || null,
        initialSstTrainingCompleted,
        initialSstTrainingDate: parsed,
        initialSstTrainingPhotoUrl,
      },
    };
  }

  return {
    ok: true,
    data: {
      fullName,
      dni: dniRaw || null,
      initialSstTrainingCompleted,
      initialSstTrainingDate: null,
      initialSstTrainingPhotoUrl,
    },
  };
}

export function validateWorkerUpdate(input: WorkerUpdateInput): ValidationResult<{
  id: string;
  fullName?: string;
  dni?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  initialSstTrainingCompleted?: boolean;
  initialSstTrainingDate?: Date | null;
  initialSstTrainingPhotoUrl?: string | null;
}> {
  const id = String(input.id ?? "").trim();
  if (!id) return { ok: false, message: "ID de trabajador requerido." };

  const data: {
    id: string;
    fullName?: string;
    dni?: string | null;
    status?: "ACTIVE" | "INACTIVE";
    initialSstTrainingCompleted?: boolean;
    initialSstTrainingDate?: Date | null;
    initialSstTrainingPhotoUrl?: string | null;
  } = { id };

  if (typeof input.fullName === "string") {
    const fullName = input.fullName.trim();
    if (!fullName || fullName.length < 3) {
      return { ok: false, message: "El nombre del trabajador debe tener al menos 3 caracteres." };
    }
    data.fullName = fullName;
  }

  if (input.dni !== undefined) {
    const dni = String(input.dni ?? "").trim();
    if (dni && !isValidDni(dni)) {
      return { ok: false, message: "El DNI debe tener entre 8 y 12 digitos numericos." };
    }
    data.dni = dni || null;
  }

  if (input.status !== undefined) {
    if (input.status !== "ACTIVE" && input.status !== "INACTIVE") {
      return { ok: false, message: "Estado de trabajador invalido." };
    }
    data.status = input.status;
  }

  if (input.initialSstTrainingCompleted !== undefined) {
    data.initialSstTrainingCompleted = Boolean(input.initialSstTrainingCompleted);
  }

  if (input.initialSstTrainingDate !== undefined) {
    if (input.initialSstTrainingDate === null) {
      data.initialSstTrainingDate = null;
    } else {
      const parsed = new Date(String(input.initialSstTrainingDate));
      if (Number.isNaN(parsed.getTime())) {
        return { ok: false, message: "La fecha de capacitacion inicial no es valida." };
      }
      data.initialSstTrainingDate = parsed;
    }
  }

  if (input.initialSstTrainingPhotoUrl !== undefined) {
    const photoRaw = String(input.initialSstTrainingPhotoUrl ?? "").trim();
    if (!photoRaw) {
      data.initialSstTrainingPhotoUrl = null;
    } else {
      try {
        const parsedUrl = new URL(photoRaw);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          return { ok: false, message: "La foto de capacitacion inicial no es valida." };
        }
        data.initialSstTrainingPhotoUrl = photoRaw;
      } catch {
        return { ok: false, message: "La foto de capacitacion inicial no es valida." };
      }
    }
  }

  if (data.initialSstTrainingCompleted === true && data.initialSstTrainingPhotoUrl === null) {
    return {
      ok: false,
      message: "Debes mantener una foto para la capacitacion inicial completada.",
    };
  }

  return { ok: true, data };
}
