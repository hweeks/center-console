const path = require('path');

module.exports = {
  presets: ['@babel/env', '@babel/typescript'],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        throwIfNamespace: false, // defaults to true
        runtime: 'automatic', // defaults to classic
        importSource: path.resolve(__dirname, './lib/runtime'), // defaults to react
      },
    ],
  ],
};
