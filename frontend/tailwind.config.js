/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#0f172a', // Slate 900
          800: '#1e293b', // Slate 800
          700: '#334155', // Slate 700
          600: '#475569', // Slate 600
          500: '#64748b', // Slate 500
          400: '#94a3b8', // Slate 400
          300: '#cbd5e1', // Slate 300
          200: '#e2e8f0', // Slate 200
          100: '#f1f5f9', // Slate 100
        },
        primary: {
          500: '#6366f1', // Indigo 500
          600: '#4f46e5', // Indigo 600
          400: '#818cf8', // Indigo 400
          300: '#a5b4fc', // Indigo 300
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
