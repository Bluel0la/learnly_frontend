
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				serif: ['Merriweather', 'serif'],
				sans: ['Inter', 'sans-serif'],
				// Luminous Momentum landing theme (opt-in via font-display / font-luminous-* classes)
				display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
				'luminous-body': ['Inter', 'sans-serif'],
				'luminous-mono': ['"JetBrains Mono"', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#38bdf8', // Sky blue
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: '#64748b', // Slate gray
					foreground: '#ffffff'
				},
				accent: {
					DEFAULT: '#a78bfa', // Purple highlight
					foreground: '#ffffff'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Luminous Momentum landing tokens (additive — light app theme untouched)
				'luminous-primary': '#cbbeff',
				'luminous-primary-container': '#7952ff',
				'luminous-on-primary': '#330098',
				'luminous-secondary': '#d3fbff',
				'luminous-secondary-container': '#00eefc',
				'luminous-tertiary-container': '#645dfa',
				'luminous-void': '#051424',
				'luminous-surface-lowest': '#010f1f',
				'luminous-surface-low': '#0d1c2d',
				'luminous-surface': '#122131',
				'luminous-surface-high': '#1c2b3c',
				'luminous-on-surface': '#d4e4fa',
				midnight: {
					950: '#030712',
					900: '#060913',
					850: '#080d1b',
					800: '#0b1021',
					750: '#10162f',
					700: '#161f3e'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: '1rem',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'card-flip': {
					'0%, 100%': { transform: 'rotateY(0deg)' },
					'50%': { transform: 'rotateY(180deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'card-flip': 'card-flip 0.8s ease-in-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
