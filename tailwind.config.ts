import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'prime-dark': '#000c26',
        'prime-red': '#a82217',
        'prime-cream': '#f6ebcf',
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'prime-gradient': 'linear-gradient(135deg, #000c26 0%, #1a1a3e 100%)',
      },
    },
  },
  plugins: [],
}
export default config
