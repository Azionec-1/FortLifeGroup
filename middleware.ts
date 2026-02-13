// middleware.ts
import { NextResponse } from "next/server";

import { auth } from "@/auth";

/**
 * Protege /profile y /profile/*
 * - Si no hay JWT (no autenticado), redirige a /login?callbackUrl=...
 *
 * IMPORTANTE:
 * - Middleware corre en Edge runtime.
 * - Por eso NO debemos importar Prisma/bcrypt/auth.ts aquí.
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname, search } = req.nextUrl;

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/profile/:path*"],
};
