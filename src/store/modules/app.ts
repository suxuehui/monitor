import { menuItem, routerItem } from '@/interface';
import utils from '@/utils';
import router from '@/router';
import qs from 'qs';
// 循环匹配当前路由数据
function findMenu(
  data: any,
  url: Array<string>,
  tabList: Array<any>,
  tabActiveKey: string,
  params?: string,
  query?: any,
) {
  let result = { tabList, tabActiveKey, key: '' };
  data.forEach((item: any) => {
    if (url.indexOf(item.path.replace(/\/:\w+/g, '')) > -1) {
      if (url.length === 1) {
        result.tabList.push({
          ...item,
          params,
          query,
        });
        result.tabActiveKey = item.name;
        result.key = item.meta.key;
      } else {
        url.shift();
        result = findMenu(item.children, url, tabList, tabActiveKey, params, query);
      }
    }
  });
  return result;
}

const app = {
  state: {
    sidebar: {
      opened: localStorage.getItem('sidebarStatus'),
    },
    theme: 'default',
    menuData: [], // 存储菜单路由数据
    tabList: [], // 页面tab功能数据
    tabActiveKey: '', // 当前激活tab页面
    keepList: [], // 需要缓存的页面name
    isMobile: false, // 是否为移动设备，条件width <= 768px
  },
  mutations: {
    TOGGLE_SIDEBAR: (state: any) => {
      localStorage.setItem('sidebarStatus', state.sidebar.opened ? '1' : '0');
      state.sidebar.opened = !state.sidebar.opened;
    },
    SAVE_MENU: (state: any, menuData: routerItem[]) => {
      state.menuData = menuData;
      // const list: string[] = [];
      // menuData.map(item => list.push(item.name ? item.name : ''));
      // state.keepList = list; // 菜单列表的页面都需要缓存
    },
    TAB_CHANGE: (state: any, data: { tabList: any, tabActiveKey: string }) => {
      state.tabList = data.tabList;
      state.tabActiveKey = data.tabActiveKey;
    },
    KEEP_CHANGE: (state: any, list: Array<string>) => {
      state.keepList = list;
    },
    ISMOBILE: (state: any, isMobile: boolean) => {
      state.isMobile = isMobile;
    },
  },
  actions: {
    ChangeMobile: (context: any, isMobile: boolean) => {
      context.commit('ISMOBILE', isMobile);
    },
    ToggleSideBar: (context: any) => {
      context.commit('TOGGLE_SIDEBAR');
    },
    GetMenuData: (context: any, menuData: routerItem[]) => {
      context.commit('SAVE_MENU', menuData);
    },
    // 新增缓存页面
    addKeep: async (context: any, name: string) => {
      // 新增tab，增加缓存状态
      const { keepList } = context.state;
      if (keepList.indexOf(name) === -1) {
        keepList.push(name);
      }
      await context.commit('KEEP_CHANGE', keepList);
    },
    AddTabPane: (context: any, url: string) => new Promise((resolve, reject) => {
      const {
        menuData, tabList, tabActiveKey, keepList,
      } = context.state;
      let resultData = { tabList, tabActiveKey, key: '' };
      let haveMenu = false;
      const ArrPath = utils.routeToArray(url);
      tabList.map((item: any) => {
        if (ArrPath.routeArr.indexOf(item.path.replace(/\/:\w+/g, '')) > -1) {
          resultData.tabActiveKey = item.name;
          haveMenu = true;
          return false;
        }
        return item;
      });
      if (!haveMenu) {
        const rep = /\?.+/g;
        const query = window.location.href.match(rep);
        resultData = findMenu(menuData, ArrPath.routeArr, tabList, tabActiveKey, ArrPath.params, qs.parse(query ? query[0].substring(1, query[0].length) : ''));
        if (resultData.tabActiveKey) {
          context.dispatch('addKeep', resultData.key);
        }
      }
      context.commit('KEEP_CHANGE', keepList);
      context.commit('TAB_CHANGE', resultData);
      resolve(true);
    }),
    RemoveTab: (context: any, name: string) => {
      let { tabList } = context.state;
      const { keepList } = context.state;
      const resultData = { tabList: [], tabActiveKey: '' };
      tabList = tabList.filter((item: any, index: number) => {
        if (item.name === name) {
          // 关闭tab后，页面跳转到前一个TAB，特殊情况是关闭第一个TAB应该打开第二个TAB
          const onTab = index ? tabList[index - 1] : tabList[index + 1];
          router.push({ name: onTab.name, query: onTab.query, params: onTab.params });
          keepList.splice(keepList.indexOf(item.meta.key), 1);
          context.commit('KEEP_CHANGE', keepList);
          return false;
        }
        return true;
      });
      resultData.tabList = tabList;
      context.commit('TAB_CHANGE', resultData);
    },
    TabChange: (context: any, name: string) => {
      const { tabList } = context.state;
      const resultData = { tabList, tabActiveKey: name };
      context.commit('TAB_CHANGE', resultData);
    },
  },
};

export default app;
