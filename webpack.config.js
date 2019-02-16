'use strict';

const path = require('path');

module.exports = {
  target: 'node',
  entry: {
    extension: './src/extension.ts',
    twitchLanguageServer: './src/twitchLanguageServer.ts',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_module/,
        use: 'ts-loader',
      },
    ]
  },
  externals: {
    // Exclude vscode from webpack since it is generated automatically
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  }
};
