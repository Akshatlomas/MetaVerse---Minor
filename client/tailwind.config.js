/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1220',
          900: '#101B33',
          800: '#182645',
          700: '#22345C'
        },
        parchment: '#F6F3EC',
        gold: {
          400: '#E3B15C',
          500: '#D4A24C',
          600: '#B5842F'
        },
        teal: {
          400: '#3FB6A8',
          500: '#2C978A'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      },
      boxShadow: {
        glass: '0 8px 32px rgba(11, 18, 32, 0.35)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
