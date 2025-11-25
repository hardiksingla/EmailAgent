/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Midnight Palette
        midnight: {
          950: '#020617', // Deepest background
          900: '#0f172a', // Sidebar / Cards
          800: '#1e293b', // Lighter elements
          700: '#334155', // Borders
        },
        primary: {
          500: '#6366f1', // Indigo 500
          600: '#4f46e5', // Indigo 600
          400: '#818cf8', // Indigo 400
          300: '#a5b4fc', // Indigo 300
        },
        accent: {
          glow: '#818cf8', // Glow color
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
