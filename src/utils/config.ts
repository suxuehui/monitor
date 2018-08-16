const Logo = require('../assets/logo.svg');

const API = process.env.NODE_ENV === 'production' ? '' : '/api';

const config = {
  name: '激佩丝兴享融系统',
  footerText: '激佩丝兴享融系统  © 2017 激佩丝',
  logo: Logo,
  icon: '/favicon.ico',
  API,
  openPages: ['/login', '/404', '/401'], // 全屏页面
  noLoginList: ['#/login'],
};

export default config;
