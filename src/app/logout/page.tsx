// src/app/logout/page.tsx
"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    // Cerramos sesión y redirigimos al home
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-600">Cerrando sesión...</p>
    </main>
  );
}
