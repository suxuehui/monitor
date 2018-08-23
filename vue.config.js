module.exports = {
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
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://192.168.6.160:3035/',
        target: 'http://192.168.1.240:3000/mock/11/',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
};

