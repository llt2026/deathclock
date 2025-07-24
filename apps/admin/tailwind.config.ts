import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E50914",
        success: "#00C48C",
        accent: "#9E9E9E",
        dark: "#0E0E0E",
      },
      fontFamily: {
        display: ["Anton", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config; 