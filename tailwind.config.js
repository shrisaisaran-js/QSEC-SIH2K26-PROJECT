/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#02040a",
          900: "#090d16",
          850: "#0f1422",
          800: "#141b2d",
          700: "#1f293d",
          600: "#3d4c67",
        },
        quantum: {
          blue: "#00f0ff",
          purple: "#bd00ff",
          cyan: "#00e5ff",
          indigo: "#4f46e5",
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(0, 240, 255, 0.15)',
        'glow-purple': '0 0 15px rgba(189, 0, 255, 0.15)',
        'glow-cyan-strong': '0 0 25px rgba(0, 240, 255, 0.4)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.2)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.2)',
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse-blue': 'glowPulseBlue 3s infinite alternate',
        'glow-pulse-purple': 'glowPulsePurple 3s infinite alternate',
        'flow-pulse-horizontal': 'flowPulseHorizontal 2.4s linear infinite',
        'flow-pulse-vertical': 'flowPulseVertical 2.4s linear infinite',
      },
      keyframes: {
        glowPulseBlue: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)' },
        },
        glowPulsePurple: {
          '0%': { boxShadow: '0 0 5px rgba(189, 0, 255, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(189, 0, 255, 0.4)' },
        },
        flowPulseHorizontal: {
          '0%': { left: '-10%' },
          '100%': { left: '110%' },
        },
        flowPulseVertical: {
          '0%': { top: '-40%' },
          '100%': { top: '100%' },
        },
      }
    },
  },
  plugins: [],
}
