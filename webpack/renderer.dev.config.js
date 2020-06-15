const path = require('path');
const merge = require('webpack-merge');
const {spawn} = require('child_process');
const baseConfig = require('./renderer.base.config');

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  entry: path.join(__dirname, '../src/renderer/index.js'),
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'renderer.dev.js'
  },
  devServer: {
    hot: true,
    compress: true,
    port: 6789,
    contentBase: path.join(__dirname, '../src/renderer'),
    after() {
      spawn('npm', ['run', 'start-main'], {
        shell: true,
        env: process.env,
        stdio: 'inherit'
      })
        .on('close', code => process.exit(code))
        .on('error', spawnError => console.error(spawnError));
    }
  }
});
