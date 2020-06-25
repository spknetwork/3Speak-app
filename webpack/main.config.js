const path = require('path');
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  target: 'electron-main',
  entry: path.join(__dirname, '../src/main/index.js'),
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'main.prod.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            {
              plugins: [
                '@babel/plugin-proposal-class-properties'
              ]
            }
          ]
        }
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  plugins: [new webpack.ExternalsPlugin("commonjs", ["leveldown"])]
};