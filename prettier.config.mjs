/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  semi: true,
  printWidth: 80,
  endOfLine: 'lf',
  bracketSameLine: false,
  arrowParens: 'always',
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
