"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/Alert";
import { validateProfileUpdateInput } from "@/lib/validation";

type Props = {
  initialName: string;
  initialEmail: string;
};

type FormState = {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--border)] bg-[rgba(14,45,70,0.66)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--placeholder)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(34,165,246,0.22)]";

export default function ProfileEditForm({ initialName, initialEmail }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: initialName,
    email: initialEmail,
    currentPassword: "",
    newPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clientValidationError = useMemo(() => {
    const v = validateProfileUpdateInput({
      name: form.name,
      email: form.email,
      newPassword: form.newPassword.trim() ? form.newPassword : undefined,
    });

    if (!v.ok) return v.message;

    if (form.newPassword.trim().length > 0 && form.currentPassword.trim().length === 0) {
      return "Para cambiar la contrasena, debes ingresar tu contrasena actual.";
    }

    return null;
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (clientValidationError) {
      setError(clientValidationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          currentPassword: form.currentPassword,
          newPassword: form.newPassword.trim() ? form.newPassword : undefined,
        }),
      });

      const data: any = await res.json();

      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : "No se pudo actualizar el perfil.";
        setError(msg);
        return;
      }

      setSuccess("Perfil actualizado correctamente.");

      const emailChanged = form.email.trim().toLowerCase() !== initialEmail.toLowerCase();
      const passwordChanged = form.newPassword.trim().length > 0;

      if (emailChanged || passwordChanged) {
        setSuccess("Perfil actualizado. Por seguridad, debes iniciar sesion de nuevo.");
        setTimeout(() => router.push("/logout"), 1200);
      } else {
        setTimeout(() => router.push("/profile"), 800);
      }
    } catch {
      setError("Error de conexion. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)]">Nombre</label>
        <input
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          autoComplete="name"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)]">Email</label>
        <input
          className={inputClass}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          autoComplete="email"
          type="email"
          placeholder="correo@empresa.com"
        />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[rgba(8,27,44,0.72)] p-4 space-y-3">
        <p className="text-sm font-semibold text-[var(--accent-soft)]">Cambiar contrasena (opcional)</p>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)]">Contrasena actual</label>
          <input
            className={inputClass}
            value={form.currentPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, currentPassword: e.target.value }))
            }
            autoComplete="current-password"
            type="password"
            placeholder="Necesaria si cambias contrasena"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)]">Nueva contrasena</label>
          <input
            className={inputClass}
            value={form.newPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, newPassword: e.target.value }))
            }
            autoComplete="new-password"
            type="password"
            placeholder="Minimo 8 caracteres"
          />
        </div>
      </div>

      {error ? <Alert type="error" message={error} /> : null}
      {success ? <Alert type="success" message={success} /> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[var(--button-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
