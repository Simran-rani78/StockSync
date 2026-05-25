/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#edf0ff',
          200: '#dce1ff',
          300: '#c2cbff',
          400: '#9cabff',
          500: '#7583ff',
          600: '#525cff',
          700: '#3e44eb',
          800: '#3337bf',
          900: '#2d3099',
          950: '#1a1b5c',
        },
        slate: {
          950: '#0a0d14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
