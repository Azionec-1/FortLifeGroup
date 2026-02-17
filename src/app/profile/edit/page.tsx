export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/current-user";
import ProfileEditForm from "./ProfileEditForm";

export default async function ProfileEditPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
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
              href="/profile"
              className="rounded-full px-4 py-2 text-base font-medium text-[#4b5563] transition hover:text-[#0f172a]"
            >
              Mi Perfil
            </Link>
            <Link
              href="/logout"
              className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-base font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              Cerrar Sesión
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
            <h1 className="mt-3 text-3xl font-semibold text-[#071a3a]">Editar perfil</h1>
            <p className="mt-2 text-base text-[#556c8d]">
              Actualiza tu nombre, correo y contraseña.
            </p>
          </div>

          <div className="mt-6">
            <ProfileEditForm initialName={user.name ?? ""} initialEmail={user.email} />
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
