/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crop-green': '#22c55e',
        'crop-gold': '#eab308',
        'crop-brown': '#78350f',
      }
    },
  },
  plugins: [],
}
