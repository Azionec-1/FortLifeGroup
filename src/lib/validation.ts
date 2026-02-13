// src/lib/validation.ts

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Validación básica: email con formato simple.
 */
export function isValidEmail(email: string): boolean {
  // Regex simple (suficiente para validación básica de formulario)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Reglas de contraseña mínimas (ajústalas si quieres):
 * - mínimo 8 caracteres
 */
export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return { ok: false, message: "La contraseña debe tener al menos 8 caracteres." };
  }
  return { ok: true };
}

/**
 * Validación para registro.
 */
export function validateRegisterInput(input: {
  name: string;
  email: string;
  password: string;
}): ValidationResult {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name) return { ok: false, message: "El nombre es obligatorio." };
  if (name.length < 2) return { ok: false, message: "El nombre debe tener al menos 2 caracteres." };

  if (!email) return { ok: false, message: "El email es obligatorio." };
  if (!isValidEmail(email)) return { ok: false, message: "El email no tiene un formato válido." };

  const pwd = validatePassword(password);
  if (!pwd.ok) return pwd;

  return { ok: true };
}

export function validateProfileUpdateInput(input: {
  name: string;
  email: string;
  newPassword?: string;
}): ValidationResult {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const newPassword = input.newPassword ?? "";

  if (!name) return { ok: false, message: "El nombre es obligatorio." };
  if (name.length < 2) return { ok: false, message: "El nombre debe tener al menos 2 caracteres." };

  if (!email) return { ok: false, message: "El email es obligatorio." };
  if (!isValidEmail(email)) return { ok: false, message: "El email no tiene un formato válido." };

  // Contraseña: opcional, pero si se envía debe cumplir reglas
  if (newPassword.trim().length > 0) {
    const pwd = validatePassword(newPassword);
    if (!pwd.ok) return pwd;
  }

  return { ok: true };
}
