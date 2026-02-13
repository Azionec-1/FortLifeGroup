// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Protege /profile y /profile/*
 * - Si no hay JWT (no autenticado), redirige a /login?callbackUrl=...
 *
 * IMPORTANTE:
 * - Middleware corre en Edge runtime.
 * - Por eso NO debemos importar Prisma/bcrypt/auth.ts aquí.
 */
export default async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const { pathname, search } = req.nextUrl;

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
