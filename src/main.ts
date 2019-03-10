import Vue from 'vue';
import { Message, Loading } from 'element-ui';
// 自定义全局组件
import FilterTable from '@/components/FilterTable/index.vue';

import App from '@/App';
import router from '@/router';
import store from '@/store';
import config from '@/utils/config';
// import '@/mock';

import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

import './styles/global.less';

const options = {
  position: 'fixed',
  show: true,
  height: '3px',
};
if (process.env.NODE_ENV === 'production') {
  Raven.config('https://95130553210b494592fdb8be63b291be@frontend-monitor.mysirui.com//2')
    .addPlugin(RavenVue, Vue)
    .install();
  Vue.config.errorHandler = (err, vm, info) => {
    Raven.captureException(err);
  };
}

Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 };

// Vue.use(VueInsProgressBar, options);
Vue.prototype.$message = Message;
Vue.prototype.$loading = Loading.service;
Vue.component('filter-table', FilterTable);

Vue.config.productionTip = false;

let flag: boolean = true;
// 路由拦截，权限验证和菜单生成
router.beforeEach((to, from, next) => {
  if (!store.state.app.menuData.length && flag) { // 判断是否获取到菜单数据,并且只执行一次
    flag = false;
    store.dispatch('getUserInfo').then(() => {
      const toPath = config.noLoginList.indexOf(`#${to.path}`) > -1 ? '/dashboard' : to.path;
      store.dispatch('AddTabPane', toPath).then(() => {
        next({
          path: toPath, query: to.query, params: to.params, replace: true,
        });
      });
    }).catch((err) => {
      if (config.noLoginList.indexOf(to.path) < 0) {
        next({ name: '登录', replace: true });
      }
      next();
    });
    return false;
  }
  next();
  return true;
});


new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
