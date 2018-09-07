const Logo = require('../assets/logo.svg');

const API = process.env.NODE_ENV === 'production' ? '' : '/api';

const config = {
  name: '共享车监控系统',
  footerText: '共享车监控系统  © 2017 桴之科',
  logo: Logo,
  icon: '/favicon.ico',
  API,
  openPages: ['/login', '/404', '/401'], // 全屏页面
  noLoginList: ['#/login'],
};

export default config;
