/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C0392B",
          dark: "#922B21",
        },
        gold: "#F39C12",
        known: "#27AE60",
        unknown: "#E74C3C",
        background: "#FDFAF6",
        surface: "#FFFFFF",
        "surface-2": "#F5F0E8",
        border: "#E8E0D5",
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "ui-sans-serif", "system-ui"],
        hanzi: ["Noto Serif SC", "serif"],
        "hanzi-sans": ["Noto Sans SC", "sans-serif"],
      },
      fontSize: {
        "hanzi-card": ["64px", { lineHeight: "1.2" }],
        "hanzi-list": ["22px", { lineHeight: "1.4" }],
      },
      boxShadow: {
        card: "0 2px 12px rgba(192, 57, 43, 0.08)",
        "card-hover": "0 4px 20px rgba(192, 57, 43, 0.14)",
      },
    },
  },
  plugins: [],
};
