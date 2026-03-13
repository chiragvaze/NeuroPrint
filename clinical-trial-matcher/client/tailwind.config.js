/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'sans-serif']
      },
      colors: {
        dark: {
          900: "#0a0e1a",
          800: "#0f172a",
          700: "#1e293b",
          600: "#334155",
          500: "#475569"
        },
        accent: {
          teal: "#14b8a6",
          cyan: "#22d3ee",
          amber: "#f59e0b",
          rose: "#f43f5e",
          indigo: "#6366f1"
        },
        surface: {
          DEFAULT: "rgba(15, 23, 42, 0.6)",
          hover: "rgba(30, 41, 59, 0.7)",
          border: "rgba(148, 163, 184, 0.12)"
        },
        brand: {
          50: "rgba(20, 184, 166, 0.08)",
          100: "rgba(20, 184, 166, 0.15)",
          200: "rgba(20, 184, 166, 0.25)",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e"
        }
      },
      animation: {
        fadeInUp: "fadeInUp 0.5s ease-out both",
        slideIn: "slideIn 0.4s ease-out both",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite"
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(20, 184, 166, 0.3)" },
          "50%": { boxShadow: "0 0 24px rgba(20, 184, 166, 0.6)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        }
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px"
      },
      boxShadow: {
        glow: "0 0 20px rgba(20, 184, 166, 0.25)",
        "glow-lg": "0 0 40px rgba(20, 184, 166, 0.3)",
        dark: "0 4px 24px rgba(0, 0, 0, 0.3)"
      }
    }
  },
  plugins: []
};
