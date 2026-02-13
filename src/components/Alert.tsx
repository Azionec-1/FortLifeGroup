// src/components/Alert.tsx
import React from "react";

type AlertProps = {
  type: "error" | "success" | "info";
  message: string;
};

export function Alert({ type, message }: AlertProps) {
  const classes =
    type === "error"
      ? "border-[rgba(210,63,63,0.45)] bg-[rgba(210,63,63,0.12)] text-red-100"
      : type === "success"
      ? "border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.12)] text-emerald-100"
      : "border-[var(--border)] bg-[rgba(14,45,70,0.45)] text-[var(--text-secondary)]";

  return (
    <div className={`rounded-xl border p-3 text-sm ${classes}`}>
      {message}
    </div>
  );
}
