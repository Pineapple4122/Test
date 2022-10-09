// 参考https://cesium.com/blog/2016/01/26/cesium-and-webpack/
// https://www.jianshu.com/p/85917bcc023f

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NODE_ENV = process.env.NODE_ENV === 'prd' ? 'prd' : 'dev'

const cesiumSource = './Source';
const cesiumWorkers = '../Build/Cesium/Workers';

let config = {
  entry: './example/app.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    //需要编译Cesium中的多行字符串 
    sourcePrefix: ''
  },
  amd: {
      //允许Cesium兼容 webpack的require方式 
      toUrlUndefined: true
  },
  mode: 'development',
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      'cesium': path.resolve(__dirname, 'node_modules/cesium')
    },
    fallback: {
      fs: false
    }
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test:/\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(frag|vert)$/,
        loader: 'webpack-glsl-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './example/index.html',
    }),
    // Copy Cesium Assets, Widgets, and Workers to a static directory
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(cesiumSource, cesiumWorkers), to: 'cesium/Workers' },
        { from: path.join(cesiumSource, 'Assets'), to: 'cesium/Assets' },
        { from: path.join(cesiumSource, 'Widgets'), to: 'cesium/Widgets' },
        { from: path.join(cesiumSource, 'ThirdParty copy'), to: 'cesium/ThirdParty' },
      ],
    }),
    new webpack.DefinePlugin({
        //Cesium载入静态的资源的相对路径
        CESIUM_BASE_URL: JSON.stringify('cesium/')
    }),
    new webpack.HotModuleReplacementPlugin(), // 热更新插件
  ],
  devServer: {
    contentBase: './dist',      // 开发环境的服务目录
    historyApiFallback: true,
    inline: true,
    port: 9000
  }
};

if (NODE_ENV === 'dev') {
  config = Object.assign(config, {
    optimization: {
      minimize: false
    },
    devtool: "source-map"
  })
}

module.exports = config;