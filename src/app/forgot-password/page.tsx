"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";

import { Alert } from "@/components/Alert";
import { isValidEmail } from "@/lib/validation";

const inputClass =
  "w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-4 py-2.5 text-lg text-[#22324d] outline-none transition placeholder:text-[#8a98ad] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f633]";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validationError = useMemo(() => {
    const normalized = email.trim();
    if (!normalized) return "El email es obligatorio.";
    if (!isValidEmail(normalized)) return "El email no tiene un formato válido.";
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

      setSuccess("Si el correo existe, enviaremos instrucciones para recuperar la contraseña.");
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f5f9] text-[#0a1f3d]">
      <header className="border-b border-[#dde3ec] bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/LogoFortlife.jpeg"
              alt="FortLife Group"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl object-cover"
              priority
            />
            <span className="text-3xl font-semibold text-[#111827]">FortLife Group</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-base font-medium text-[#4b5563] transition hover:text-[#0f172a]"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-base font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-[1.6rem] border border-[#dde3ec] bg-white p-5 shadow-[0_16px_30px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#eaf0fa]">
              <Image
                src="/LogoFortlife.jpeg"
                alt="FortLife Group"
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg object-cover"
              />
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-[#071a3a]">Recuperar contraseña</h1>
            <p className="mt-2 text-base text-[#556c8d]">
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-lg font-semibold text-[#1f3555]">Correo Electrónico</label>
              <input
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                type="email"
                placeholder="tu@ejemplo.com"
              />
            </div>

            {error ? <Alert type="error" message={error} /> : null}
            {success ? <Alert type="success" message={success} /> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#2563eb] px-4 py-2.5 text-xl font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              href="/login"
              className="text-base font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#051737] text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/LogoFortlife.jpeg"
                  alt="FortLife Group"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <span className="text-3xl font-semibold">FortLife Group</span>
              </div>
              <p className="mt-5 text-base leading-relaxed text-[#b4c3dd]">
                Líderes en soluciones de seguridad financiera y protección familiar en toda
                Latinoamérica.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Empresa</h4>
              <ul className="mt-4 space-y-3 text-base text-[#b4c3dd]">
                <li>Sobre Nosotros</li>
                <li>Carreras</li>
                <li>Prensa</li>
                <li>Contacto</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold">SST</h4>
              <ul className="mt-4 space-y-3 text-base text-[#b4c3dd]">
                <li>Normativa ISO 45001</li>
                <li>Matriz de Riesgos</li>
                <li>Protocolos COVID-19</li>
                <li>Planes de Emergencia</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Legal</h4>
              <ul className="mt-4 space-y-3 text-base text-[#b4c3dd]">
                <li>Privacidad</li>
                <li>Términos de Uso</li>
                <li>Cookies</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
