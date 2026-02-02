/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // We'll handle colors via variables
    theme: {
        extend: {
            colors: {
                // Semantic Backgrounds
                bg: {
                    void: 'rgb(var(--bg-void) / <alpha-value>)',      // Main background
                    primary: 'rgb(var(--bg-primary) / <alpha-value>)', // Secondary background
                    elevated: 'rgb(var(--bg-elevated) / <alpha-value>)', // Cards
                },
                // Semantic Text
                text: {
                    main: 'rgb(var(--text-main) / <alpha-value>)',
                    muted: 'rgb(var(--text-muted) / <alpha-value>)',
                    dim: 'rgb(var(--text-dim) / <alpha-value>)',
                    inverse: 'rgb(var(--text-inverse) / <alpha-value>)',
                },
                // Base Foreground (for borders/alphas)
                fg: 'rgb(var(--fg-base) / <alpha-value>)',

                // Accent
                accent: {
                    DEFAULT: '#ff4d00',
                    dim: 'rgba(255, 77, 0, 0.1)',
                    glow: 'rgba(255, 77, 0, 0.4)',
                }
            },
            fontFamily: {
                display: ['Space Grotesk', 'sans-serif'],
                body: ['Plus Jakarta Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, rgb(var(--fg-base) / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--fg-base) / 0.05) 1px, transparent 1px)",
            },
            animation: {
                'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
                'float-slow': 'float 8s ease-in-out infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(255, 77, 0, 0.2)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(255, 77, 0, 0.4)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        }
    },
    plugins: [],
}
