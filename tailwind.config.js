/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        'p1': '#ef4444',
        'p2': '#3b82f6',
        'p3': '#f59e0b',
        'p4': '#22c55e',
        'ptotal': '#94a3b8',
      },
    },
  },
  plugins: [],
}