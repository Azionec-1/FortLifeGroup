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
  "w-full rounded-xl border border-[#d5dbe5] bg-[#f5f7fb] px-4 py-2.5 text-lg text-[#22324d] outline-none transition placeholder:text-[#8a98ad] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f633]";

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
    if (!isValidEmail(email)) return "El email no tiene un formato válido.";

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

      setSuccess("Cuenta creada. Ahora puedes iniciar sesión.");
      setTimeout(() => router.push("/login"), 700);
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

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-[0_18px_35px_rgba(15,23,42,0.08)] sm:p-6">
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
            <h1 className="mt-3 text-4xl font-semibold text-[#071a3a]">Únete a FortLife Group</h1>
            <p className="mt-2 text-lg text-[#556c8d]">Crea tu cuenta y empieza a planificar tu futuro</p>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xl font-semibold text-[#1f3555]">Nombre</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Juan Pérez"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xl font-semibold text-[#1f3555]">Correo Electrónico</label>
              <input
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="tu@ejemplo.com"
                autoComplete="email"
                type="email"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xl font-semibold text-[#1f3555]">Contraseña</label>
              <input
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                type="password"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-[#f0b5b5] bg-[#fff2f2] p-3 text-base text-[#b42318]">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-base text-[#166534]">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#2563eb] px-4 py-2.5 text-xl font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)] transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creando cuenta..." : "Registrarme"}
            </button>

            <p className="pt-1 text-center text-base text-[#617792]">
              ¿Ya tienes cuenta?{" "}
              <Link className="font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]" href="/login">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
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
              <div className="mt-5 flex gap-3 text-[#95a8c9]">
                <span className="rounded-md border border-[#28416b] px-2 py-1 text-xs">FB</span>
                <span className="rounded-md border border-[#28416b] px-2 py-1 text-xs">X</span>
                <span className="rounded-md border border-[#28416b] px-2 py-1 text-xs">IG</span>
                <span className="rounded-md border border-[#28416b] px-2 py-1 text-xs">IN</span>
              </div>
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

          <div className="mt-10 border-t border-[#1d3357] pt-8 text-center text-sm text-[#9db1d4]">
            Copyright 2026 FortLife Group. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
