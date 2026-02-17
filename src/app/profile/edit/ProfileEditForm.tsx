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
  "w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-4 py-2.5 text-lg text-[#22324d] outline-none transition placeholder:text-[#8a98ad] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f633]";

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
      return "Para cambiar la contraseña, debes ingresar tu contraseña actual.";
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

      const data: { error?: string } = await res.json();

      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : "No se pudo actualizar el perfil.";
        setError(msg);
        return;
      }

      setSuccess("Perfil actualizado correctamente.");

      const emailChanged = form.email.trim().toLowerCase() !== initialEmail.toLowerCase();
      const passwordChanged = form.newPassword.trim().length > 0;

      if (emailChanged || passwordChanged) {
      setSuccess("Perfil actualizado. Por seguridad, debes iniciar sesión de nuevo.");
        setTimeout(() => router.push("/logout"), 1200);
      } else {
        setTimeout(() => router.push("/profile"), 800);
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-lg font-semibold text-[#1f3555]">Nombre</label>
        <input
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          autoComplete="name"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-lg font-semibold text-[#1f3555]">Correo Electrónico</label>
        <input
          className={inputClass}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          autoComplete="email"
          type="email"
          placeholder="correo@empresa.com"
        />
      </div>

      <div className="space-y-3 rounded-xl border border-[#edf1f6] bg-[#f7f9fc] p-4">
        <p className="text-base font-semibold text-[#2563eb]">Cambiar contraseña (opcional)</p>

        <div>
          <label className="mb-1.5 block text-lg font-semibold text-[#1f3555]">Contraseña actual</label>
          <input
            className={inputClass}
            value={form.currentPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, currentPassword: e.target.value }))
            }
            autoComplete="current-password"
            type="password"
            placeholder="Necesaria si cambias contraseña"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-lg font-semibold text-[#1f3555]">Nueva contraseña</label>
          <input
            className={inputClass}
            value={form.newPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, newPassword: e.target.value }))
            }
            autoComplete="new-password"
            type="password"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
      </div>

      {error ? <Alert type="error" message={error} /> : null}
      {success ? <Alert type="success" message={success} /> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#2563eb] px-4 py-2.5 text-xl font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
