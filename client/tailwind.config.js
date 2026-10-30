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
        ink: 'var(--color-ink)',
        brown: 'var(--color-brown)',
        cream: 'var(--color-cream)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        white: 'var(--color-white)',
        card: {
          DEFAULT: 'var(--color-card)',
          border: 'var(--color-card-border)',
        },
        muted: 'var(--color-muted)',
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
