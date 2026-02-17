import { createHash, randomBytes } from "crypto";

const RESET_TOKEN_TTL_MINUTES = 30;

export function generatePasswordResetToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  return { token, tokenHash, expiresAt };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getBaseUrl(origin: string) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  return origin;
}
