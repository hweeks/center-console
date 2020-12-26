const path = require('path');

module.exports = {
  presets: ['@babel/env', '@babel/typescript'],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
        importSource: path.resolve(__dirname, './lib/runtime'),
      },
    ],
  ],
};
