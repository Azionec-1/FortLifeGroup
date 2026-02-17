"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";

import { isValidEmail } from "@/lib/validation";
import { Alert } from "@/components/Alert";

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--border)] bg-[rgba(14,45,70,0.66)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--placeholder)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(34,165,246,0.22)]";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validationError = useMemo(() => {
    const normalized = email.trim();
    if (!normalized) return "El email es obligatorio.";
    if (!isValidEmail(normalized)) return "El email no tiene un formato valido.";
    return null;
  }, [email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) {
        setError("No se pudo enviar la solicitud. Intenta nuevamente.");
        return;
      }

      setSuccess("Si el correo existe, enviaremos instrucciones para recuperar la contrasena.");
    } catch {
      setError("Error de conexion. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(41,127,193,0.33),transparent_34%),radial-gradient(circle_at_84%_80%,rgba(25,93,150,0.28),transparent_32%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(130deg,rgba(4,14,25,0.94),rgba(6,22,36,0.9),rgba(8,27,43,0.88))]"
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-10 sm:px-8">
        <article className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.52)] backdrop-blur-sm sm:p-8">
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Recuperar contrasena</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Ingresa tu email y te enviaremos un enlace para restablecer la contrasena.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)]">Email</label>
              <input
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                type="email"
                placeholder="correo@empresa.com"
              />
            </div>

            {error ? <Alert type="error" message={error} /> : null}
            {success ? <Alert type="success" message={success} /> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[var(--button-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>

          <div className="mt-6">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4 transition hover:opacity-85"
            >
              Volver a iniciar sesion
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
