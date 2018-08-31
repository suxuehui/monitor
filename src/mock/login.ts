import qs from 'qs';
import utils from '@/utils';
import { MockConfig } from '@/interface';

import baseData from '@/mock/baseData';

interface UserMap {
  id: number,
  username: string,
  password: string,
  permissions: Premission,
}
interface Premission {
  role: string,
  permission?: Array<string>
}
const EnumRoleType = {
  ADMIN: 'admin',
  DEFAULT: 'guest',
  DEVELOPER: 'developer',
};
const userPermission: Premission[] = [
  {
    permission: [
      '/device/vehicle/list',
      '/device/trip/list',
      '/car/model/list',
      '/car/eleFence/list',
      '/equipment/list',
      '/customer/merchants/list',
      '/message/notice/list',
      '/message/alarm/list',
      '/data/driving/list',
      '/permission/members/list',
      '/permission/role/list',
      '/system/setting/list',
      '/model/brand/list',
      '/model/series/list',
      '/model/model/list',
    ],
    role: EnumRoleType.ADMIN,
  },
  {
    permission: ['1', '2', '21', '7', '5', '51', '52', '53'],
    role: EnumRoleType.DEFAULT,
  },
  {
    role: EnumRoleType.DEVELOPER,
  },
];
const userMap: UserMap[] = [
  {
    id: 0,
    username: 'admin',
    password: 'admin',
    permissions: userPermission[0],
  }, {
    id: 1,
    username: 'guest',
    password: 'guest',
    permissions: userPermission[1],
  }, {
    id: 2,
    username: '吴彦祖',
    password: '123456',
    permissions: userPermission[2],
  },
];

export default {
  loginByUsername: (config: MockConfig) => {
    const { username, password, authCode } = qs.parse(config.body);
    const user = userMap.filter(item => item.username === username);

    if (user.length > 0 && user[0].password === password) {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      const data = baseData('success', '登录成功');
      data.entity = {
        token: JSON.stringify({ id: user[0].id, deadline: now.getTime() }),
      };
      return data;
    }
    return baseData('error', '用户名密码错误');
  },
  getUserInfo: (config: MockConfig) => {
    const user = userMap[0];
    const data = baseData('success', '获取成功');
    data.entity = user;
    return data;
    // return baseData('error', '登录超时', 3);
  },
  logout: () => 'success',
};
