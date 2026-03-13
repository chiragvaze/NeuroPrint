/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        mist: "#f3f4f6",
        signal: "#0ea5e9",
        pulse: "#10b981"
      }
    }
  },
  plugins: []
};
