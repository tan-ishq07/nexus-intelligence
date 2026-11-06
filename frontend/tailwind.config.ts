import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080B11",
        surface: {
          50: "#161F36",
          100: "#141B2D",
          200: "#111827",
          300: "#0F1422",
          400: "#0B0F17",
          500: "#080B11",
        },
        border: {
          subtle: "#1E293B",
          glow: "rgba(56, 189, 248, 0.2)",
        },
        nexus: {
          blue: "#0EA5E9",
          cyan: "#06B6D4",
          sky: "#38BDF8",
          purple: "#8B5CF6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Courier New", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        "glow-cyan": "0 0 20px -3px rgba(6, 182, 212, 0.25)",
        "glow-blue": "0 0 25px -4px rgba(14, 165, 233, 0.3)",
      },
      backgroundImage: {
        "radial-gradient": "radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.12) 0%, transparent 70%)",
        "mesh-pattern": "radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
