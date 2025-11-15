/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Ensure focus ring is visible and meets accessibility standards
      ringWidth: {
        DEFAULT: '2px',
      },
      ringOffsetWidth: {
        DEFAULT: '2px',
      },
    },
    // Confirm standard breakpoints for responsive design
    // mobile: < 640px (default)
    // tablet: 640px - 1024px (sm to lg)
    // desktop: > 1024px (lg and above)
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
}
