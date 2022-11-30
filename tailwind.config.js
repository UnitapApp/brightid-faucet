/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      width: {
        68: '17rem',
        100: '25rem',
        104: '26rem',
      },

      colors: {
        primary: '#EF476F',
        secondary: '#F59569',
        input: '#EFF3F8',
        label: '#565656',
        black: '#353535',
        chips: '#5EBAB0',
        gray: '#BFBFBF',
        yellowC: '#FFD166',
        greenC: '#7FE3CA',
        gray00: '#0C0C17',
        gray10: '#11111C',
        gray20: '#13131E',
        gray30: '#1B1B26',
        gray40: '#1E1E29',
        gray50: '#21212C',
        gray80: '#4C4C5C',
        gray90: '#67677B',
        'light-gray': '#EBECEF',
        'light-gray-2': '#EDF2F3',
        'dark-gray': '#757575',
        'gray-90': '#67677B',
        'blue-gray-light': '#E9EFF6',
        'primary-light': '#FFE9EE',
        'primary-light-2': '#F8F0F4',
        'secondary-light': '#FFECE4',
        'secondary-light-2': '#F6C7B4',
        'space-green': '#4CE6A1',
        'dark-space-green': '#274641',
        'disabled-bg': '#C0C0C0',
        'disabled-text': '#939393',
      },
      backgroundImage: {
        primaryGradient: 'linear-gradient(91.35deg, #4BF2A2 -4.66%, #A89FE7 56.06%, #E1C4F4 73.07%, #DD40CD 111.44%)',
        // 'token-left': "url('/img/tokenLeft-background.svg')",
        // gradient: 'linear-gradient(135deg,#5158f6,#822df5 33.76%,#f3a761)',
        // g1: 'linear-gradient(90.54deg, rgba(239, 71, 111, 0.15) -2.28%, rgba(146, 84, 153, 0.15) 102.51%);',
        // 'presale-header': "url('/img/presale-header.svg')",
        // 'public-sale-header': "url('/img/public-header.svg')",
        // squircle: "url('../public/squircle.png')",
        // 'gradient-light': "radial-gradient(62.15% 4494.21% at 43.37% 31.6%, rgba(239, 71, 111, 0.1) 0%, rgba(94, 87, 145, 0.1) 100%)",
        // blob: "url('/img/blob-bg.svg')",
        // blur: "url('/img/blur-bg.svg')",
      },
      dropShadow: {
        'primary-xl': '0px 8px 18px rgba(81, 88, 246, 0.15)',
      },
      zIndex: {
        100: '100',
      },
    },
  },
  // plugins: [require('@tailwindcss/forms'),require('@tailwindcss/aspect-ratio'),],
};
