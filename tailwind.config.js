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
          50: '#fdf8f7',
          100: '#f9eee9',
          200: '#f3ddd4',
          300: '#e9c3b4',
          400: '#dba18d',
          500: '#c87d66',
          600: '#b5644d',
          700: '#964f3c',
          800: '#7c4335',
          900: '#673c31',
          950: '#381c16',
        },
        gold: {
          50: '#faf8f2',
          100: '#f4ede1',
          200: '#e7d8bf',
          300: '#d8be97',
          400: '#c8a272',
          500: '#b88a53',
          600: '#a17242',
          700: '#815637',
          800: '#6b4632',
          900: '#593a2c',
        },
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#262425',
          900: '#171617',
          950: '#0d0c0d',
        },
        ivory: '#fcfbfa',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 40px -10px rgba(184, 138, 83, 0.12), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'luxury-hover': '0 20px 50px -10px rgba(184, 138, 83, 0.22), 0 5px 20px -2px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 20px -2px rgba(23, 22, 23, 0.05)',
      },
      letterSpacing: {
        'widest-luxury': '0.25em',
        'loose-luxury': '0.18em',
      }
    },
  },
  plugins: [],
}
