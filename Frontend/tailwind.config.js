/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#EAEAEA',
          300: '#F0F0F0',
          400: '#D4D4D4',
          500: '#A3A3A3',
          600: '#737373',
          700: '#525252',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        success: {
          DEFAULT: '#2E7D5B',
          soft: '#EEF7F2',
        },
        warning: {
          DEFAULT: '#B7791F',
          soft: '#FBF5E8',
        },
        error: {
          DEFAULT: '#C94B4B',
          soft: '#FBEDED',
        },
        info: {
          DEFAULT: '#3B6BB0',
          soft: '#EEF3FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'page': ['30px', { lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '600' }],
        'section': ['20px', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      borderRadius: {
        'xl2': '18px',
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 1px 0 rgba(0,0,0,0.02)',
        'card-hover': '0 2px 8px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.03)',
        'pop': '0 4px 24px 0 rgba(0,0,0,0.08), 0 1px 4px 0 rgba(0,0,0,0.04)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
