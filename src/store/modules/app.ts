import { menuItem, routerItem } from '@/interface';
import utils from '@/utils';
import router from '@/router';
import qs from 'qs';
/**
 * @method 循环匹配菜单
 * @param {Array} data 菜单数据-参考router.ts
 * @param {Array} url 需要匹配的路由 /infoMange/list/pulbic -> ['/infoMange', 'list', 'public']
 * @param {Array} tabList tab页面组件数据源-由菜单数据过滤生成
 * @param {string} tabActiveKey 当前激活页面的key值, 匹配菜单的里的meta.key值
 * @param {string} params 路由参数 list/2
 * @param {object} query url参数 ?id=12
 * @param {Array} key 已打开页面的key合集数组，用于匹配缓存页面
 */
function findMenu(
  data: any,
  url: Array<string>,
  tabList: Array<any>,
  tabActiveKey: string,
  params?: string,
  query?: any,
  key?: string[],
) {
  let result: any = { tabList, tabActiveKey };
  data.forEach((item: any) => {
    // 过滤 /:id 路由，匹配url数组
    if (url.indexOf(item.path.replace(/\/:\w+/g, '')) > -1) {
      if (!key) {
        key = [];
      }
      // 增加缓存页面的key值
      key.push(item.meta.key);
      // 判断是否是最后一级路由
      if (url.length === 1) {
        result.tabList.push({
          ...item,
          params,
          query,
        });
        result.tabActiveKey = item.name;
      } else {
        // 如果不是，删除第一个路由，递归匹配后面的路由
        url.shift();
        result = findMenu(item.children, url, tabList, tabActiveKey, params, query, key);
      }
    }
  });
  result.key = key;
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
    // 菜单栏收缩状态值
    TOGGLE_SIDEBAR: (state: any) => {
      localStorage.setItem('sidebarStatus', state.sidebar.opened ? '1' : '0');
      state.sidebar.opened = !state.sidebar.opened;
    },
    // 保存菜单数据
    SAVE_MENU: (state: any, menuData: routerItem[]) => {
      state.menuData = menuData;
      // const list: string[] = [];
      // menuData.map(item => list.push(item.name ? item.name : ''));
      // state.keepList = list; // 菜单列表的页面都需要缓存
    },
    // 切换tab栏状态
    TAB_CHANGE: (state: any, data: { tabList: any, tabActiveKey: string }) => {
      state.tabList = data.tabList;
      state.tabActiveKey = data.tabActiveKey;
    },
    // 更新缓存页面key值数组
    KEEP_CHANGE: (state: any, list: Array<string>) => {
      state.keepList = list;
    },
    // 是否为移动端
    ISMOBILE: (state: any, isMobile: boolean) => {
      state.isMobile = isMobile;
    },
    // 清除缓存和tab组件数据
    CLEARTABLE: (state:any) => {
      state.keepList=[];
      state.tabList=[];
      state.tabActiveKey='';
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
    addKeep: async (context: any, name: string | string[]) => {
      // 新增tab，增加缓存状态
      let { keepList } = context.state;
      // 判断是否已有缓存
      if (keepList.indexOf(name) === -1) {
        // 判断是否传入的数组值
        if (typeof name === 'object') {
          keepList = keepList.concat(name);
        } else {
          keepList.push(name);
        }
      }
      // 使用Set去重
      const newList = new Set();
      keepList.forEach((x: string) => newList.add(x));
      keepList = [];
      newList.forEach((x: any) => keepList.push(x));
      await context.commit('KEEP_CHANGE', keepList);
    },
    // 清除列表
    ClearTable: (context: any) => {
      context.commit('CLEARTABLE');
    },
    /**
     * @method 新增tab页面
     * @param {object} context app.state的值
     * @param {string} url 当前路由地址
     */
    AddTabPane: (context: any, url: string) => new Promise((resolve, reject) => {
      const {
        menuData, tabList, tabActiveKey, keepList,
      } = context.state;
      // tab组件数据
      let resultData = { tabList, tabActiveKey, key: '' };
      // 判断是否已经打开页面的值
      let haveMenu = false;
      // 路由url转换为路由数组，只有第一个路由带/
      const ArrPath = utils.routeToArray(url);
      tabList.map((item: any, index: number) => {
        // 去除/:id这种情况进行匹配，匹配成功代表页面第二次打开
        if (ArrPath.routeArr.indexOf(item.path.replace(/\/:\w+/g, '')) > -1) {
          resultData.tabActiveKey = item.name;
          resultData.tabList[index].params = ArrPath.params;
          // 缓存url参数 ?id=123
          const rep = /\?.+/g;
          const query = window.location.href.match(rep);
          if (query) {
            resultData.tabList[index].query = query;
          }
          // 匹配成功退出循环
          haveMenu = true;
          return false;
        }
        return item;
      });
      // 如果页面第一次打开的情况
      if (!haveMenu) {
        const rep = /\?.+/g;
        const query = window.location.href.match(rep);
        // 从菜单数据匹配路由数据
        resultData = findMenu(menuData, ArrPath.routeArr, tabList, tabActiveKey, ArrPath.params, qs.parse(query ? query[0].substring(1, query[0].length) : ''));
        // 新增缓存页面
        if (resultData.tabActiveKey) {
          context.dispatch('addKeep', resultData.key);
        }
      }
      // context.commit('KEEP_CHANGE', keepList);
      // 设置新的tab数据
      context.commit('TAB_CHANGE', resultData);
      resolve(true);
    }),
    /**
     * @method 删除tab项
     * @param {object} context app.state的值
     * @param {string} name 删除的路由名称
     */
    RemoveTab: (context: any, name: string) => {
      let { tabList } = context.state;
      const { keepList } = context.state;
      let onTab: any = null;
      const resultData = { tabList: [], tabActiveKey: '' };
      // 循环过滤掉匹配数据
      tabList = tabList.filter((item: any, index: number) => {
        if (item.name === name) {
          // 关闭tab后，页面跳转到前一个TAB，特殊情况是关闭第一个TAB应该打开第二个TAB
          onTab = index ? tabList[index - 1] : tabList[index + 1];
          keepList.splice(keepList.indexOf(item.meta.key), 1);
          context.commit('KEEP_CHANGE', keepList);
          return false;
        }
        return true;
      });
      // 保存更新tab值
      resultData.tabList = tabList;
      context.commit('TAB_CHANGE', resultData);
      const params: any = {};
      // 组装当前tab的参数
      if (onTab.params) {
        const pattern = /:\w+/g;
        const str = pattern.exec(onTab.path);
        if (str) {
          params[str[0].replace(':', '')] = onTab.params;
        }
      }
      // 更新路由
      router.push({ name: onTab.name, query: onTab.query, params });
    },
    // tab切换函数
    TabChange: (context: any, name: string) => {
      const { tabList } = context.state;
      const resultData = { tabList, tabActiveKey: name };
      context.commit('TAB_CHANGE', resultData);
    },
  },
};

export default app;
