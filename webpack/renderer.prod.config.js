const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./renderer.base.config');

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: path.join(__dirname, '../src/renderer/index.tsx'),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'renderer.prod.js'
  }
});
