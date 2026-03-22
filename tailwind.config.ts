import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', "monospace"],
        sans: ['"Inter"', "sans-serif"],
      },
      animation: {
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      colors: {
        accent: "#e85d3a",
        "accent-light": "#fef0ec",
        bg: "#faf7f2",
        "bg-card": "#ffffff",
        "bg-hover": "#f5f0e8",
        ink: "#2d2a26",
        muted: "#8a857d",
      },
    },
  },
  plugins: [],
};

export default config;
