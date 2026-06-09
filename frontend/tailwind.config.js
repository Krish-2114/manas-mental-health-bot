/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Instrument Serif", "Georgia", "serif"],
      },
      colors: {
        ocean: {
          bg: "var(--background)",
          surface: "var(--surface)",
          primary: "var(--primary)",
          "primary-hover": "var(--primary-hover)",
          secondary: "var(--secondary)",
          "secondary-soft": "var(--secondary-soft)",
          accent: "var(--accent)",
          "text-primary": "var(--text-primary)",
          "text-secondary": "var(--text-secondary)",
          border: "var(--border)",
          success: "var(--success)",
          warning: "var(--warning)",
          danger: "var(--danger)",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(93, 201, 226, 0.25)",
        "glow-sm": "0 0 20px rgba(93, 201, 226, 0.15)",
        lift: "0 12px 40px rgba(16, 42, 67, 0.08)",
      },
      animation: {
        "blob-drift": "blob-drift 22s ease-in-out infinite",
        "blob-drift-slow": "blob-drift 32s ease-in-out infinite reverse",
        breathe: "breathe 8s ease-in-out infinite",
        ripple: "ripple 2.4s ease-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "blob-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 15px) scale(0.95)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
