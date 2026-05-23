/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      black: "#000000",
      white: "#ffffff",
      surface: {
        page: "#000046",
        card: "#040a25",
        overlay: "#040a25",
        contrast: "#f5f4ff",
      },
      accent: {
        red: "#de1223",
        blue: "#599fff",
        yellow: "#eaea00",
      },
      action: {
        primary: "#de1223",
        "primary-hover": "#b30e1c",
        secondary: "#2524fd",
        "secondary-hover": "#1d1dcc",
      },
      text: {
        primary: "#e4e3ff",
        secondary: "#599fff",
        accent: "#eaea00",
        inverse: "#000046",
        white: "#ffffff",
        muted: "#8c8bb5",
      },
      border: {
        DEFAULT: "#03038a",
        highlight: "#599fff",
      },
    },
    extend: {
      fontFamily: {
        display: ['"Press Start 2P"', "monospace"],
        heading: ["Rajdhani", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        pixel: "0.1em",
        wide: "0.05em",
      },
      borderRadius: {
        none: "0",
        sm: "4px",
        md: "8px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 4px 16px 0 rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        "gradient-fighter-v":
          "linear-gradient(180deg, rgba(222, 18, 35, 0.18) 0%, rgba(4, 10, 37, 0) 60%)",
        "gradient-fighter-h":
          "linear-gradient(90deg, rgba(89, 159, 255, 0.18) 0%, rgba(4, 10, 37, 0) 60%)",
        "gradient-surface-banner":
          "linear-gradient(135deg, #000046 0%, #040a25 70%)",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [],
};
