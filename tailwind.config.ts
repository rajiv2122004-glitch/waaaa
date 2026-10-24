import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#060606", bone: "#EDE8E0", rose: "#C9A05C" },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      transitionTimingFunction: { maison: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
} satisfies Config;
