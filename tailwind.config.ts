import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        osprey: {
          navy: '#0F172A', // Deep navy
          sand: '#FDFBF7', // Warm sand (backgrounds)
          forest: '#1B4D3E', // Forest green
          fog: '#F3F4F6', // Soft gray
          gold: '#C5A059', // Accent gold/bronze for luxury feel
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
}
export default config
