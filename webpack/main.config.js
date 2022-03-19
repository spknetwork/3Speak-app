const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  target: 'electron-main',
  entry: path.join(__dirname, '../src/main/index.ts'),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'main.prod.js',
  },
  module: {
    rules: [{ test: /\.ts?$/, use: 'ts-loader', exclude: /node_modules/ }],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  plugins: [
    new webpack.ExternalsPlugin('commonjs', [
      'leveldown',
      'ky-universal',
      'ipfs-http-client',
      'pouchdb',
      'pouchdb-find',
    ]),
    new webpack.DefinePlugin({
      'process.env.FLUENTFFMPEG_COV': false,
    }),
  ],
}
