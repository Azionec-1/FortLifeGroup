// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Login con edición",
  description: "Next.js + Prisma + NextAuth + Tailwind",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-900 antialiased">

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
