import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      colors: {
        border: '#30363D',
        input: '#21262D',
        ring: '#6F42C1',
        background: '#0D1117',
        foreground: '#E6EDF3',
        primary: {
          DEFAULT: '#6F42C1',
          hover: '#8B63D4',
          light: '#A78BFA',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#8B63D4',
          foreground: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#161B22',
          hover: '#1C2128',
          active: '#21262D',
          elevated: '#1C2128',
        },
        overlay: {
          DEFAULT: '#1C2128',
          foreground: '#E6EDF3',
        },
        muted: {
          DEFAULT: '#6E7681',
          foreground: '#8B949E',
        },
        success: {
          DEFAULT: '#2EA043',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#D29922',
          foreground: '#000000',
        },
        danger: {
          DEFAULT: '#F85149',
          foreground: '#FFFFFF',
        },
        info: {
          DEFAULT: '#58A6FF',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#A78BFA',
          foreground: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.3)',
        md: '0 4px 6px rgba(0,0,0,0.4)',
        lg: '0 10px 15px rgba(0,0,0,0.5)',
        xl: '0 20px 25px rgba(0,0,0,0.6)',
        glow: '0 0 20px rgba(111, 66, 193, 0.15)',
        'glow-md': '0 0 30px rgba(111, 66, 193, 0.12)',
        'inner-sm': 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(111, 66, 193, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(111, 66, 193, 0.25)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        fadeIn: 'fadeIn 0.2s ease-out',
        slideInRight: 'slideInRight 0.3s ease-out',
        slideInUp: 'slideInUp 0.2s ease-out',
        scaleIn: 'scaleIn 0.15s ease-out',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
