"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useMemo, useState } from "react";

import { Alert } from "@/components/Alert";
import { validatePassword } from "@/lib/validation";

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--border)] bg-[rgba(14,45,70,0.66)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--placeholder)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(34,165,246,0.22)]";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordFallback() {
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
          <p className="text-sm text-[var(--text-secondary)]">Cargando enlace de recuperacion...</p>
        </article>
      </section>
    </main>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validationError = useMemo(() => {
    const pwdValidation = validatePassword(password);
    if (!pwdValidation.ok) return pwdValidation.message;
    if (password !== confirmPassword) return "Las contrasenas no coinciden.";
    return null;
  }, [password, confirmPassword]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Token invalido.");
      return;
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo restablecer la contrasena.");
        return;
      }

      setSuccess("Contrasena actualizada. Redirigiendo a inicio de sesion...");
      setTimeout(() => router.push("/login"), 1200);
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
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Nueva contrasena</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Define una nueva contrasena para tu cuenta.
          </p>

          {!token ? (
            <div className="mt-6 space-y-4">
              <Alert type="error" message="El enlace no es valido o esta incompleto." />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4 transition hover:opacity-85"
              >
                Solicitar un nuevo enlace
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  Nueva contrasena
                </label>
                <input
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  type="password"
                  placeholder="Minimo 8 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  Confirmar contrasena
                </label>
                <input
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  type="password"
                  placeholder="Repite la contrasena"
                />
              </div>

              {error ? <Alert type="error" message={error} /> : null}
              {success ? <Alert type="success" message={success} /> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-[var(--button-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Actualizando..." : "Guardar nueva contrasena"}
              </button>
            </form>
          )}

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
