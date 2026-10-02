/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
        },
        hairline: "var(--hairline)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        action: {
          DEFAULT: "var(--action)",
          text: "var(--action-text)",
        },
        accent: "var(--action)",
        success: {
          DEFAULT: "var(--success)",
          fill: "var(--success)",
          text: "var(--success-text)",
        },
        attention: {
          DEFAULT: "var(--attention)",
          fill: "var(--attention)",
        },
        critical: {
          DEFAULT: "var(--critical)",
          text: "var(--critical)",
        },
        pending: "var(--pending)",
        "gps-tint": "var(--gps-tint)",
      },
      fontFamily: {
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        brand: ['Poppins', 'sans-serif'],
        apple: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      }
    }
  }
};
