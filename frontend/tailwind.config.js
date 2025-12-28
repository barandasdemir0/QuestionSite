/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dogru': '#10b981',
        'yanlis': '#ef4444',
      }
    },
  },
  plugins: [],
}
