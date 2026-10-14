import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#15120F",
          900: "#201B16",
          800: "#2C2520",
          700: "#4A4038",
          500: "#7A6F63",
          300: "#B8ACA0",
          100: "#E4DBCE",
        },
        cream: {
          50: "#FFFBF5",
          100: "#FBF3E8",
          200: "#F3E7D8",
          300: "#E9D9C4",
        },
        ember: {
          50: "#FFF1EC",
          100: "#FFE4DB",
          300: "#FF8F72",
          500: "#FF5A3C",
          600: "#E8472B",
          700: "#C53A22",
        },
        sage: {
          100: "#DCF5E6",
          300: "#7FD4A3",
          500: "#2E9E5C",
          600: "#23804A",
        },
        gold: {
          100: "#FDEBC9",
          300: "#F6C975",
          500: "#F2A93B",
          600: "#D6881C",
        },
        rose: {
          100: "#FBDEDC",
          300: "#F08B82",
          500: "#DC2626",
          600: "#B91C1C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgba(21, 18, 15, 0.08), 0 8px 24px -8px rgba(21, 18, 15, 0.10)",
        lift: "0 8px 30px -6px rgba(21, 18, 15, 0.18)",
        glow: "0 0 0 1px rgba(255, 90, 60, 0.15), 0 8px 24px -6px rgba(255, 90, 60, 0.35)",
      },
      animation: {
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        "slide-up": "slide-up 0.35s cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(255,90,60,0.45)" },
          "70%": { boxShadow: "0 0 0 12px rgba(255,90,60,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255,90,60,0)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
