"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert } from "@/components/Alert";

type Audit = {
  id: string;
  activity: string;
  responsible: string;
  auditDate: string;
  details: string | null;
};

type ApiResponse = {
  audits?: Audit[];
  error?: string;
};

async function getJsonSafe(res: Response): Promise<ApiResponse> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as ApiResponse;
  } catch {
    return { error: `Error inesperado del servidor (HTTP ${res.status}).` };
  }
}

export default function AuditsPanel() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [activity, setActivity] = useState("");
  const [responsible, setResponsible] = useState("");
  const [auditDate, setAuditDate] = useState("");
  const [details, setDetails] = useState("");

  const formError = useMemo(() => {
    if (!activity.trim() || activity.trim().length < 3) {
      return "La actividad debe tener al menos 3 caracteres.";
    }
    if (!responsible.trim() || responsible.trim().length < 3) {
      return "El responsable debe tener al menos 3 caracteres.";
    }
    if (!auditDate) {
      return "La fecha de auditoria es obligatoria.";
    }
    return null;
  }, [activity, responsible, auditDate]);

  const loadAudits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audits", { cache: "no-store" });
      const data = await getJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "No se pudo cargar auditorias.");
        return;
      }
      setAudits(data.audits ?? []);
    } catch {
      setError("Error de conexion al cargar auditorias.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAudits();
  }, [loadAudits]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formError) {
      setError(formError);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: activity.trim(),
          responsible: responsible.trim(),
          auditDate,
          details: details.trim() || undefined,
        }),
      });
      const data = await getJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar la auditoria.");
        return;
      }

      setSuccess("Auditoria registrada correctamente.");
      setActivity("");
      setResponsible("");
      setAuditDate("");
      setDetails("");
      await loadAudits();
    } catch {
      setError("Error de conexion al registrar auditoria.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[380px,1fr]">
      <section className="rounded-2xl border border-[#dbe3ef] bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-[#0b1d3a]">Nueva auditoria</h1>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Actividad realizada"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Responsable"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
          />
          <input
            type="date"
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            value={auditDate}
            onChange={(e) => setAuditDate(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Detalles (opcional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />

          {error ? <Alert type="error" message={error} /> : null}
          {success ? <Alert type="success" message={success} /> : null}

          <button
            disabled={saving}
            type="submit"
            className="w-full rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Registrar auditoria"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#dbe3ef] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0b1d3a]">Historial de auditorias</h2>
        {loading ? (
          <p className="mt-4 text-sm text-[#5f718c]">Cargando...</p>
        ) : audits.length === 0 ? (
          <p className="mt-4 text-sm text-[#5f718c]">Aun no hay auditorias registradas.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6ebf3] text-left text-[#5f718c]">
                  <th className="px-2 py-2">Fecha</th>
                  <th className="px-2 py-2">Actividad</th>
                  <th className="px-2 py-2">Responsable</th>
                  <th className="px-2 py-2">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit) => (
                  <tr key={audit.id} className="border-b border-[#f0f4f9]">
                    <td className="px-2 py-2">{new Date(audit.auditDate).toLocaleDateString("es-PE")}</td>
                    <td className="px-2 py-2">{audit.activity}</td>
                    <td className="px-2 py-2">{audit.responsible}</td>
                    <td className="px-2 py-2">{audit.details ?? "-"}</td>
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
