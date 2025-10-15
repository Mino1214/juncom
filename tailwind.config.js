/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#00338D",
          50: "#e8ebf5",
          100: "#c5cbe8",
          200: "#9fa8da",
          300: "#7985cb",
          400: "#5c6bc0",
          500: "#003298",
          600: "#002e8f",
          700: "#00257f",
          800: "#001b6f",
          900: "#00105f",
          brandFrom: "#6a11cb", // 시작
          brandTo: "#2575fc",   // 끝
        },
      },

      /** ✅ 폰트 추가 */
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Open Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};