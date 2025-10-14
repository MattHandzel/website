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
        // Living Systems Theme - Dark Mode (default)
        bg: {
          DEFAULT: '#0C0F10',
          light: '#F5F5F5',
        },
        surface: {
          DEFAULT: '#121619',
          light: '#FFFFFF',
        },
        text: {
          DEFAULT: '#E6EEF3',
          light: '#1F2937',
        },
        muted: {
          DEFAULT: '#9AB0BE',
          light: '#6B7280',
        },
        accent: {
          DEFAULT: '#22B8CF',
          light: '#0891B2',
        },
        'accent-2': {
          DEFAULT: '#6EE7F0',
          light: '#06B6D4',
        },
        
        // Legacy aliases for compatibility
        primary: '#22B8CF',
        secondary: '#6EE7F0',
        background: '#0C0F10',
        border: {
          DEFAULT: '#1f2528',
          light: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'draw-edge': 'drawEdge 0.4s ease-out forwards',
        'node-glow': 'nodeGlow 0.15s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        drawEdge: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        nodeGlow: {
          '0%': { filter: 'drop-shadow(0 0 0px rgba(34, 184, 207, 0))' },
          '100%': { filter: 'drop-shadow(0 0 8px rgba(34, 184, 207, 0.8))' },
        },
      },
      transitionDuration: {
        '140': '140ms',
        '180': '180ms',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
