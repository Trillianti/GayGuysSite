/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          DEFAULT: '#5865F2', // Основной оттенок
          light: '#7983F5',  // Светлый оттенок (опционально)
          dark: '#434DBA',   // Тёмный оттенок (опционально)
        },
      },
    },
  },
  plugins: [],
}