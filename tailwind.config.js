export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'loader-rotate': 'loader-rotate 1.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
      },
      keyframes: {
        'loader-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
