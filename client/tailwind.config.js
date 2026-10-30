/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink-rgb, 20 16 14) / <alpha-value>)',
        brown: 'rgb(var(--color-brown-rgb, 74 63 58) / <alpha-value>)',
        cream: 'rgb(var(--color-cream-rgb, 235 224 200) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-accent-rgb, 249 165 90) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover-rgb, 232 146 67) / <alpha-value>)',
        },
        white: '#ffffff',
        card: {
          DEFAULT: 'rgb(var(--color-card-rgb, 240 236 230) / <alpha-value>)',
          border: 'var(--color-card-border)',
        },
        muted: 'rgb(var(--color-muted-rgb, 122 122 122) / <alpha-value>)',
        'on-dark-muted': 'var(--color-on-dark-muted)',
        'on-light-muted': 'var(--color-on-light-muted)',
        'border-light': 'var(--color-border-light)',
        'border-dark': 'var(--color-border-dark)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      maxWidth: {
        container: 'var(--container-max-width)',
      },
      spacing: {
        'section-sm': 'var(--section-py-sm)',
        'section-md': 'var(--section-py-md)',
        'section-lg': 'var(--section-py-lg)',
        'section-xl': 'var(--section-py-xl)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [],
};
