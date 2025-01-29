/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: "575px",
      md: "968px",
      lg: "1200px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        md: "1rem",
      },
    },
    extend: {},
  },
  plugins: [],
}

