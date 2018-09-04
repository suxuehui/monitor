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
        // target: 'http://192.168.1.240:3000/mock/11', // mock地址
        // target: 'http://192.168.6.234:3035/monitor/', // 测试环境地址
        target: 'http://192.168.6.160:5555/monitor/', // 开发环境地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
      '/rootApi': {
        // target: 'http://192.168.1.240:3000/mock/11', // mock地址
        target: 'http://192.168.6.160:5555/', // 开发环境地址
        changeOrigin: true,
        pathRewrite: {
          '^/rootApi': '',
        },
      },
    },
  },
};

