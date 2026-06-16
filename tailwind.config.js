/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#f0f5fa",
          100: "#dbe7f1",
          200: "#b8d0e3",
          300: "#8ab1cf",
          400: "#558ab5",
          500: "#336a9c",
          600: "#235382",
          700: "#1e3a5f",
          800: "#172e4c",
          900: "#112239",
        },
        mint: {
          50: "#f0fcfb",
          100: "#ccf7f3",
          200: "#99efe7",
          300: "#66e7db",
          400: "#4ecdc4",
          500: "#3bb5ac",
          600: "#2d8f88",
          700: "#1f6964",
        },
        sand: {
          50: "#fdfdfb",
          100: "#f7fff7",
          200: "#eef7ee",
          300: "#e0eee0",
        },
        warning: {
          400: "#ff8787",
          500: "#ff6b6b",
          600: "#e55a5a",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
        "card-hover": "0 4px 12px rgba(30, 58, 95, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
