import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B1020",
        panel: "#11172B",
        muted: "#8A96B8",
        accent: "#6E8BFF",
        success: "#30C48D"
      },
      boxShadow: {
        panel: "0 8px 32px rgba(5,10,25,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
