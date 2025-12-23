/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Claude-inspired color palette
        claude: {
          bg: '#FFFFFF',
          'bg-secondary': '#F5F5F4',
          'bg-tertiary': '#E7E5E4',
          text: '#1C1917',
          'text-secondary': '#57534E',
          'text-tertiary': '#78716C',
          border: '#E7E5E4',
          'border-hover': '#D6D3D1',
          accent: '#D97706',
          'accent-hover': '#B45309',
          'accent-light': '#FEF3C7',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
