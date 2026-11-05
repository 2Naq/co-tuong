/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */

module.exports = {
  plugins: ["prettier-plugin-tailwindcss"],
  printWidth: 80,
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",
  // trailingComma: "es5",
};