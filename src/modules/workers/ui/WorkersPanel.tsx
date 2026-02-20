"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert } from "@/components/Alert";

type Worker = {
  id: string;
  workerCode: number;
  fullName: string;
  dni: string | null;
  status: "ACTIVE" | "INACTIVE";
  initialSstTrainingCompleted: boolean;
  initialSstTrainingDate: string | null;
  initialSstTrainingPhotoUrl: string | null;
};

type CloudinarySignatureResponse = {
  cloudName?: string;
  apiKey?: string;
  timestamp?: number;
  folder?: string;
  signature?: string;
  error?: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

async function getJsonSafe<T>(res: Response): Promise<T & { error?: string }> {
  const text = await res.text();
  if (!text) return {} as T & { error?: string };
  try {
    return JSON.parse(text) as T & { error?: string };
  } catch {
    return { error: `Error inesperado del servidor (HTTP ${res.status}).` } as T & { error?: string };
  }
}

export default function WorkersPanel() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [initialSstTrainingCompleted, setInitialSstTrainingCompleted] = useState(false);
  const [initialSstTrainingDate, setInitialSstTrainingDate] = useState("");
  const [initialSstTrainingPhotoUrl, setInitialSstTrainingPhotoUrl] = useState("");
  const [uploadingTrainingPhoto, setUploadingTrainingPhoto] = useState(false);

  const formError = useMemo(() => {
    if (!fullName.trim() || fullName.trim().length < 3) {
      return "El nombre del trabajador debe tener al menos 3 caracteres.";
    }
    if (dni.trim() && !/^[0-9]{8,12}$/.test(dni.trim())) {
      return "El DNI debe tener entre 8 y 12 digitos.";
    }
    return null;
  }, [fullName, dni]);

  const loadWorkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workers", { cache: "no-store" });
      const data = await getJsonSafe<{ workers?: Worker[] }>(res);
      if (!res.ok) {
        setError(data.error ?? "No se pudo cargar trabajadores.");
        return;
      }
      setWorkers(data.workers ?? []);
    } catch {
      setError("Error de conexion al cargar trabajadores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  async function uploadTrainingPhoto(file: File): Promise<string> {
    const signRes = await fetch("/api/uploads/cloudinary-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "worker_training" }),
    });
    const signData = await getJsonSafe<CloudinarySignatureResponse>(signRes);
    if (!signRes.ok) {
      throw new Error(signData.error ?? "No se pudo obtener firma para subir imagen.");
    }
    if (
      !signData.cloudName ||
      !signData.apiKey ||
      !signData.timestamp ||
      !signData.folder ||
      !signData.signature
    ) {
      throw new Error("La respuesta de firma es incompleta.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signData.apiKey);
    formData.append("timestamp", String(signData.timestamp));
    formData.append("folder", signData.folder);
    formData.append("signature", signData.signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const uploadData = (await uploadRes.json()) as CloudinaryUploadResponse;
    if (!uploadRes.ok || !uploadData.secure_url) {
      throw new Error(uploadData.error?.message ?? "No se pudo subir imagen a Cloudinary.");
    }

    return uploadData.secure_url;
  }

  async function onTrainingPhotoSelected(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen.");
      return;
    }

    setError(null);
    setSuccess(null);
    setUploadingTrainingPhoto(true);
    try {
      const secureUrl = await uploadTrainingPhoto(file);
      setInitialSstTrainingPhotoUrl(secureUrl);
      setSuccess("Foto de capacitacion cargada.");
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Error al subir imagen.";
      setError(message);
    } finally {
      setUploadingTrainingPhoto(false);
    }
  }

  async function onCreateWorker(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formError) {
      setError(formError);
      return;
    }
    if (initialSstTrainingCompleted && !initialSstTrainingPhotoUrl) {
      setError("Debes subir una foto del trabajador recibiendo la capacitacion inicial.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          dni: dni.trim() || undefined,
          initialSstTrainingCompleted,
          initialSstTrainingDate: initialSstTrainingDate || undefined,
          initialSstTrainingPhotoUrl: initialSstTrainingPhotoUrl || undefined,
        }),
      });
      const data = await getJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar el trabajador.");
        return;
      }

      setSuccess("Trabajador registrado correctamente.");
      setFullName("");
      setDni("");
      setInitialSstTrainingCompleted(false);
      setInitialSstTrainingDate("");
      setInitialSstTrainingPhotoUrl("");
      await loadWorkers();
    } catch {
      setError("Error de conexion al registrar trabajador.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(worker: Worker) {
    setError(null);
    setSuccess(null);

    const nextStatus = worker.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch("/api/workers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: worker.id,
          status: nextStatus,
        }),
      });
      const data = await getJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        setError(data.error ?? "No se pudo actualizar el estado.");
        return;
      }

      setWorkers((prev) => prev.map((w) => (w.id === worker.id ? { ...w, status: nextStatus } : w)));
      setSuccess("Estado actualizado.");
    } catch {
      setError("Error de conexion al actualizar estado.");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px,1fr]">
      <section className="rounded-2xl border border-[#dbe3ef] bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-[#0b1d3a]">Nuevo trabajador</h1>
        <p className="mt-1 text-sm text-[#5f718c]">
          Se asigna automaticamente un ID correlativo legible (workerCode).
        </p>

        <form className="mt-4 space-y-3" onSubmit={onCreateWorker}>
          <input
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="DNI (opcional)"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-[#334d6c]">
            <input
              type="checkbox"
              checked={initialSstTrainingCompleted}
              onChange={(e) => setInitialSstTrainingCompleted(e.target.checked)}
            />
            Capacitacion inicial SST completada
          </label>
          <input
            type="date"
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            value={initialSstTrainingDate}
            onChange={(e) => setInitialSstTrainingDate(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white"
            onChange={(e) => onTrainingPhotoSelected(e.target.files?.[0] ?? null)}
          />
          {uploadingTrainingPhoto ? (
            <p className="text-xs text-[#5f718c]">Subiendo foto de capacitacion...</p>
          ) : initialSstTrainingPhotoUrl ? (
            <a
              href={initialSstTrainingPhotoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[#2563eb]"
            >
              Ver foto de capacitacion cargada
            </a>
          ) : (
            <p className="text-xs text-[#5f718c]">Aun no se subio foto de capacitacion.</p>
          )}

          {error ? <Alert type="error" message={error} /> : null}
          {success ? <Alert type="success" message={success} /> : null}

          <button
            disabled={saving || uploadingTrainingPhoto}
            type="submit"
            className="w-full rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Registrar trabajador"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#dbe3ef] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0b1d3a]">Listado de trabajadores</h2>
        {loading ? (
          <p className="mt-4 text-sm text-[#5f718c]">Cargando...</p>
        ) : workers.length === 0 ? (
          <p className="mt-4 text-sm text-[#5f718c]">Aun no hay trabajadores registrados.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6ebf3] text-left text-[#5f718c]">
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Nombre</th>
                  <th className="px-2 py-2">DNI</th>
                  <th className="px-2 py-2">Estado</th>
                  <th className="px-2 py-2">Foto capacitacion</th>
                  <th className="px-2 py-2">Accion</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id} className="border-b border-[#f0f4f9]">
                    <td className="px-2 py-2 font-semibold">#{worker.workerCode}</td>
                    <td className="px-2 py-2">{worker.fullName}</td>
                    <td className="px-2 py-2">{worker.dni ?? "-"}</td>
                    <td className="px-2 py-2">
                      {worker.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </td>
                    <td className="px-2 py-2">
                      {worker.initialSstTrainingPhotoUrl ? (
                        <a
                          href={worker.initialSstTrainingPhotoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[#2563eb]"
                        >
                          Ver foto
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => toggleStatus(worker)}
                        className="rounded-lg border border-[#c8d5e8] px-2 py-1 text-xs font-semibold"
                      >
                        {worker.status === "ACTIVE" ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
