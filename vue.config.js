// 导入compression-webpack-plugin
const CompressionWebpackPlugin = require('compression-webpack-plugin');
// 定义压缩文件类型
const productionGzipExtensions = ['js', 'css'];

module.exports = {
  outputDir: 'dist',

  // 默认情况下 babel-loader 忽略其中的所有文件 node_modules
  transpileDependencies: [],

  // 生产环境 sourceMap
  productionSourceMap: false,

  // configureWebpack: (config) => {
  //   if (process.env.NODE_ENV === 'production') {
  //     // 为生产环境修改配置...
  //   } else {
  //     // 为开发环境修改配置...
  //   }
  // },

  configureWebpack: {
    plugins: [
      new CompressionWebpackPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        // test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8,
      }),
    ],
  },

  chainWebpack: (config) => {
    'use strict';

    config.module
      .rule('tsx')
      .test(/\.tsx$/)
      .use('vue-jsx-hot-loader')
      .before('babel-loader')
      .loader('vue-jsx-hot-loader');
    config.plugin('html').tap((args) => {
      args[0].chunksSortMode = 'none';
      return args;
    });
  },

  css: {
    // 是否使用 css 分离插件 ExtractTextPlugin，采用独立样式文件载入，不采用 <style> 方式内联至 html 文件中
    extract: true,

    // 是否构建样式地图，false 将提高构建速度
    sourceMap: false,
  },

  devServer: {
    disableHostCheck: true,
    proxy: {
      '/api': {
        // target: 'http://192.168.3.83:5555/monitor/', // 开发环境地址/
        // target: 'http://192.168.6.194:5555/monitor/', // 开发环境地址/
        // target: 'http://test-monitor-blacktea.mysirui.com/api/monitor/', // 测试环境地址
        //target: 'http://pre-monitor-blacktea.mysirui.com/api/monitor/', // 预发布环境地址
         target: 'https://monitor-blacktea.mysirui.com/api/monitor/', // 正式环境地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
      '/rootApi': {
        // target: 'http://192.168.3.83:5555/', // 开发环境地址
        // target: 'http://192.168.6.194:5555/', // 开发环境地址
        // target: 'http://test-monitor-blacktea.mysirui.com/api/', // 测试环境地址
         //target: 'http://pre-monitor-blacktea.mysirui.com/api/', // 预发布环境地址
        target: 'https://monitor-blacktea.mysirui.com/api/', // 正式环境地址
        changeOrigin: true,
        pathRewrite: {
          '^/rootApi': '',
        },
      },
    },
  },
};
