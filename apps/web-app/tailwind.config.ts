import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE',
          300: '#A5B4FC', 400: '#818CF8', 500: '#6366F1',
          600: '#4F46E5', 700: '#4338CA',
        },
        neon: {
          lime: '#CCFF00',      // AI Coach reference neon green
          cyan: '#00F0FF',
          blue: '#0055FF',
        },
        dark: {
          bg: '#050505',
          surface: '#0A0A0A',
          card: '#111111',
          border: '#222222',
        },
        emergency: {
          400: '#F87171', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C',
        },
        severity: {
          stable: '#CCFF00',
          serious: '#F59E0B',
          critical: '#EF4444',
        },
      },
      backdropBlur: {
        'glass-1': '12px',
        'glass-2': '16px',
        'glass-3': '24px',
        'glass-dark': '20px',
      },
      boxShadow: {
        'glass-1': '0 4px 30px rgba(0, 0, 0, 0.05)',
        'glass-2': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-3': '0 12px 48px rgba(0, 0, 0, 0.12)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.30)',
        'emergency': '0 0 40px rgba(239, 68, 68, 0.30)',
        'neon-lime': '0 0 15px rgba(204, 255, 0, 0.3)',
        'neon-lime-strong': '0 0 25px rgba(204, 255, 0, 0.6)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.3)',
      },
      fontFamily: {
        sans: ['var(--font-eleven-twenty)', 'sans-serif'], // Enforced across portal
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['var(--font-eleven-twenty)', 'sans-serif'],
      },
      animation: {
        'pulse-emergency': 'pulse-emergency 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'glass-shimmer': 'glass-shimmer 3s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-emergency': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(239, 68, 68, 0.6)' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(204, 255, 0, 0.3)' },
          '50%': { opacity: '.7', boxShadow: '0 0 25px rgba(204, 255, 0, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glass-shimmer': {
          '0%, 100%': { backgroundPosition: '200% center' },
          '50%': { backgroundPosition: '-200% center' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
