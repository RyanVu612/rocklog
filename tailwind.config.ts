import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Fixed Rocklog brand palette — chalk-on-basalt + difficulty hues.
        basalt: "#14161d",
        "basalt-2": "#1c1f29",
        line: "#2a2e3b",
        chalk: "#efebe0",
        "chalk-dim": "#9ca2b0",
        teal: "#29b6c7",
        gold: "#e8b23a",
        green: "#46b17b",
        ember: "#e5533b",
        violet: "#9b6cf0",
        // Semantic tokens — flip between light/dark via CSS variables.
        surface: "var(--rl-surface)",
        panel: "var(--rl-panel)",
        edge: "var(--rl-edge)",
        ink: "var(--rl-ink)",
        muted: "var(--rl-muted)",
        primary: "var(--rl-primary)",
        "on-primary": "var(--rl-on-primary)",
      },
      fontFamily: {
        display: ["var(--rl-font-display)", "system-ui", "sans-serif"],
        body: ["var(--rl-font-body)", "system-ui", "sans-serif"],
        sans: ["var(--rl-font-body)", "system-ui", "sans-serif"],
        mono: ["var(--rl-font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
