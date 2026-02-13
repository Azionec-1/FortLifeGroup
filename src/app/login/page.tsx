// src/app/login/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useMemo, useState } from "react";
import { signIn } from "next-auth/react";

import { isValidEmail } from "@/lib/validation";

type FormState = {
  email: string;
  password: string;
};

const inputClass =
  "mt-1 w-full rounded-xl border px-3 py-3 text-sm outline-none transition placeholder:text-[var(--placeholder)]";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageFallback() {
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
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-10">
        <section className="w-full max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.52)] backdrop-blur-sm sm:p-8">
          <p className="text-sm text-[var(--text-secondary)]">Cargando acceso...</p>
        </section>
      </div>
    </main>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const clientValidationError = useMemo(() => {
    const email = form.email.trim();
    const password = form.password;

    if (!email) return "El email es obligatorio.";
    if (!isValidEmail(email)) return "El email no tiene un formato valido.";
    if (!password) return "La contrasena es obligatoria.";

    return null;
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (clientValidationError) {
      setError(clientValidationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Email o contrasena incorrectos.");
        return;
      }

      router.push(callbackUrl);
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

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="rounded-2xl border border-[var(--border)] bg-white/5 px-3 py-2">
            <Image
              src="/fortlife-logo.svg"
              alt="FortLife Group"
              width={210}
              height={62}
              priority
            />
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            Portal de acceso SST
          </h1>
        </div>

        <section className="w-full max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.52)] backdrop-blur-sm sm:p-8">
          <h2 className="text-3xl font-semibold text-[var(--text-primary)]">Iniciar sesion</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Ingresa con tu cuenta para continuar con tus procesos de seguridad y salud.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Correo electronico
              </label>
              <input
                className={`${inputClass} border-[var(--border)] bg-[rgba(14,45,70,0.66)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(34,165,246,0.22)]`}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="nombre@empresa.com"
                autoComplete="email"
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Contrasena
              </label>
              <input
                className={`${inputClass} border-[var(--border)] bg-[rgba(14,45,70,0.66)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(34,165,246,0.22)]`}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="******"
                autoComplete="current-password"
                type="password"
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
                <input
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--border)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                Recordarme
              </label>
              <a
                href="#"
                className="font-medium text-[var(--accent-soft)] transition hover:opacity-85"
              >
                Olvidaste tu contrasena?
              </a>
            </div>

            {error ? (
              <div className="rounded-xl border border-[rgba(210,63,63,0.45)] bg-[rgba(210,63,63,0.12)] p-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-full bg-[var(--button-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>

            <p className="pt-2 text-center text-sm text-[var(--text-secondary)]">
              No tienes una cuenta?{" "}
              <Link
                className="font-semibold text-[var(--accent-soft)] transition hover:opacity-85"
                href="/register"
              >
                Solicitala aqui
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
