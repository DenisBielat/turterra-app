import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	colors: {
		transparent: 'transparent',
		currentColor: 'currentColor',
		white: '#fafafa',
		black: '#0e0e0e',
		gray: {
			50: '#f6f6f6',
			100: '#e7e7e7',
			200: '#d1d1d1',
			300: '#b0b0b0',
			400: '#888888',
			500: '#6d6d6d',
			600: '#5d5d5d',
			700: '#4f4f4f',
			800: '#454545',
			900: '#3d3d3d',
		},
	},
  	extend: {
  		colors: {
			warm: '#f2f0e7',
			green: {
				50: '#eefff5',
				100: '#d7ffea',
				200: '#b2ffd6',
				300: '#76ffb7',
				400: '#33f590',
				500: '#09de6f',
				600: '#00c35e',
				700: '#049149',
				800: '#0a713d',
				900: '#00472c',
				950: '#16261f',
    		},
			blue: {
				50: '#eff5ff',
				100: '#dce8fd',
				200: '#c0d8fd',
				300: '#95c0fb',
				400: '#649df6',
				500: '#3f79f2',
				600: '#3765e8',
				700: '#2146d4',
				800: '#213bac',
				900: '#203588',
				950: '#182353',
			},
			orange: {
				50: '#fef9ec',
				100: '#fbefca',
				200: '#f6de91',
				300: '#f2c757',
				400: '#eeb231',
				500: '#ffa91e',
				600: '#cc6f13',
				700: '#aa4f13',
				800: '#8a3e16',
				900: '#723415',
				950: '#411907',
			},
			red: {
				50: '#fef2f2',
				100: '#fee5e5',
				200: '#fbd0d2',
				300: '#f8a9ad',
				400: '#f37981',
				500: '#ea4959',
				600: '#d62841',
				700: '#c51e3a',
				800: '#971a32',
				900: '#821931',
				950: '#480916',
			},
			violet: {
				50: '#f4f0ff',
				100: '#ebe4ff',
				200: '#d9cdff',
				300: '#bfa6ff',
				400: '#a173ff',
				500: '#873bff',
				600: '#7d14ff',
				700: '#6f00ff',
				800: '#5e01d6',
				900: '#4e03af',
				950: '#2e0077',
			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
		fontFamily: {
			body: ['var(--font-averta)'],
			heading: ['var(--font-outfit)'],
		},
		maxWidth: {
			'8xl': '90rem',
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
