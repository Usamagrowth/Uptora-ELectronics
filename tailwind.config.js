/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    { pattern: /^(bg|text|border|ring|shadow)-brand-(50|100|200|300|400|500|600|700|800|900|950)$/ },
    { pattern: /^hover:(bg|text|border)-brand-(400|500|600)$/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: "#f0faf0",
          100: "#dff5dd",
          200: "#b8e8b4",
          300: "#7ed478",
          400: "#3cb834",
          500: "#1B9810",
          600: "#15800d",
          700: "#11660a",
          800: "#0d4f08",
          900: "#093806",
          950: "#041f03",
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
}