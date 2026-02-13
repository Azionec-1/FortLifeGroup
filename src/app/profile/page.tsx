// src/app/profile/page.tsx
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/current-user";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(41,127,193,0.33),transparent_35%),radial-gradient(circle_at_85%_82%,rgba(25,93,150,0.26),transparent_32%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(125deg,rgba(4,14,25,0.94),rgba(6,22,36,0.9),rgba(8,27,43,0.86))]"
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 sm:px-8">
        <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.52)] backdrop-blur-sm sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-2xl border border-[var(--border)] bg-white/5 px-3 py-2">
                <Image
                  src="/fortlife-logo.svg"
                  alt="FortLife Group"
                  width={200}
                  height={58}
                  priority
                />
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
                Detalles de perfil
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">
                Informacion actual de tu cuenta y acceso al modulo de edicion.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[rgba(8,27,44,0.72)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              Ultima actualizacion: {user.createdAt.toLocaleDateString()}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-[var(--border)] bg-[rgba(8,27,44,0.72)] p-5">
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--accent-soft)]">
                Nombre
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                {user.name ?? "Sin nombre"}
              </p>
            </article>

            <article className="rounded-2xl border border-[var(--border)] bg-[rgba(8,27,44,0.72)] p-5">
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--accent-soft)]">
                Email
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                {user.email}
              </p>
            </article>

            <article className="rounded-2xl border border-[var(--border)] bg-[rgba(8,27,44,0.72)] p-5">
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--accent-soft)]">
                Cuenta creada
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                {user.createdAt.toLocaleString()}
              </p>
            </article>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/profile/edit"
              className="inline-flex items-center justify-center rounded-full bg-[var(--button-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Editar perfil
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white/5 px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent-soft)]"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
