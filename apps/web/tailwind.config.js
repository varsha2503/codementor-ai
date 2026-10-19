/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Figtree", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Newsreader", "ui-serif", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: "#e8f0e4",
        muted: "#93a394",
        line: "#2c382b",
        panel: "#171d16",
        panel2: "#121710",
        accent: "#d6f25c",
        ai: "#3b82f6",
        good: "#8fd6a8",
        bad: "#f08a86",
        warn: "#e7c36a",
      },
    },
  },
  plugins: [],
};
