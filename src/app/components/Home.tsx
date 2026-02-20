import Image from "next/image";
import Link from "next/link";

const quickServices = [
  {
    id: "audits",
    title: "Auditorias SST",
    description:
      "Evaluaciones detalladas de cumplimiento normativo y matrices de riesgos actualizadas segun ISO 45001.",
    color: "bg-blue-600 shadow-blue-200",
    textColor: "text-blue-600",
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-7 w-7 text-white"
      >
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h6" />
        <path d="M9 12h6" />
        <path d="m9.5 16 1.5 1.5 3.5-3.5" />
      </svg>
    ),
  },
  {
    id: "epp",
    title: "Gestion de EPP",
    description:
      "Control digitalizado de entrega y reposicion de Equipos de Proteccion Personal para todo tu personal.",
    color: "bg-orange-600 shadow-orange-200",
    textColor: "text-orange-600",
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-7 w-7 text-white"
      >
        <path d="M4 14h16l-1-4a3 3 0 0 0-3-2h-1V6a3 3 0 1 0-6 0v2H8a3 3 0 0 0-3 2l-1 4Z" />
        <path d="M4 14v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        <path d="M12 3v5" />
      </svg>
    ),
  },
  {
    id: "training",
    title: "Capacitacion",
    description:
      "Modulos de formacion certificados para concientizar a los trabajadores sobre la cultura de prevencion.",
    color: "bg-green-600 shadow-green-200",
    textColor: "text-green-600",
    icon: (
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-7 w-7 text-white"
      >
        <path d="M3 6h18" />
        <path d="M7 6v12" />
        <path d="M12 10h6" />
        <path d="M12 14h6" />
        <path d="M12 18h6" />
      </svg>
    ),
  },
];

export function Home() {
  return (
    <div>
      <section className="relative flex h-[85vh] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/PortadaPag.jpg" fill className="object-cover brightness-40" alt="FortLife Group SST" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-200 backdrop-blur-sm">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M12 3 5 6v5c0 5 3.4 8.7 7 10 3.6-1.3 7-5 7-10V6l-7-3Z" />
              </svg>
              Lideres en seguridad y salud en el trabajo
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-tight text-white md:text-7xl">
              Protegemos el <span className="text-blue-400">Futuro</span> de tu Empresa
            </h1>
            <p className="mb-10 text-xl leading-relaxed text-gray-200">
              Especialistas en Seguridad y Salud en el Trabajo (SST). Implementamos soluciones normativas para
              proteger a tu equipo y optimizar la productividad.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                href="/login"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-900/20 transition-all hover:bg-blue-700"
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5 transition-transform group-hover:scale-110"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17 15 12 10 7" />
                  <path d="M15 12H3" />
                </svg>
                Iniciar Sesion
              </Link>

              <Link
                href="/register"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 font-bold text-white shadow-xl transition-all hover:bg-emerald-600"
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5 transition-transform group-hover:scale-110"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Registrarse
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button
                type="button"
                className="group flex items-center gap-2 font-semibold text-white/80 transition-colors hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5 text-blue-400"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
                Ver Planes
                <span className="transition-transform group-hover:translate-x-1">&rsaquo;</span>
              </button>
              <button
                type="button"
                className="group flex items-center gap-2 font-semibold text-white/80 transition-colors hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5 text-blue-400"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 10h18" />
                </svg>
                Suscripciones
                <span className="transition-transform group-hover:translate-x-1">&rsaquo;</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold text-gray-900 md:text-4xl">Gestion Integral de Riesgos</h2>
            <div className="mx-auto h-1.5 w-24 rounded-full bg-blue-600" />
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Nuestra plataforma digital facilita el cumplimiento de normativas locales e internacionales de
              seguridad ocupacional.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {quickServices.map((service) => (
              <article
                key={service.id}
                className="rounded-3xl border border-gray-100 bg-gray-50 p-10 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
              >
                <div className={`mb-8 flex h-14 w-14 items-center justify-center rounded-2xl ${service.color} shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">{service.title}</h3>
                <p className="mb-6 leading-relaxed text-gray-600">{service.description}</p>
                <span className={`flex items-center gap-2 font-bold ${service.textColor}`}>
                  Saber mas <span>&rsaquo;</span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#0f2a49] bg-[#071b34] py-6 text-center text-sm text-[#a9bed9]">
        © 2026 FortLife Group. Todos los derechos reservados.
      </footer>
    </div>
  );
}
