// src/app/register/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import { isValidEmail, validatePassword } from "@/lib/validation";

type FormState = {
  name: string;
  email: string;
  password: string;
};

type RegisterErrorResponse = {
  error?: string;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--border)] bg-[rgba(14,45,70,0.66)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--placeholder)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(34,165,246,0.22)]";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clientValidationError = useMemo(() => {
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!name) return "El nombre es obligatorio.";
    if (name.length < 2) return "El nombre debe tener al menos 2 caracteres.";

    if (!email) return "El email es obligatorio.";
    if (!isValidEmail(email)) return "El email no tiene un formato valido.";

    const pwd = validatePassword(password);
    if (!pwd.ok) return pwd.message;

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
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data: RegisterErrorResponse = await res.json();

      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : "No se pudo registrar. Revisa los datos.";
        setError(message);
        return;
      }

      setSuccess("Cuenta creada. Ahora puedes iniciar sesion.");
      setTimeout(() => router.push("/login"), 700);
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
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(41,127,193,0.33),transparent_35%),radial-gradient(circle_at_85%_82%,rgba(25,93,150,0.26),transparent_31%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(125deg,rgba(4,14,25,0.94),rgba(6,22,36,0.9),rgba(8,27,43,0.86))]"
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 sm:px-8">
        <div className="grid w-full gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-[var(--border)] bg-[linear-gradient(150deg,rgba(7,32,53,0.95),rgba(11,55,88,0.88))] p-7 text-[var(--text-primary)] shadow-[0_24px_65px_rgba(0,0,0,0.52)] sm:p-8">
            <div className="inline-flex items-center rounded-2xl border border-[var(--border)] bg-white/5 px-3 py-2">
              <Image
                src="/fortlife-logo.svg"
                alt="FortLife Group"
                width={200}
                height={58}
                priority
              />
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              Registro para programas de seguridad y salud en el trabajo
            </h1>
            <p className="mt-3 text-sm text-[var(--text-secondary)] sm:text-base">
              Crea tu cuenta para gestionar asesorias SST, planes de prevencion y
              capacitaciones en un solo entorno.
            </p>
            <p className="mt-8 text-sm text-[var(--accent-soft)]">
              Asesoria SST | Prevencion de riesgos | Capacitaciones
            </p>
          </article>

          <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.52)] backdrop-blur-sm sm:p-8">
            <h2 className="text-3xl font-semibold text-[var(--text-primary)]">
              Crear cuenta
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Registrate para acceder al portal FortLife.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  Nombre
                </label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Tu nombre"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  Email
                </label>
                <input
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  Contrasena
                </label>
                <input
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimo 8 caracteres"
                  autoComplete="new-password"
                  type="password"
                />
                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  Minimo 8 caracteres.
                </p>
              </div>

              {error ? (
                <div className="rounded-xl border border-[rgba(210,63,63,0.45)] bg-[rgba(210,63,63,0.12)] p-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-xl border border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.12)] p-3 text-sm text-emerald-100">
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-[var(--button-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creando cuenta..." : "Registrarme"}
              </button>

              <p className="text-sm text-[var(--text-secondary)]">
                Ya tienes cuenta?{" "}
                <Link
                  className="font-semibold text-[var(--accent-soft)] transition hover:opacity-85"
                  href="/login"
                >
                  Inicia sesion
                </Link>
              </p>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
