module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  rules: {
    'linebreak-style': 0,
    'import/extensions': 0,
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  globals: {
    getConsoleOutput: true,
    NodeJS: true,
    ConsoleDiv: true,
  },
};
