/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core Velocity Spectrum
        velocity: {
          blue: '#0D6CFF',      // Velocity Blue - primary actions
          black: '#05060A',     // Deep Core Black - foundation
          graphite: '#14171D',  // Hypergraphite - panels/cards
          cyan: '#15E2FF',      // Signal Cyan - system response
          white: '#F4F8FF',     // Pulse White - text contrast
          lime: '#9BFF4A',      // Neon Vector Lime - device detection
          success: '#2EFFB2',   // Success
          warning: '#FFB82E',   // Warning
          danger: '#FF3C3C',    // Danger
        },
        // Dark theme color palette
        dark: {
          bg: '#0f1419',
          card: '#1a1f2e',
          border: '#2d3748',
          text: '#e2e8f0',
          muted: '#94a3b8',
        },
        // Grimoire legacy support
        grimoire: {
          obsidian: '#0B0E11',
          'obsidian-light': '#151821',
          'electric-blue': '#00C9FF',
          'thunder-gold': '#FFDB56',
          'abyss-purple': '#7A14FF',
          'phoenix-orange': '#FF6B35',
          'neon-cyan': '#00FFF5',
          'smoke-gray': '#4A4A5C',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        inter: ['Inter', 'sans-serif'],
        grimoire: ['Cinzel', 'serif'],
        tech: ['Orbitron', 'monospace'],
      },
      backgroundImage: {
        'velocity-gradient': 'linear-gradient(90deg, #0D6CFF 0%, #15E2FF 100%)',
        'velocity-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(21, 226, 255, 0.3) 50%, transparent 100%)',
        'scanlines': 'repeating-linear-gradient(0deg, rgba(21, 226, 255, 0.03) 0px, rgba(21, 226, 255, 0.03) 1px, transparent 1px, transparent 2px)',
        'grimoire-gradient': 'linear-gradient(135deg, #0B0E11 0%, #1a1d2e 50%, #0B0E11 100%)',
        'electric-glow': 'radial-gradient(circle, rgba(0, 201, 255, 0.15) 0%, transparent 70%)',
        'thunder-strike': 'linear-gradient(90deg, transparent 0%, #FFDB56 50%, transparent 100%)',
        'abyss-smoke': 'radial-gradient(ellipse at center, rgba(122, 20, 255, 0.2) 0%, transparent 70%)',
        'phoenix-flame': 'radial-gradient(circle, rgba(255, 107, 53, 0.25) 0%, transparent 60%)',
      },
      boxShadow: {
        'velocity-glow': '0 0 20px rgba(13, 108, 255, 0.5), 0 0 40px rgba(13, 108, 255, 0.2)',
        'cyan-glow': '0 0 15px rgba(21, 226, 255, 0.6), inset 0 0 10px rgba(21, 226, 255, 0.1)',
        'glow-blue': '0 0 20px rgba(0, 201, 255, 0.5), 0 0 40px rgba(0, 201, 255, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 219, 86, 0.5), 0 0 40px rgba(255, 219, 86, 0.3)',
        'glow-purple': '0 0 20px rgba(122, 20, 255, 0.5), 0 0 40px rgba(122, 20, 255, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 107, 53, 0.3)',
        'scroll-inner': 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        // Core Velocity animations
        'velocity-shimmer': 'velocity-shimmer 0.6s ease-in-out',
        'velocity-pulse': 'velocity-pulse 2s ease-in-out infinite',
        'cyan-scan': 'cyan-scan 3s linear infinite',
        'cyan-pulse': 'cyan-pulse 1.5s ease-in-out infinite',
        'velocity-ring': 'velocity-ring 3s ease-out infinite',
        'glyph-float': 'glyph-float 4s ease-in-out infinite',
        // Legacy animations
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'lightning-strike': 'lightning-strike 0.5s ease-in-out',
        'smoke-float': 'smoke-float 4s ease-in-out infinite',
        'flame-flicker': 'flame-flicker 1.5s ease-in-out infinite',
        'chain-break': 'chain-break 0.8s ease-out forwards',
        'glyph-appear': 'glyph-appear 0.6s ease-out forwards',
      },
      keyframes: {
        // Core Velocity keyframes
        'velocity-shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'velocity-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(13, 108, 255, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(13, 108, 255, 0.8)' },
        },
        'cyan-scan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
        'cyan-pulse': {
          '0%, 100%': { opacity: '0.4', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.2)' },
        },
        'velocity-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'glyph-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        // Legacy keyframes
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        'lightning-strike': {
          '0%': { opacity: '0', transform: 'scaleY(0)' },
          '50%': { opacity: '1', transform: 'scaleY(1.2)' },
          '100%': { opacity: '0.7', transform: 'scaleY(1)' },
        },
        'smoke-float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.6' },
          '50%': { transform: 'translateY(-10px) scale(1.05)', opacity: '0.8' },
        },
        'flame-flicker': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '25%': { opacity: '0.9', transform: 'scale(1.05)' },
          '50%': { opacity: '1', transform: 'scale(0.98)' },
          '75%': { opacity: '0.95', transform: 'scale(1.02)' },
        },
        'chain-break': {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'translateX(-5px) rotate(-10deg)', opacity: '0.8' },
          '100%': { transform: 'translateX(100px) rotate(45deg)', opacity: '0' },
        },
        'glyph-appear': {
          '0%': { opacity: '0', transform: 'scale(0.8) rotate(-5deg)' },
          '60%': { opacity: '1', transform: 'scale(1.1) rotate(2deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
