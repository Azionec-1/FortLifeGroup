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

  const fullName = (user.name ?? "").trim();
  const nameParts = fullName ? fullName.split(/\s+/) : [];
  const firstName = nameParts.length > 0 ? nameParts[0] : "Sin nombre";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

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
            <span className="px-4 py-2 text-base font-medium text-[#4b5563]">Mi Perfil</span>
            <Link
              href="/logout"
              className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-base font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              Cerrar Sesion
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-[1.6rem] border border-[#dde3ec] bg-white shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-end justify-between gap-3">
                <div className="flex items-end gap-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d9e0eb] bg-white shadow-sm">
                  <span className="text-xl text-[#96a4b8]">+</span>
                </div>
                <div className="pb-1">
                  <h1 className="text-xl font-semibold text-[#071a3a] sm:text-2xl">{user.name ?? "Sin nombre"}</h1>
                  <p className="mt-1 text-sm text-[#5f718c] sm:text-base">{user.email}</p>
                </div>
              </div>

              <Link
                href="/profile/edit"
                className="inline-flex items-center justify-center rounded-xl bg-[#eaf0fa] px-3.5 py-1.5 text-sm font-semibold text-[#2563eb] transition hover:bg-[#dce8fa]"
              >
                Editar Datos
              </Link>
            </div>
            </div>

            <div className="mt-5 grid gap-2.5">
              <article className="rounded-xl border border-[#edf1f6] bg-[#f7f9fc] p-3.5">
                <p className="text-sm text-[#8a98ad]">Nombre</p>
                <p className="mt-1 text-lg font-semibold text-[#071a3a] sm:text-xl">{firstName}</p>
              </article>

              <article className="rounded-xl border border-[#edf1f6] bg-[#f7f9fc] p-3.5">
                <p className="text-sm text-[#8a98ad]">Apellido</p>
                <p className="mt-1 text-lg font-semibold text-[#071a3a] sm:text-xl">{lastName}</p>
              </article>

              <article className="rounded-xl border border-[#edf1f6] bg-[#f7f9fc] p-3.5">
                <p className="text-sm text-[#8a98ad]">Correo Electronico</p>
                <p className="mt-1 break-all text-lg font-semibold text-[#071a3a] sm:text-xl">{user.email}</p>
              </article>
            </div>
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
                Lideres en soluciones de seguridad financiera y proteccion familiar en toda
                Latinoamerica.
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
                <li>Terminos de Uso</li>
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
