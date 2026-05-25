import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9ec',
          100: '#faf0cc',
          200: '#f4de95',
          300: '#edc757',
          400: '#e6b030',
          500: '#d4940f',
          600: '#b8740a',
          700: '#94540c',
          800: '#7a4210',
          900: '#673713',
          950: '#3b1c05',
        },
        obsidian: '#0a0a0a',
        onyx: '#111111',
        charcoal: '#1a1a1a',
        ivory: '#f5f0e8',
        cream: '#faf7f2',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'gold-shimmer': 'goldShimmer 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'scan-line': 'scanLine 2s linear infinite',
      },
      keyframes: {
        goldShimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(212,148,15,0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(212,148,15,0.6)' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4940f 0%, #f4de95 50%, #d4940f 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        'radial-gold': 'radial-gradient(circle at center, rgba(212,148,15,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
