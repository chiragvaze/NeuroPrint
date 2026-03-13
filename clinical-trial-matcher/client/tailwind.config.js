/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9f6",
          500: "#17a27e",
          700: "#0f6e55"
        }
      }
    }
  },
  plugins: []
};
