module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/styles/**/*.css",
    "./public/index.html"
  ],
  theme: {
    extend: {
       fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        opensans: ["Open Sans", "sans-serif"],
      },
      screens: {
        'lg': '950px',  // Adjusting the lg breakpoint to 950px
      },
      colors: {
        primary: {
          50: '#FFEEEE',
          100: '#FFD6D6',
          200: '#FFA8A8',
          300: '#FF7A7A',
          400: '#FF4C4C',
          DEFAULT: '#DA291C', // Your brand red
          600: '#C02519',
          700: '#A72016',
          800: '#8D1B13',
          900: '#731610'
        },
        secondary: {
          50: '#E6E6FF',
          100: '#C7C7FF',
          200: '#8F8FFF',
          300: '#5757FF',
          400: '#1F1FFF',
          DEFAULT: '#000080', // Navy blue
          600: '#000073',
          700: '#000066',
          800: '#000059',
          900: '#00004D'
        },
        accent: {
          DEFAULT: '#FFD166', // Golden yellow
          dark: '#FFC233'
        },
        fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
      },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121'
        }
      },
      boxShadow: {
        'soft': '0 10px 40px -15px rgba(0, 0, 0, 0.15)',
        'button': '0 4px 14px rgba(218, 41, 28, 0.25)',
        'button-hover': '0 6px 20px rgba(218, 41, 28, 0.3)',
        'input': '0 2px 6px rgba(0, 0, 0, 0.05)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.12)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'shadow': 'box-shadow',
        'transform': 'transform',
        'border': 'border-color',
        'colors': 'background-color, border-color, color, fill, stroke',
        'opacity': 'opacity'
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms'
      },
      transitionTimingFunction: {
        'in-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-out-back': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // Only use global styles for form elements
    }),
    require('tailwindcss-animate'),
  ],
}