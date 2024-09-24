
/** @type {import('tailwindcss').Config} */
export default {
  prefix: "tw-",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'lapis_lazuli': { DEFAULT: '#05668d', 100: '#01151d', 200: '#022a39', 300: '#033e56', 400: '#045372', 500: '#05668d', 600: '#089bd5', 700: '#2dbef7', 800: '#73d4fa', 900: '#b9e9fc' }, 'ucla_blue': { DEFAULT: '#427aa1', 100: '#0d1921', 200: '#1b3141', 300: '#284a62', 400: '#356282', 500: '#427aa1', 600: '#6097be', 700: '#88b1ce', 800: '#afcbde', 900: '#d7e5ef' }, 'alice_blue': { DEFAULT: '#ebf2fa', 100: '#132f4e', 200: '#275d9b', 300: '#508dd3', 400: '#9dbfe7', 500: '#ebf2fa', 600: '#eff4fb', 700: '#f3f7fc', 800: '#f7fafd', 900: '#fbfcfe' }, 'asparagus': { DEFAULT: '#679436', 100: '#151e0b', 200: '#293c16', 300: '#3e5a20', 400: '#53782b', 500: '#679436', 600: '#87be4b', 700: '#a5ce78', 800: '#c3dfa5', 900: '#e1efd2' }, 'apple_green': { DEFAULT: '#a5be00', 100: '#212600', 200: '#414b00', 300: '#627100', 400: '#839700', 500: '#a5be00', 600: '#dbfd00', 700: '#e5ff3e', 800: '#eeff7e', 900: '#f6ffbf' },
      'success': {DEFAULT: '#183612'}
    },
    extend: {},
    fontFamily: {
      hebrew: ['Karantina', 'sans-serif'], // Custom font for Hebrew
      // hebrew: ['Noto Serif Hebrew', 'sans-serif'], // Custom font for Hebrew
      // hebrew: ['Amatic SC', 'sans-serif'], // Custom font for Hebrew
    },
  },
  plugins: [
  ],
  
}

