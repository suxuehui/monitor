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
    disableHostCheck: true,
    proxy: {
      '/api': {
        // target: 'http://192.168.6.194:5555/monitor/', // 开发环境地址/
        // target: 'http://192.168.6.232:5555/monitor/', // 测试环境地址
        target: 'http://192.168.6.214:5555/monitor/', // 预发布环境地址
        // target: 'https://monitor-blacktea.mysirui.com/api/monitor/', // 正式环境地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
      '/rootApi': {
        // target: 'http://192.168.6.194:5555/', // 开发环境地址
        // target: 'http://192.168.6.232:5555/', // 测试环境地址
        target: 'http://192.168.6.214:5555/', // 预发布环境地址
        // target: 'https://monitor-blacktea.mysirui.com/api/', // 正式环境地址
        changeOrigin: true,
        pathRewrite: {
          '^/rootApi': '',
        },
      },
    },
  },
};

