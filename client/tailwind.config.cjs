// const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // darkMode: 'class',
  darkMode: ['class'],
  theme: {
    // colors: {
    //   'gpt-dark-gray': '#171717',
    // },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace'],
    },
    // fontFamily: {
    //   sans: ['Söhne', 'sans-serif'],
    //   mono: ['Söhne Mono', 'monospace'],
    // },
    extend: {
      width: {
        'authPageWidth': '370px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      colors: {
        gray: {
          20: '#ececf1',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151', // Replacing .dark .dark:bg-gray-700 and .dark .dark:hover:bg-gray-700:hover
          750: '#333333',
          800: '#1f2937', // Replacing .dark .dark:bg-gray-800, .bg-gray-800, and .dark .dark:hover:bg-gray-800\/90
          900: '#111827', // Replacing .dark .dark:bg-gray-900, .bg-gray-900, and .dark .dark:hover:bg-gray-900:hover
        },
        green: {
          50: '#f1f9f7',
          100: '#def2ed',
          200: '#a6e5d6',
          300: '#6dc8b9',
          400: '#41a79d',
          500: '#10a37f',
          550: '#349072',
          600: '#126e6b',
          700: '#0a4f53',
          800: '#06373e',
          900: '#031f29',
        },
        'brand-purple': '#ab68ff',
        'text-primary': 'var(--gray-800)',
        'text-secondary': 'var(--gray-600)',
        'text-tertiary': 'var(--gray-500)',
        'surface-primary': 'var(--white)',
        'surface-secondary': 'var(--gray-50)',
        'surface-tertiary': 'var(--gray-100)',
        'border-light': 'var(--gray-100)',
        'border-medium': 'var(--gray-200)',
        'border-heavy': 'var(--gray-300)',
        'border-xheavy': 'var(--gray-400',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwindcss-radix')(),
    // require('@tailwindcss/typography'),
  ],
};
