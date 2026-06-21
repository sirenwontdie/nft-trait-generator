/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a2e',
          600: '#222240',
          500: '#2a2a4a',
        },
        accent: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          light: '#a78bfa',
        }
      }
    },
  },
  plugins: [],
};
