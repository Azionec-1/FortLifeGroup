// src/app/profile/edit/page.tsx
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
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(41,127,193,0.33),transparent_35%),radial-gradient(circle_at_85%_82%,rgba(25,93,150,0.26),transparent_32%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(125deg,rgba(4,14,25,0.94),rgba(6,22,36,0.9),rgba(8,27,43,0.86))]"
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl items-center px-5 py-10 sm:px-8">
        <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.52)] backdrop-blur-sm sm:p-8 lg:p-10">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-2xl border border-[var(--border)] bg-white/5 px-3 py-2">
              <Image
                src="/fortlife-logo.svg"
                alt="FortLife Group"
                width={200}
                height={58}
                priority
              />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
              Editar perfil
            </h1>
            <p className="text-sm text-[var(--text-secondary)] sm:text-base">
              Puedes actualizar nombre, email y contrasena manteniendo la seguridad del acceso.
            </p>
          </div>

          <div className="mt-6">
            <ProfileEditForm initialName={user.name ?? ""} initialEmail={user.email} />
          </div>

          <div className="mt-6">
            <Link
              href="/profile"
              className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4 transition hover:opacity-85"
            >
              Volver al perfil
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
