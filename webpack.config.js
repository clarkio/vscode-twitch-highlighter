'use strict';

const path = require('path');
const { CLEAN_WEBPACK_PLUGIN } = require('clean-webpack-plugin');
const COPY_PLUGIN = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
  entry: {
    extension: './src/extension.ts',
    ttvchat: './src/ttvchat/index.ts',
    test: './src/test',
  },
  devtool: 'source-map',
  plugins: [
    new CLEAN_WEBPACK_PLUGIN(),
    new COPY_PLUGIN({
      patterns: [{ from: 'src/ttvchat/login', to: 'ttvchat/login' }],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_module/,
        use: 'ts-loader',
      },
    ],
  },
  externals: {
    // Exclude vscode from webpack since it is generated automatically
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
};
