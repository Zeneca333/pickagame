import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', "monospace"],
        sans: ['"Inter"', "sans-serif"],
      },
      colors: {
        accent: "#10b981",
        bg: "#0a0a0a",
      },
    },
  },
  plugins: [],
};

export default config;
