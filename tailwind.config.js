/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./admindashboard.html",
    "./adminlogin.html",
    "./script.js",
    "./adminscript.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
