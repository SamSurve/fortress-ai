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
        fortress: {
          dark: "#0B1730",
          navy: "#13254A",
          blue: "#2563EB",
          "blue-hover": "#1D4ED8",
          "blue-light": "#E8F1FF",
          "blue-subtle": "#F0F6FF",
          bg: "#F5F7FB",
          card: "#FFFFFF",
          "text-primary": "#14213D",
          "text-secondary": "#64748B",
          "text-muted": "#94A3B8",
          border: "#D9E1EC",
          "border-subtle": "#E8EEF5",
        },
        navy: {
          950: "#070E1E",
          900: "#0B1730",
          850: "#0F1E3D",
          800: "#13254A",
          700: "#1E3A73",
          600: "#2B529E",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(11, 23, 48, 0.04), 0 1px 2px -1px rgba(11, 23, 48, 0.03)",
        card: "0 2px 8px -2px rgba(11, 23, 48, 0.06), 0 1px 4px -1px rgba(11, 23, 48, 0.04)",
        elevated: "0 8px 24px -4px rgba(11, 23, 48, 0.08), 0 4px 12px -2px rgba(11, 23, 48, 0.04)",
        dropdown: "0 10px 30px -5px rgba(11, 23, 48, 0.12), 0 4px 12px -2px rgba(11, 23, 48, 0.06)",
        modal: "0 20px 40px -10px rgba(11, 23, 48, 0.2), 0 8px 16px -4px rgba(11, 23, 48, 0.08)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "14px",
        "3xl": "18px",
      }
    },
  },
  plugins: [],
};
export default config;
