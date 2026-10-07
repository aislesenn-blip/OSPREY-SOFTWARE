import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#E85D04", // Energetic, warm, friendly
          orangeLight: "#FFBA08",
          green: "#2D6A4F", // Environmentally conscious but not overwhelming
          greenLight: "#40916C",
          dark: "#14213D",
          light: "#F8F9FA",
          gray: "#E5E5E5",
          text: "#212529",
          muted: "#6C757D"
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
