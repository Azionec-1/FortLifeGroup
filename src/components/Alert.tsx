// src/components/Alert.tsx
import React from "react";

type AlertProps = {
  type: "error" | "success" | "info";
  message: string;
};

export function Alert({ type, message }: AlertProps) {
  const classes =
    type === "error"
      ? "border-[#f3b4b4] bg-[#fff2f2] text-[#b42318]"
      : type === "success"
      ? "border-[#a7f3d0] bg-[#ecfdf3] text-[#166534]"
      : "border-[#d5dbe5] bg-[#f5f7fb] text-[#4f6788]";

  return (
    <div className={`rounded-xl border p-3 text-sm ${classes}`}>
      {message}
    </div>
  );
}
