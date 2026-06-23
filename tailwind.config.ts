// tailwind.config.ts
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./ViewRegistry.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sovereign-gold': '#ffd700',
        'sovereign-dark': '#050505',
        'sovereign-navy': '#0d111a',
        'sovereign-cyan': '#06b6d4',
        'sovereign-emerald': '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'sovereign': '12px',
      }
    },
  },
  plugins: [],
};
