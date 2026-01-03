/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dex: {
          bg: '#111116',
          card: '#17171c',
          hover: '#1d1d22',
          border: '#28282d',
          text: '#CFD2DC',
          blue: '#5974f0',
          green: '#39be78',
        }
      }
    },
  },
  plugins: [],
};
