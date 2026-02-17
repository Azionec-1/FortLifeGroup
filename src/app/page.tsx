// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";

const serviceCards = [
  {
    icon: "audit",
    title: "Auditorías y Riesgos",
    description: "Identificación de peligros y evaluación de riesgos bajo normativa vigente.",
    cta: "Ver detalles",
  },
  {
    icon: "book",
    title: "Capacitaciones",
    description: "Programas certificados de formación en prevención y salud laboral.",
    cta: "Ver catálogo",
  },
  {
    icon: "helmet",
    title: "Gestión de EPP",
    description: "Suministro y control de Equipos de Protección Personal de alta calidad.",
    cta: "Saber más",
  },
];

function iconFor(name: string) {
  if (name === "audit") return "ID";
  if (name === "book") return "BK";
  return "EP";
}

export default function HomePage() {
  return (
    <main className="bg-[#f3f5f9] text-[#0a1f3d]">
      <header className="bg-white">
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

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/PortadaPag.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(0,0,0,0.74),rgba(0,0,0,0.42),rgba(0,0,0,0.64))]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold leading-tight text-white sm:text-7xl">
              FortLife Group
            </h1>
            <p className="mt-5 text-2xl leading-relaxed text-white/90 sm:text-4xl">
              Especialistas en Seguridad y Salud en el Trabajo. Protegemos el activo más
              valioso de su empresa: su gente.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-lg font-semibold text-[#2563eb] shadow-lg transition hover:bg-[#eaf1ff]"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-[#2563eb] px-7 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-[#1e4fd2]"
            >
              Registrarse
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-[rgba(255,188,67,0.24)] px-7 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-[rgba(255,188,67,0.36)]"
            >
              Ver Planes
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-[rgba(15,23,42,0.42)] px-7 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-[rgba(15,23,42,0.6)]"
            >
              Suscripciones
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-8">
        <div className="text-center">
          <h2 className="text-5xl font-semibold text-[#0b1d3a] sm:text-6xl">Gestión Integral SST</h2>
          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-[#2563eb]" />
          <p className="mx-auto mt-6 max-w-3xl text-xl text-[#334d6c] sm:text-3xl">
            Soluciones normativas y preventivas para su organización.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {serviceCards.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-[#d8dde8] bg-white p-8 shadow-[0_10px_25px_rgba(15,23,42,0.08)] sm:p-10"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf0fa] text-xl font-semibold text-[#2563eb]">
                {iconFor(card.icon)}
              </div>
              <h3 className="mt-7 text-5xl font-semibold text-[#0b1d3a]">{card.title}</h3>
              <p className="mt-5 text-xl leading-relaxed text-[#334d6c]">{card.description}</p>
              <button
                type="button"
                className="mt-8 text-lg font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]"
              >
                {card.cta} -&gt;
              </button>
            </article>
          ))}
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
