// src/components/AuthCard.tsx
import React from "react";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel izquierda */}
        <div className="rounded-2xl bg-gray-900 text-white p-8 shadow-xl">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Terrax • Aula Virtual
            </div>

            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Plataforma de cursos y obra
              </h2>
              <p className="mt-2 text-gray-300">
                Accede a tu perfil, módulos y seguimiento de progreso.
              </p>
            </div>

            <div className="text-sm text-gray-400">
              Seguridad • Organización • Profesionalismo
            </div>
          </div>
        </div>

        {/* Card derecha */}
        <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
