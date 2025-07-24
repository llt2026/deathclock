/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/**/*.{js,jsx,ts,tsx}",
    "./packages/ui/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E50914",
        success: "#00C48C",
        accent: "#9E9E9E",
        dark: "#0E0E0E"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Anton", "sans-serif"]
      }
    }
  },
  plugins: []
}; 