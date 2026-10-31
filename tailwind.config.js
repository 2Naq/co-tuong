/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      // colors: {
      //   border: 'hsl(var(--ziga-border))',
      //   input: 'hsl(var(--ziga-input))',
      //   ring: 'hsl(var(--ziga-ring))',
      //   background: 'hsl(var(--ziga-background))',
      //   foreground: 'hsl(var(--ziga-foreground))',
      //   primary: {
      //     DEFAULT: 'hsl(var(--ziga-primary))',
      //     foreground: 'hsl(var(--ziga-primary-foreground))'
      //   },
      //   secondary: {
      //     DEFAULT: 'hsl(var(--ziga-secondary))',
      //     foreground: 'hsl(var(--ziga-secondary-foreground))'
      //   },
      //   destructive: {
      //     DEFAULT: 'hsl(var(--ziga-destructive))',
      //     foreground: 'hsl(var(--ziga-destructive-foreground))'
      //   },
      //   muted: {
      //     DEFAULT: 'hsl(var(--ziga-muted))',
      //     foreground: 'hsl(var(--ziga-muted-foreground))'
      //   },
      //   accent: {
      //     DEFAULT: 'hsl(var(--ziga-accent))',
      //     foreground: 'hsl(var(--ziga-accent-foreground))'
      //   },
      //   popover: {
      //     DEFAULT: 'hsl(var(--ziga-popover))',
      //     foreground: 'hsl(var(--ziga-popover-foreground))'
      //   },
      //   card: {
      //     DEFAULT: 'hsl(var(--ziga-card))',
      //     foreground: 'hsl(var(--ziga-card-foreground))'
      //   }
      // },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem'
      }
    }
  },
  plugins: []
};
