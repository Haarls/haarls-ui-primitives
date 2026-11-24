/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#09090B',
        surface: '#111113',
        elevated: '#161618',
        ink: '#F4F4F5',
        accent: '#4ECDC4',
      },
    },
  },
  plugins: [],
};
