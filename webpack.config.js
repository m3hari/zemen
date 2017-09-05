const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    'zemen.min': './zemen.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js",
    library: 'zemen',
    libraryTarget: 'umd'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["es2015"]
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist',], { verbose: true, dry: false }),
    new webpack.optimize.UglifyJsPlugin({ include: /\.min\.js$/, minimize: true, compress: { warnings: false } })
  ]
};