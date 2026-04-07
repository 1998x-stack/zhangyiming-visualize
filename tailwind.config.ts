import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      colors: {
        background: {
          light: '#FAFAFA',
          dark: '#09090B',
        },
        card: {
          light: '#FFFFFF',
          dark: '#18181B',
        },
        text: {
          primary: { light: '#0F172A', dark: '#FAFAFA' },
          muted: { light: '#64748B', dark: '#A1A1AA' },
        },
        border: { light: '#E2E8F0', dark: '#27272A' },
        section: {
          growth: { DEFAULT: '#2563EB', dark: '#3B82F6' },
          management: { DEFAULT: '#7C3AED', dark: '#8B5CF6' },
          business: { DEFAULT: '#059669', dark: '#10B981' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
