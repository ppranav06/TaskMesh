import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f9f9fb',
        surface: '#ffffff',
        input: '#f3f4f6',
        main: '#2d3142',
        muted: '#8d93a8',
        primary: '#8b93ff',
        mint: '#a7e6ce',
        peach: '#ffb5a7',
        dangerLight: '#fff5f5',
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        soft: '1rem',
        card: '1.5rem',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 10px 30px -5px rgba(45, 49, 66, 0.05)',
        float: '0 24px 48px -12px rgba(45, 49, 66, 0.12)',
        insetSoft: 'inset 0 1px 2px rgba(45, 49, 66, 0.06)',
      },
    },
  },
  plugins: [],
}

export default config
