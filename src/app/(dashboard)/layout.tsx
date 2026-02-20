import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Navbar } from "@/app/components/Navbar";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  return (
    <main className="min-h-screen bg-[#f3f5f9] text-[#0a1f3d]">
      <Navbar />

      <section>{children}</section>

      <footer className="mt-8 bg-[#081b3b] text-[#d5dfef]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          <div>
            <div className="inline-flex items-center gap-3 text-2xl font-bold text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb]">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M12 3 5 6v5c0 5 3.4 8.7 7 10 3.6-1.3 7-5 7-10V6l-7-3Z" />
                </svg>
              </span>
              FortLife Group
            </div>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-[#9eb4d7]">
              Lideres en soluciones de seguridad financiera y proteccion familiar en toda Latinoamerica.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Empresa</h3>
            <ul className="mt-4 space-y-3 text-base text-[#b6cae6]">
              <li>Sobre Nosotros</li>
              <li>Carreras</li>
              <li>Prensa</li>
              <li className="text-white">Contacto</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">SST</h3>
            <ul className="mt-4 space-y-3 text-base text-[#b6cae6]">
              <li>Normativa ISO 45001</li>
              <li>Matriz de Riesgos</li>
              <li>Protocolos COVID-19</li>
              <li>Planes de Emergencia</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Legal</h3>
            <ul className="mt-4 space-y-3 text-base text-[#b6cae6]">
              <li>Privacidad</li>
              <li>Terminos de Uso</li>
              <li>Cookies</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#183767]">
          <p className="mx-auto w-full max-w-7xl px-4 py-6 text-center text-base text-[#9eb4d7] sm:px-8">
            © 2026 FortLife Group. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
