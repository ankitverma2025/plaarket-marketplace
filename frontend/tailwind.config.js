const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans', ...fontFamily.sans],
        heading: ['Quicksand', ...fontFamily.sans],
        mono: ['JetBrains Mono', ...fontFamily.mono],
      },
      colors: {
        // Sage color palette from Figma
        sage: {
          50: '#f8f7f6',
          100: '#f0efed',
          200: '#dddbda',
          300: '#c7c4c2',
          400: '#bbbab9',
          500: '#a39483',
          600: '#94b444',
          700: '#a8bb6e',
          800: '#839546',
          900: '#6d7c3a',
        },
        primary: {
          50: '#f8faf6',
          100: '#f0f4ed',
          200: '#dbe5d2',
          300: '#c0d1af',
          400: '#a8bb6e',
          500: '#94b444',
          600: '#7d9a35',
          700: '#667a2c',
          800: '#536126',
          900: '#445021',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        accent: {
          50: '#faf9f7',
          100: '#f4f2ee',
          200: '#e8e4dc',
          300: '#dbc1a0',
          400: '#c9a876',
          500: '#b8954c',
          600: '#a1833f',
          700: '#876d35',
          800: '#6f5a30',
          900: '#5c4a29',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
