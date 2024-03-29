const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'electron-renderer',
  devtool: 'cheap-module-eval-source-map',
  externals: {
    mssql: 'commonjs mssql'
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      },
      {
        test: /\.(sass|scss)$/,
        loader: 'style-loader!css-loader!sass-loader'
      },
      {
        test: /\.(eot|woff|woff2|ttf|ico|gif|png|jpg|jpeg|webp|svg)$/,
        loader: 'file-loader',
        options: {
          limit: 1024,
          name: 'assets/[folder]/[name].[ext]',
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, '../src/renderer/index.html')
    })
  ],
  node: {
    __dirname: false,
    __filename: false
  }
};