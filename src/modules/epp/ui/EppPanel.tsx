"use client";

import { useEffect, useMemo, useState } from "react";

import { Alert } from "@/components/Alert";

type Worker = {
  id: string;
  workerCode: number;
  fullName: string;
  status: "ACTIVE" | "INACTIVE";
};

type Delivery = {
  id: string;
  deliveredAt: string;
  equipment: string;
  quantity: number;
  deliveredBy: string | null;
  notes: string | null;
  deliveryPhotoUrl: string | null;
  worker: {
    id: string;
    workerCode: number;
    fullName: string;
  };
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

export default function EppPanel() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [workerId, setWorkerId] = useState("");
  const [equipment, setEquipment] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [deliveredBy, setDeliveredBy] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveredAt, setDeliveredAt] = useState("");
  const [deliveryPhotoUrl, setDeliveryPhotoUrl] = useState("");
  const [uploadingDeliveryPhoto, setUploadingDeliveryPhoto] = useState(false);

  const activeWorkers = useMemo(() => workers.filter((w) => w.status === "ACTIVE"), [workers]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [workersRes, deliveriesRes] = await Promise.all([
        fetch("/api/workers", { cache: "no-store" }),
        fetch("/api/epp-deliveries", { cache: "no-store" }),
      ]);

      const workersData = await getJsonSafe<{ workers?: Worker[] }>(workersRes);
      const deliveriesData = await getJsonSafe<{ deliveries?: Delivery[] }>(deliveriesRes);

      if (!workersRes.ok) {
        setError(workersData.error ?? "No se pudo cargar trabajadores.");
        return;
      }
      if (!deliveriesRes.ok) {
        setError(deliveriesData.error ?? "No se pudo cargar entregas de EPP.");
        return;
      }

      setWorkers(workersData.workers ?? []);
      setDeliveries(deliveriesData.deliveries ?? []);
    } catch {
      setError("Error de conexion al cargar datos de EPP.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function uploadEppPhoto(file: File): Promise<string> {
    const signRes = await fetch("/api/uploads/cloudinary-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "epp_delivery" }),
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

  async function onDeliveryPhotoSelected(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen.");
      return;
    }

    setError(null);
    setSuccess(null);
    setUploadingDeliveryPhoto(true);
    try {
      const secureUrl = await uploadEppPhoto(file);
      setDeliveryPhotoUrl(secureUrl);
      setSuccess("Foto de entrega cargada.");
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Error al subir imagen.";
      setError(message);
    } finally {
      setUploadingDeliveryPhoto(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!workerId) {
      setError("Selecciona un trabajador activo.");
      return;
    }
    if (!equipment.trim() || equipment.trim().length < 2) {
      setError("Ingresa el equipo entregado.");
      return;
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      setError("La cantidad debe ser un entero mayor a 0.");
      return;
    }
    if (!deliveryPhotoUrl) {
      setError("Debes subir una foto del trabajador con el EPP entregado.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/epp-deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          equipment: equipment.trim(),
          quantity: parsedQty,
          deliveredBy: deliveredBy.trim() || undefined,
          notes: notes.trim() || undefined,
          deliveredAt: deliveredAt || undefined,
          deliveryPhotoUrl: deliveryPhotoUrl.trim(),
        }),
      });
      const data = await getJsonSafe<{ error?: string }>(res);

      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar la entrega de EPP.");
        return;
      }

      setSuccess("Entrega de EPP registrada correctamente.");
      setEquipment("");
      setQuantity("1");
      setDeliveredBy("");
      setNotes("");
      setDeliveredAt("");
      setDeliveryPhotoUrl("");
      await loadData();
    } catch {
      setError("Error de conexion al registrar EPP.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px,1fr]">
      <section className="rounded-2xl border border-[#dbe3ef] bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-[#0b1d3a]">Registrar entrega EPP</h1>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <select
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
          >
            <option value="">Selecciona trabajador activo</option>
            {activeWorkers.map((w) => (
              <option key={w.id} value={w.id}>
                #{w.workerCode} - {w.fullName}
              </option>
            ))}
          </select>

          <input
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Equipo entregado"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
          />

          <input
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Cantidad"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputMode="numeric"
          />

          <input
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Entregado por (opcional)"
            value={deliveredBy}
            onChange={(e) => setDeliveredBy(e.target.value)}
          />

          <input
            type="date"
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            value={deliveredAt}
            onChange={(e) => setDeliveredAt(e.target.value)}
          />

          <textarea
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Observaciones (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white"
            onChange={(e) => onDeliveryPhotoSelected(e.target.files?.[0] ?? null)}
          />
          {uploadingDeliveryPhoto ? (
            <p className="text-xs text-[#5f718c]">Subiendo foto de entrega...</p>
          ) : deliveryPhotoUrl ? (
            <a
              href={deliveryPhotoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[#2563eb]"
            >
              Ver foto de entrega cargada
            </a>
          ) : (
            <p className="text-xs text-[#5f718c]">Aun no se subio foto de entrega.</p>
          )}

          {error ? <Alert type="error" message={error} /> : null}
          {success ? <Alert type="success" message={success} /> : null}

          <button
            disabled={saving || uploadingDeliveryPhoto}
            type="submit"
            className="w-full rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Registrar entrega"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#dbe3ef] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0b1d3a]">Historial de entregas</h2>
        {loading ? (
          <p className="mt-4 text-sm text-[#5f718c]">Cargando...</p>
        ) : deliveries.length === 0 ? (
          <p className="mt-4 text-sm text-[#5f718c]">Aun no hay entregas registradas.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6ebf3] text-left text-[#5f718c]">
                  <th className="px-2 py-2">Fecha</th>
                  <th className="px-2 py-2">Trabajador</th>
                  <th className="px-2 py-2">Equipo</th>
                  <th className="px-2 py-2">Cantidad</th>
                  <th className="px-2 py-2">Responsable</th>
                  <th className="px-2 py-2">Foto</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="border-b border-[#f0f4f9]">
                    <td className="px-2 py-2">
                      {new Date(delivery.deliveredAt).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-2 py-2">
                      #{delivery.worker.workerCode} - {delivery.worker.fullName}
                    </td>
                    <td className="px-2 py-2">{delivery.equipment}</td>
                    <td className="px-2 py-2">{delivery.quantity}</td>
                    <td className="px-2 py-2">{delivery.deliveredBy ?? "-"}</td>
                    <td className="px-2 py-2">
                      {delivery.deliveryPhotoUrl ? (
                        <a
                          href={delivery.deliveryPhotoUrl}
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
