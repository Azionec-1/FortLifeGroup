// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";

const focusAreas = [
  {
    title: "Asesoria SST",
    description: "Diagnostico, implementacion y acompanamiento normativo para empresas.",
  },
  {
    title: "Prevencion de riesgos",
    description: "Planes operativos para reducir incidentes y proteger al personal.",
  },
  {
    title: "Capacitaciones",
    description: "Formacion practica en seguridad y salud para todos los niveles.",
  },
];

const impactMetrics = [
  { label: "Riesgos intervenidos", value: "320+" },
  { label: "Empresas asesoradas", value: "95" },
  { label: "Horas de capacitacion", value: "2,400" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(41,127,193,0.32),transparent_36%),radial-gradient(circle_at_82%_78%,rgba(25,93,150,0.26),transparent_34%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(120deg,rgba(4,15,27,0.9),rgba(6,23,38,0.88),rgba(9,31,51,0.82))]"
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-12 sm:px-8 lg:px-10">
        <div className="w-full rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-7 shadow-[0_28px_70px_rgba(0,0,0,0.48)] backdrop-blur-sm sm:p-10 lg:p-12">
          <div className="grid gap-7 lg:grid-cols-[1.22fr_0.78fr]">
            <div>
              <div className="inline-flex items-center rounded-2xl border border-[var(--border)] bg-white/5 px-3 py-2">
                <Image
                  src="/fortlife-logo.svg"
                  alt="FortLife Group"
                  width={220}
                  height={66}
                  priority
                />
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
                Seguridad y salud laboral con decisiones basadas en prevencion
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                Centraliza la asesoria SST, los planes de prevencion y la capacitacion
                de equipos en una sola plataforma para mantener entornos de trabajo
                mas seguros y auditables.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {impactMetrics.map((metric) => (
                  <article
                    key={metric.label}
                    className="rounded-xl border border-[var(--border)] bg-[rgba(8,27,44,0.72)] px-4 py-3"
                  >
                    <p className="text-2xl font-semibold text-[var(--text-primary)]">
                      {metric.value}
                    </p>
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                      {metric.label}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl border border-[var(--border)] bg-[linear-gradient(155deg,rgba(8,30,48,0.85),rgba(12,45,70,0.72))] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent-soft)]">
                Accesos
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                Gestiona tu portal
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Ingresa para administrar usuarios, seguimiento de actividades y edicion
                de perfil corporativo.
              </p>

              <div className="mt-6 grid gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--button-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Iniciar sesion
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white/5 px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent-soft)]"
                >
                  Crear cuenta
                </Link>
              </div>

              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[rgba(6,23,38,0.65)] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--accent-soft)]">
                  Ruta preventiva
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  1. Diagnostico inicial<br />
                  2. Plan de accion y capacitacion<br />
                  3. Seguimiento y mejora continua
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
            {focusAreas.map((area) => (
              <article
                key={area.title}
                className="rounded-2xl border border-[var(--border)] bg-[rgba(8,27,44,0.72)] p-5"
              >
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--accent-soft)]">
                  {area.title}
                </h2>
                <p className="mt-2 text-base text-[var(--text-primary)]">
                  {area.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[rgba(5,21,36,0.78)] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-soft)]">
                  Proximamente
                </p>
                <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  Suscripciones y planes corporativos
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Seccion visual reservada para nuevos paquetes de servicio.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--button-secondary)] px-6 py-3 text-sm font-semibold text-white/95 transition hover:brightness-110"
                >
                  Ver suscripciones
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)]"
                >
                  Ver planes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
