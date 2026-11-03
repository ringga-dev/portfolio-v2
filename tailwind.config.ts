import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,vue,ts}',
    './src/pages/**/*.vue',
    './src/app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: 'hsl(var(--accent))',
        surface: 'hsl(var(--surface))',
        muted: 'hsl(var(--muted))',
        border: 'hsl(var(--border))',
      },
    },
  },
  plugins: [],
}

export default config