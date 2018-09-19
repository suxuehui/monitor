import lodash from 'lodash';
import { getUserInfo } from '@/api/app';
import config from '@/utils/config';
import router, { asyncRouterMap, constantRouterMap } from '@/router';
import { routerItem } from '@/interface';

interface UserData {
  username: string,
  userid: string,
  avatarUri: string,
  email: string
}

function filterAsyncRouter(
  AsyncRouterMap: routerItem[],
  permission: string[],
): routerItem[] {
  const routerMap = AsyncRouterMap.filter((item) => {
    if (typeof item.permission === 'string') {
      return permission.indexOf(item.permission) > -1;
    } else if (item.permission instanceof Array) {
      const filter = item.permission.filter(items => permission.indexOf(items) > -1);
      if (filter.length && item.children) {
        item.children = filterAsyncRouter(item.children, permission);
      }
      return filter.length;
    }
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
          const permissions: string[] = [];
          if (entity.menus) {
            entity.menus.forEach((item: any, index: number) => {
              permissions.push(item.url);
            });
          }
          context.commit('SVAEUSER', userData);
          context.commit('SAVEROLES', permissions);
          const getRouter = hasPermission(permissions);
          context.dispatch('GetMenuData', getRouter);
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
  },
};

export default user;
