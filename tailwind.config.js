/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d4fe',
          300: '#a4b4fd',
          400: '#7c8ffb',
          500: '#5b6df7',
          600: '#4a52ec',
          700: '#3d41d1',
          800: '#3337a8',
          900: '#2e3485',
        }
      }
    }
  },
  plugins: []
}
