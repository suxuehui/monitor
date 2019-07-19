import lodash from 'lodash';
import { getUserInfo } from '@/api/app';
import config from '@/utils/config';
import router, { asyncRouterMap, constantRouterMap } from '@/router';
import { routerItem } from '@/interface';
import Raven from 'raven-js';

interface UserData {
  username: string,
  userid: string,
  avatarUri: string,
  email: string
}

/**
 * @method 权限匹配路由数据
 * @param {Array} AsyncRouterMap 需要异步匹配权限的路由
 * @param {Array} permission 权限数据
 */
function filterAsyncRouter(
  AsyncRouterMap: routerItem[],
  permission: string[],
): routerItem[] {
  const routerMap = AsyncRouterMap.filter((item) => {
    // 匹配字符串
    if (typeof item.permission === 'string') {
      return permission.indexOf(item.permission) > -1;
    } if (item.permission instanceof Array) { // 有子菜单的路由, 只需匹配数组中的其中一个就为true
      const filter = item.permission.filter(items => permission.indexOf(items) > -1);
      // 判断是否有子路由，递归匹配
      if (filter.length && item.children) {
        item.children = filterAsyncRouter(item.children, permission);
      }
      return filter.length;
    }
    // 其他的就是boolean值情况
    return item.permission;
  });
  return routerMap;
}

const hasPermission = (permission: string[]) => { // 过滤路由
  const filterRouter = filterAsyncRouter(lodash.cloneDeep(asyncRouterMap), permission);
  router.addRoutes(filterRouter);
  return filterRouter;
};

const user = {
  state: {
    users: {
      username: '',
      userid: '',
      avatar_uri: '',
      email: '',
    },
    roles: [],
    permission_routers: [],
    spinning: true,
  },
  mutations: {
    SAVEROLES: (state: any, roles: Array<any>) => {
      state.roles = roles;
    },
    SVAEUSER: (state: any, userData: UserData) => {
      state.users = userData;
    },
    LOADING: (state: any, loading: boolean) => {
      state.spinning = loading;
    },
  },
  actions: {
    // 获取用户数据
    getUserInfo: (context: any) => new Promise((resolve, reject) => {
      context.commit('LOADING', false);
      getUserInfo(null).then(({ result, entity }) => {
        context.commit('LOADING', true);
        if (result.resultCode === '0') {
          const userData: UserData = {
            username: entity.userName,
            userid: entity.userId,
            avatarUri: '',
            email: entity.remark,
          };
          // 设置日志用户数据
          Raven.setUserContext({
            userName: entity.userName,
            userId: entity.userId,
            lastLoginTime: entity.lastLoginTime,
          });
          // 初始化权限数据
          const permissions: string[] = [];
          if (entity.menus) {
            entity.menus.forEach((item: any, index: number) => {
              permissions.push(item.url);
            });
          }
          context.commit('SVAEUSER', userData);
          context.commit('SAVEROLES', permissions);
          // 获取权限过滤后的路由
          const getRouter = hasPermission(permissions);
          context.dispatch('GetMenuData', getRouter);
          // 如果当前路由为登录页面，跳转到dashboard
          if (config.noLoginList.indexOf(window.location.hash) > -1) {
            router.replace({ path: '/dashboard' });
          }
          resolve(entity);
        } else {
          reject(result.resultMessage);
        }
      }).catch((error) => {
        context.commit('LOADING', true);
        reject(error);
      });
    }),
    // 检查多个接口是否有权限
    checkPermission: (context: any, roleList:string[]) => new Promise((resolve, reject) => {
      const allPer: string[] = user.state.roles;
      const perArr: boolean[] = [];
      try {
        roleList.forEach((item: string) => {
          if (allPer.indexOf(item) > -1) {
            perArr.push(true);
          } else {
            perArr.push(false);
          }
        });
        resolve(perArr);
      } catch (error) {
        reject(error);
      }
    }),
    // 加载loading
    showLoading: (context: any,flag:boolean) => {
      context.commit('LOADING', flag)
    },
  },
};

export default user;
