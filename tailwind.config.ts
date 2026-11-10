import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        college: {
          navy: "#0f2744",
          crimson: "#8b0000",
          gold: "#d4af37",
          sky: "#1a5276",
          slate: "#f4f6f9",
        },
      },
    },
  },
  plugins: [],
};
export default config;

