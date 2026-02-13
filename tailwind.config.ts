// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terrax: {
          950: "#070A0F",
          900: "#0B1220",
          800: "#101B2D",
          700: "#162744",
          600: "#1E3560",
          200: "#E7EAEE",
          100: "#F2F4F7",
          accent: "#F2A900",
          accentDark: "#C88700",
        },
      },
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,0.18)",
      },
      backgroundImage: {
        "terrax-radial":
          "radial-gradient(1200px circle at 20% 10%, rgba(242,169,0,0.14), transparent 40%), radial-gradient(900px circle at 80% 30%, rgba(30,53,96,0.22), transparent 45%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
