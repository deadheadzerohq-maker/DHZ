import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#dceeff',
          200: '#b8dcff',
          300: '#8cc5ff',
          400: '#5da8ff',
          500: '#2f86f6',
          600: '#1f69d2',
          700: '#1c55a6',
          800: '#1a4786',
          900: '#1a3a6b'
        }
      }
    }
  },
  plugins: [],
};

export default config;
