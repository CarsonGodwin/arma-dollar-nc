/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'texas-red': '#BF0D3E',
        'texas-blue': '#002868',
        'texas-gold': '#D4A84B',
        'texas-cream': '#F5F1E8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
