import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#d9e0e7",
        ink: "#17202a",
        muted: "#5b6776",
      },
    },
  },
  plugins: [],
};

export default config;
