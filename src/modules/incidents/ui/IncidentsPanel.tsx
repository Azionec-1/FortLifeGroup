"use client";

import { AttachmentType, ContractType } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Alert } from "@/components/Alert";

type Worker = {
  id: string;
  workerCode: number;
  fullName: string;
};

type Incident = {
  id: string;
  occurredAt: string;
  activityAtTime: string;
  contractType: ContractType;
  hoursWorkedBefore: number | null;
  procedureApplied: string;
  workerStatement: string;
  companyObservations: string | null;
  worker: {
    id: string;
    workerCode: number;
    fullName: string;
  };
  attachments: {
    id: string;
    type: AttachmentType;
    fileUrl: string;
  }[];
};

type WorkersResponse = {
  workers?: Worker[];
  error?: string;
};

type IncidentsResponse = {
  incidents?: Incident[];
  error?: string;
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

type EditableIncidentForm = {
  workerId: string;
  occurredAt: string;
  activityAtTime: string;
  contractType: ContractType;
  hoursWorkedBefore: string;
  procedureApplied: string;
  workerStatement: string;
  companyObservations: string;
  accidentPhotoUrl: string;
  areaPhotoUrl: string;
  workTypePhotoUrl: string;
};

const EMPTY_EDIT_FORM: EditableIncidentForm = {
  workerId: "",
  occurredAt: "",
  activityAtTime: "",
  contractType: ContractType.INDEFINITE,
  hoursWorkedBefore: "",
  procedureApplied: "",
  workerStatement: "",
  companyObservations: "",
  accidentPhotoUrl: "",
  areaPhotoUrl: "",
  workTypePhotoUrl: "",
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

function toDateInputValue(dateIso: string): string {
  if (!dateIso) return "";
  return dateIso.slice(0, 10);
}

function attachmentUrlByType(incident: Incident, type: AttachmentType): string {
  return incident.attachments.find((item) => item.type === type)?.fileUrl ?? "";
}

export default function IncidentsPanel() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [workerId, setWorkerId] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [activityAtTime, setActivityAtTime] = useState("");
  const [contractType, setContractType] = useState<ContractType>(ContractType.INDEFINITE);
  const [hoursWorkedBefore, setHoursWorkedBefore] = useState("");
  const [procedureApplied, setProcedureApplied] = useState("");
  const [workerStatement, setWorkerStatement] = useState("");
  const [companyObservations, setCompanyObservations] = useState("");
  const [accidentPhotoUrl, setAccidentPhotoUrl] = useState("");
  const [areaPhotoUrl, setAreaPhotoUrl] = useState("");
  const [workTypePhotoUrl, setWorkTypePhotoUrl] = useState("");
  const [uploadingAccidentPhoto, setUploadingAccidentPhoto] = useState(false);
  const [uploadingAreaPhoto, setUploadingAreaPhoto] = useState(false);
  const [uploadingWorkTypePhoto, setUploadingWorkTypePhoto] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isEditingIncident, setIsEditingIncident] = useState(false);
  const [savingIncidentChanges, setSavingIncidentChanges] = useState(false);
  const [deletingIncident, setDeletingIncident] = useState(false);
  const [editIncidentForm, setEditIncidentForm] = useState<EditableIncidentForm>(EMPTY_EDIT_FORM);

  const formError = useMemo(() => {
    if (!workerId) return "Selecciona un trabajador.";
    if (!occurredAt) return "La fecha del accidente es obligatoria.";
    if (!activityAtTime.trim() || activityAtTime.trim().length < 3) {
      return "La actividad realizada debe tener al menos 3 caracteres.";
    }
    if (!procedureApplied.trim() || procedureApplied.trim().length < 3) {
      return "El procedimiento aplicado debe tener al menos 3 caracteres.";
    }
    if (!workerStatement.trim() || workerStatement.trim().length < 5) {
      return "La declaracion del trabajador debe tener al menos 5 caracteres.";
    }
    return null;
  }, [workerId, occurredAt, activityAtTime, procedureApplied, workerStatement]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [workersRes, incidentsRes] = await Promise.all([
        fetch("/api/workers", { cache: "no-store" }),
        fetch("/api/incidents", { cache: "no-store" }),
      ]);

      const workersData = await getJsonSafe<WorkersResponse>(workersRes);
      const incidentsData = await getJsonSafe<IncidentsResponse>(incidentsRes);

      if (!workersRes.ok) {
        setError(workersData.error ?? "No se pudieron cargar trabajadores.");
        return;
      }
      if (!incidentsRes.ok) {
        setError(incidentsData.error ?? "No se pudieron cargar accidentes.");
        return;
      }

      setWorkers(workersData.workers ?? []);
      setIncidents(incidentsData.incidents ?? []);
    } catch {
      setError("Error de conexion al cargar el modulo de accidentes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function uploadPhoto(
    kind: "incident_accident" | "incident_area" | "incident_work_type",
    file: File
  ): Promise<string> {
    const signRes = await fetch("/api/uploads/cloudinary-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
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

  async function onPhotoSelected(
    kind: "incident_accident" | "incident_area" | "incident_work_type",
    file: File | null
  ) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      if (kind === "incident_accident") setUploadingAccidentPhoto(true);
      if (kind === "incident_area") setUploadingAreaPhoto(true);
      if (kind === "incident_work_type") setUploadingWorkTypePhoto(true);

      const secureUrl = await uploadPhoto(kind, file);
      if (kind === "incident_accident") setAccidentPhotoUrl(secureUrl);
      if (kind === "incident_area") setAreaPhotoUrl(secureUrl);
      if (kind === "incident_work_type") setWorkTypePhotoUrl(secureUrl);
      setSuccess("Foto subida correctamente.");
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Error al subir imagen.";
      setError(message);
    } finally {
      if (kind === "incident_accident") setUploadingAccidentPhoto(false);
      if (kind === "incident_area") setUploadingAreaPhoto(false);
      if (kind === "incident_work_type") setUploadingWorkTypePhoto(false);
    }
  }

  function onOpenIncidentDetails(incident: Incident) {
    setSelectedIncident(incident);
    setIsEditingIncident(false);
    setEditIncidentForm({
      workerId: incident.worker.id,
      occurredAt: toDateInputValue(incident.occurredAt),
      activityAtTime: incident.activityAtTime,
      contractType: incident.contractType,
      hoursWorkedBefore:
        incident.hoursWorkedBefore === null || incident.hoursWorkedBefore === undefined
          ? ""
          : String(incident.hoursWorkedBefore),
      procedureApplied: incident.procedureApplied,
      workerStatement: incident.workerStatement,
      companyObservations: incident.companyObservations ?? "",
      accidentPhotoUrl: attachmentUrlByType(incident, AttachmentType.INCIDENT_ACCIDENT),
      areaPhotoUrl: attachmentUrlByType(incident, AttachmentType.INCIDENT_AREA),
      workTypePhotoUrl: attachmentUrlByType(incident, AttachmentType.INCIDENT_WORK_TYPE),
    });
  }

  function onCloseIncidentDetails() {
    setSelectedIncident(null);
    setIsEditingIncident(false);
    setSavingIncidentChanges(false);
    setDeletingIncident(false);
    setEditIncidentForm(EMPTY_EDIT_FORM);
  }

  async function onEditIncidentPhotoSelected(
    kind: "incident_accident" | "incident_area" | "incident_work_type",
    file: File | null
  ) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      if (kind === "incident_accident") setUploadingAccidentPhoto(true);
      if (kind === "incident_area") setUploadingAreaPhoto(true);
      if (kind === "incident_work_type") setUploadingWorkTypePhoto(true);

      const secureUrl = await uploadPhoto(kind, file);
      setEditIncidentForm((prev) => ({
        ...prev,
        accidentPhotoUrl: kind === "incident_accident" ? secureUrl : prev.accidentPhotoUrl,
        areaPhotoUrl: kind === "incident_area" ? secureUrl : prev.areaPhotoUrl,
        workTypePhotoUrl: kind === "incident_work_type" ? secureUrl : prev.workTypePhotoUrl,
      }));
      setSuccess("Foto actualizada correctamente.");
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Error al subir imagen.";
      setError(message);
    } finally {
      if (kind === "incident_accident") setUploadingAccidentPhoto(false);
      if (kind === "incident_area") setUploadingAreaPhoto(false);
      if (kind === "incident_work_type") setUploadingWorkTypePhoto(false);
    }
  }

  async function onSaveIncidentChanges() {
    if (!selectedIncident) return;

    setError(null);
    setSuccess(null);
    setSavingIncidentChanges(true);

    try {
      const res = await fetch(`/api/incidents/${selectedIncident.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: editIncidentForm.workerId,
          occurredAt: editIncidentForm.occurredAt,
          activityAtTime: editIncidentForm.activityAtTime.trim(),
          contractType: editIncidentForm.contractType,
          hoursWorkedBefore: editIncidentForm.hoursWorkedBefore.trim()
            ? Number(editIncidentForm.hoursWorkedBefore)
            : undefined,
          procedureApplied: editIncidentForm.procedureApplied.trim(),
          workerStatement: editIncidentForm.workerStatement.trim(),
          companyObservations: editIncidentForm.companyObservations.trim() || undefined,
          accidentPhotoUrl: editIncidentForm.accidentPhotoUrl.trim() || undefined,
          areaPhotoUrl: editIncidentForm.areaPhotoUrl.trim() || undefined,
          workTypePhotoUrl: editIncidentForm.workTypePhotoUrl.trim() || undefined,
        }),
      });

      const data = await getJsonSafe<{ incident?: Incident; error?: string }>(res);
      if (!res.ok || !data.incident) {
        setError(data.error ?? "No se pudo actualizar el accidente.");
        return;
      }

      const updatedIncident = data.incident;
      setIncidents((prev) =>
        prev.map((item) => (item.id === updatedIncident.id ? updatedIncident : item))
      );
      setSelectedIncident(updatedIncident);
      setIsEditingIncident(false);
      setSuccess("Accidente actualizado correctamente.");
    } catch {
      setError("Error de conexion al actualizar accidente.");
    } finally {
      setSavingIncidentChanges(false);
    }
  }

  async function onDeleteIncident() {
    if (!selectedIncident) return;
    const confirmed = window.confirm("Esta accion eliminara el accidente. Deseas continuar?");
    if (!confirmed) return;

    setError(null);
    setSuccess(null);
    setDeletingIncident(true);
    try {
      const res = await fetch(`/api/incidents/${selectedIncident.id}`, { method: "DELETE" });
      const data = await getJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        setError(data.error ?? "No se pudo eliminar el accidente.");
        return;
      }

      setIncidents((prev) => prev.filter((item) => item.id !== selectedIncident.id));
      onCloseIncidentDetails();
      setSuccess("Accidente eliminado correctamente.");
    } catch {
      setError("Error de conexion al eliminar accidente.");
    } finally {
      setDeletingIncident(false);
    }
  }

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
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          occurredAt,
          activityAtTime: activityAtTime.trim(),
          contractType,
          hoursWorkedBefore: hoursWorkedBefore.trim() ? Number(hoursWorkedBefore) : undefined,
          procedureApplied: procedureApplied.trim(),
          workerStatement: workerStatement.trim(),
          companyObservations: companyObservations.trim() || undefined,
          accidentPhotoUrl: accidentPhotoUrl.trim() || undefined,
          areaPhotoUrl: areaPhotoUrl.trim() || undefined,
          workTypePhotoUrl: workTypePhotoUrl.trim() || undefined,
        }),
      });

      const data = await getJsonSafe<{ error?: string }>(res);
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar el accidente.");
        return;
      }

      setSuccess("Accidente registrado correctamente.");
      setWorkerId("");
      setOccurredAt("");
      setActivityAtTime("");
      setContractType(ContractType.INDEFINITE);
      setHoursWorkedBefore("");
      setProcedureApplied("");
      setWorkerStatement("");
      setCompanyObservations("");
      setAccidentPhotoUrl("");
      setAreaPhotoUrl("");
      setWorkTypePhotoUrl("");
      await loadData();
    } catch {
      setError("Error de conexion al registrar accidente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[420px,1fr]">
      <section className="rounded-2xl border border-[#dbe3ef] bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-[#0b1d3a]">Registrar accidente</h1>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <select
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
          >
            <option value="">Selecciona trabajador</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                #{w.workerCode} - {w.fullName}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Actividad que realizaba"
            value={activityAtTime}
            onChange={(e) => setActivityAtTime(e.target.value)}
          />
          <select
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            value={contractType}
            onChange={(e) => setContractType(e.target.value as ContractType)}
          >
            {Object.values(ContractType).map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
          <input
            inputMode="decimal"
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Horas trabajadas antes del accidente (0-24)"
            value={hoursWorkedBefore}
            onChange={(e) => setHoursWorkedBefore(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Procedimiento aplicado"
            value={procedureApplied}
            onChange={(e) => setProcedureApplied(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Declaracion del trabajador"
            value={workerStatement}
            onChange={(e) => setWorkerStatement(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
            placeholder="Observaciones de la empresa (opcional)"
            value={companyObservations}
            onChange={(e) => setCompanyObservations(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white"
            onChange={(e) => onPhotoSelected("incident_accident", e.target.files?.[0] ?? null)}
          />
          {uploadingAccidentPhoto ? (
            <p className="text-xs text-[#5f718c]">Subiendo foto del accidente...</p>
          ) : accidentPhotoUrl ? (
            <p className="text-xs text-[#5f718c]">Foto del accidente cargada.</p>
          ) : null}
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white"
            onChange={(e) => onPhotoSelected("incident_area", e.target.files?.[0] ?? null)}
          />
          {uploadingAreaPhoto ? (
            <p className="text-xs text-[#5f718c]">Subiendo foto del area...</p>
          ) : areaPhotoUrl ? (
            <p className="text-xs text-[#5f718c]">Foto del area cargada.</p>
          ) : null}
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white"
            onChange={(e) => onPhotoSelected("incident_work_type", e.target.files?.[0] ?? null)}
          />
          {uploadingWorkTypePhoto ? (
            <p className="text-xs text-[#5f718c]">Subiendo foto del tipo de trabajo...</p>
          ) : workTypePhotoUrl ? (
            <p className="text-xs text-[#5f718c]">Foto del tipo de trabajo cargada.</p>
          ) : null}

          {error ? <Alert type="error" message={error} /> : null}
          {success ? <Alert type="success" message={success} /> : null}

          <button
            disabled={saving || uploadingAccidentPhoto || uploadingAreaPhoto || uploadingWorkTypePhoto}
            type="submit"
            className="w-full rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Registrar accidente"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#dbe3ef] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#0b1d3a]">Historial de accidentes</h2>
        {loading ? (
          <p className="mt-4 text-sm text-[#5f718c]">Cargando...</p>
        ) : incidents.length === 0 ? (
          <p className="mt-4 text-sm text-[#5f718c]">Aun no hay accidentes registrados.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e6ebf3] text-left text-[#5f718c]">
                  <th className="px-2 py-2">Fecha</th>
                  <th className="px-2 py-2">Trabajador</th>
                  <th className="px-2 py-2">Actividad</th>
                  <th className="px-2 py-2">Contrato</th>
                  <th className="px-2 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id} className="border-b border-[#f0f4f9]">
                    <td className="px-2 py-2">{new Date(incident.occurredAt).toLocaleDateString("es-PE")}</td>
                    <td className="px-2 py-2">
                      #{incident.worker.workerCode} - {incident.worker.fullName}
                    </td>
                    <td className="px-2 py-2">{incident.activityAtTime}</td>
                    <td className="px-2 py-2">{incident.contractType}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => onOpenIncidentDetails(incident)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#cbd6e5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0b1d3a] hover:bg-[#f2f6fb]"
                      >
                        <svg
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4"
                        >
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedIncident ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1d3a]/45 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-[#0b1d3a]">Detalle del accidente</h3>
              <button
                type="button"
                onClick={onCloseIncidentDetails}
                className="rounded-lg border border-[#d5dbe5] px-2.5 py-1 text-sm text-[#0b1d3a]"
              >
                Cerrar
              </button>
            </div>

            {!isEditingIncident ? (
              <div className="mt-4 grid gap-3 text-sm text-[#0b1d3a]">
                <p>
                  <span className="font-semibold">Fecha:</span>{" "}
                  {new Date(selectedIncident.occurredAt).toLocaleDateString("es-PE")}
                </p>
                <p>
                  <span className="font-semibold">Trabajador:</span> #{selectedIncident.worker.workerCode} -{" "}
                  {selectedIncident.worker.fullName}
                </p>
                <p>
                  <span className="font-semibold">Actividad:</span> {selectedIncident.activityAtTime}
                </p>
                <p>
                  <span className="font-semibold">Tipo de contrato:</span> {selectedIncident.contractType}
                </p>
                <p>
                  <span className="font-semibold">Horas antes del accidente:</span>{" "}
                  {selectedIncident.hoursWorkedBefore ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">Procedimiento aplicado:</span>{" "}
                  {selectedIncident.procedureApplied}
                </p>
                <p>
                  <span className="font-semibold">Declaracion del trabajador:</span>{" "}
                  {selectedIncident.workerStatement}
                </p>
                <p>
                  <span className="font-semibold">Observaciones empresa:</span>{" "}
                  {selectedIncident.companyObservations || "-"}
                </p>

                <div className="grid gap-2 sm:grid-cols-3">
                  {attachmentUrlByType(selectedIncident, AttachmentType.INCIDENT_ACCIDENT) ? (
                    <a
                      href={attachmentUrlByType(selectedIncident, AttachmentType.INCIDENT_ACCIDENT)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-[#dbe3ef] px-3 py-2 text-center font-semibold text-[#2563eb]"
                    >
                      Ver foto accidente
                    </a>
                  ) : (
                    <p className="rounded-xl border border-[#dbe3ef] px-3 py-2 text-center text-[#5f718c]">
                      Sin foto accidente
                    </p>
                  )}
                  {attachmentUrlByType(selectedIncident, AttachmentType.INCIDENT_AREA) ? (
                    <a
                      href={attachmentUrlByType(selectedIncident, AttachmentType.INCIDENT_AREA)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-[#dbe3ef] px-3 py-2 text-center font-semibold text-[#2563eb]"
                    >
                      Ver foto area
                    </a>
                  ) : (
                    <p className="rounded-xl border border-[#dbe3ef] px-3 py-2 text-center text-[#5f718c]">
                      Sin foto area
                    </p>
                  )}
                  {attachmentUrlByType(selectedIncident, AttachmentType.INCIDENT_WORK_TYPE) ? (
                    <a
                      href={attachmentUrlByType(selectedIncident, AttachmentType.INCIDENT_WORK_TYPE)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-[#dbe3ef] px-3 py-2 text-center font-semibold text-[#2563eb]"
                    >
                      Ver foto tipo trabajo
                    </a>
                  ) : (
                    <p className="rounded-xl border border-[#dbe3ef] px-3 py-2 text-center text-[#5f718c]">
                      Sin foto tipo trabajo
                    </p>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingIncident(true)}
                    className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={onDeleteIncident}
                    disabled={deletingIncident}
                    className="rounded-xl bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {deletingIncident ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <select
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
                  value={editIncidentForm.workerId}
                  onChange={(e) =>
                    setEditIncidentForm((prev) => ({ ...prev, workerId: e.target.value }))
                  }
                >
                  <option value="">Selecciona trabajador</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      #{w.workerCode} - {w.fullName}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
                  value={editIncidentForm.occurredAt}
                  onChange={(e) =>
                    setEditIncidentForm((prev) => ({ ...prev, occurredAt: e.target.value }))
                  }
                />
                <input
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
                  value={editIncidentForm.activityAtTime}
                  onChange={(e) =>
                    setEditIncidentForm((prev) => ({ ...prev, activityAtTime: e.target.value }))
                  }
                  placeholder="Actividad que realizaba"
                />
                <select
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
                  value={editIncidentForm.contractType}
                  onChange={(e) =>
                    setEditIncidentForm((prev) => ({
                      ...prev,
                      contractType: e.target.value as ContractType,
                    }))
                  }
                >
                  {Object.values(ContractType).map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
                <input
                  inputMode="decimal"
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
                  value={editIncidentForm.hoursWorkedBefore}
                  onChange={(e) =>
                    setEditIncidentForm((prev) => ({ ...prev, hoursWorkedBefore: e.target.value }))
                  }
                  placeholder="Horas trabajadas antes del accidente (0-24)"
                />
                <textarea
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
                  value={editIncidentForm.procedureApplied}
                  onChange={(e) =>
                    setEditIncidentForm((prev) => ({ ...prev, procedureApplied: e.target.value }))
                  }
                  placeholder="Procedimiento aplicado"
                />
                <textarea
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
                  value={editIncidentForm.workerStatement}
                  onChange={(e) =>
                    setEditIncidentForm((prev) => ({ ...prev, workerStatement: e.target.value }))
                  }
                  placeholder="Declaracion del trabajador"
                />
                <textarea
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm"
                  value={editIncidentForm.companyObservations}
                  onChange={(e) =>
                    setEditIncidentForm((prev) => ({
                      ...prev,
                      companyObservations: e.target.value,
                    }))
                  }
                  placeholder="Observaciones de la empresa (opcional)"
                />

                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white"
                  onChange={(e) =>
                    onEditIncidentPhotoSelected("incident_accident", e.target.files?.[0] ?? null)
                  }
                />
                {editIncidentForm.accidentPhotoUrl ? (
                  <a
                    href={editIncidentForm.accidentPhotoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#2563eb]"
                  >
                    Ver foto actual de accidente
                  </a>
                ) : (
                  <p className="text-xs text-[#5f718c]">Sin foto de accidente.</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white"
                  onChange={(e) =>
                    onEditIncidentPhotoSelected("incident_area", e.target.files?.[0] ?? null)
                  }
                />
                {editIncidentForm.areaPhotoUrl ? (
                  <a
                    href={editIncidentForm.areaPhotoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#2563eb]"
                  >
                    Ver foto actual de area
                  </a>
                ) : (
                  <p className="text-xs text-[#5f718c]">Sin foto de area.</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-3 file:py-1.5 file:text-white"
                  onChange={(e) =>
                    onEditIncidentPhotoSelected("incident_work_type", e.target.files?.[0] ?? null)
                  }
                />
                {editIncidentForm.workTypePhotoUrl ? (
                  <a
                    href={editIncidentForm.workTypePhotoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#2563eb]"
                  >
                    Ver foto actual de tipo de trabajo
                  </a>
                ) : (
                  <p className="text-xs text-[#5f718c]">Sin foto de tipo de trabajo.</p>
                )}

                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onSaveIncidentChanges}
                    disabled={
                      savingIncidentChanges ||
                      uploadingAccidentPhoto ||
                      uploadingAreaPhoto ||
                      uploadingWorkTypePhoto
                    }
                    className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {savingIncidentChanges ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingIncident(false)}
                    className="rounded-xl border border-[#d5dbe5] px-4 py-2 text-sm font-semibold text-[#0b1d3a]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
