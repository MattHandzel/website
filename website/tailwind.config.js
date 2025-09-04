/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#14B8A6', // Teal/Cyan for growth and interest
        secondary: '#3B82F6', // Cool Blue for productivity
        background: '#F5F5F5', // Very light gray for clean background
        text: '#1F2937', // Dark gray for readability
        border: '#E5E7EB', // Subtle gray for borders
        accent: '#14B8A6', // Same as primary for consistency in highlights
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
