const animate = require("tailwindcss-animate");

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "",

  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],

  theme: {
    container: {
      center: true,
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "system-ui", "sans-serif"],
      },
      textColor: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        disabled: "var(--color-disabled)",
        "primary-on-color": "var(--color-primary-on-color)",
        "secondary-on-color": "var(--color-secondary-on-color)",
      },
      backgroundColor: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        accent: "var(--bg-accent)",
        "accent-hover": "var(--bg-accent-hover)",
        "blue-100": "var(--bg-blue-100)",
        "brand-yellow": "var(--bg-brand-yellow)",
        "brand-black": "var(--bg-brand-black)",
        dark: "var(--bg-dark)",
      },
      borderColor: {
        primary: "var(--border-primary)",
        secondary: "var(--border-secondary)",
        focus: "var(--border-focus)",
      },
      colors: {
        /* Saily semantic text colors */
        "text-primary": "var(--color-primary)",
        "text-secondary": "var(--color-secondary)",
        "text-tertiary": "var(--color-tertiary)",
        "text-disabled": "var(--color-disabled)",
        "text-primary-on-color": "var(--color-primary-on-color)",

        /* Saily semantic background colors */
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-accent": "var(--bg-accent)",
        "bg-accent-hover": "var(--bg-accent-hover)",
        "bg-blue-100": "var(--bg-blue-100)",
        "bg-brand-yellow": "var(--bg-brand-yellow)",
        "bg-brand-black": "var(--bg-brand-black)",
        "bg-dark": "var(--bg-dark)",

        /* Saily semantic border colors */
        "border-primary": "var(--border-primary)",
        "border-secondary": "var(--border-secondary)",
        "border-focus": "var(--border-focus)",

        /* shadcn compat */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        "shadcn-secondary": {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      maxWidth: {
        "container": "1200px",
        "header": "1600px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};
