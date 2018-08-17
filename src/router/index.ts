import Vue from 'vue';
import Router, { RouterOptions } from 'vue-router';
import { routerItem } from '@/interface';

const getComponent = require(`./import_${process.env.NODE_ENV}`);

export const constantRouterMap: routerItem[] & RouterOptions['routes'] = [
  {
    path: '/', redirect: '/dashboard',
  },
  {
    path: '/login', name: '登录', component: getComponent('login/index.vue'),
  },
  {
    path: '/modiflyPwd', name: '修改密码', component: getComponent('updatePwd/index.vue'),
  },
  {
    path: '/updateSelf', name: '个人中心', component: getComponent('updateSelf/index.vue'),
  },
  {
    path: '*', name: '404', component: getComponent('error/404.vue'),
  },
  {
    path: '/401', name: '401', component: getComponent('error/401.vue'),
  },
  {
    path: '/dashboard',
    name: '系统主页',
    component: getComponent('dashboard/index'),
    meta: { key: 'Dashboard' },
  },
];

export const asyncRouterMap: routerItem[] = [
  {
    path: '/dashboard',
    icon: 'dashboard',
    name: '系统主页',
    component: getComponent('dashboard/index'),
    permission: true,
    meta: { key: 'Dashboard' },
  },
  {
    path: '/car',
    name: '车辆管理',
    component: getComponent('car/index.tsx'),
    icon: 'car',
    permission: [
      '/device/vehicle/list',
      '/car/model/list',
      '/car/eleFence/list',
      '/device/trip/list',
    ],
    children: [
      {
        path: 'monitor',
        name: '车辆监控',
        component: getComponent('car/monitor/index'),
        permission: '/device/vehicle/list',
        meta: { key: 'Monitor' },
      },
      {
        path: 'trajectory/:id',
        name: '车辆轨迹',
        component: getComponent('car/trajectory/index'),
        permission: '/device/trip/list',
        meta: { key: 'Trajectory' },
        hidden: true,
      },
      {
        path: 'model',
        name: '车型配置',
        component: getComponent('car/model/index'),
        permission: '/car/model/list',
        meta: { key: 'Model' },
      },
      {
        path: 'detail',
        name: '详情配置',
        component: getComponent('car/detail/index'),
        permission: '/car/model/list',
        meta: { key: 'ModelDetail' },
        hidden: true,
      },
      {
        path: 'eleFence',
        name: '电子围栏',
        component: getComponent('car/eleFence/index'),
        permission: '/car/eleFence/list',
        meta: { key: 'EleFence' },
      },
      {
        path: 'fenceDetail/:eleFenceId',
        name: '围栏详情',
        component: getComponent('car/fenceDetail/index'),
        permission: '/car/eleFence/list',
        meta: { key: 'FenceDetail' },
        hidden: true,
      },
      {
        path: 'track/:id',
        name: '车辆追踪',
        component: getComponent('car/track/index'),
        permission: '/device/vehicle/list',
        meta: { key: 'Track' },
        hidden: true,
      },
    ],
  },
  {
    path: '/equipment',
    icon: 'server',
    name: '设备管理',
    component: getComponent('equipment/index'),
    permission: '/equipment/list',
    children: [
      {
        path: 'device',
        name: '设备列表',
        component: getComponent('equipment/device/index'),
        permission: '/equipment/device/list',
        meta: { key: 'Device' },
      },
      {
        path: 'deviceLog',
        name: '安绑记录',
        component: getComponent('equipment/bindLog/index'),
        permission: '/equipment/device/list',
        meta: { key: 'BindLog' },
        hidden: true,
      },
    ],
  },
  {
    path: '/customer',
    name: '客户管理',
    icon: 'team',
    component: getComponent('customer/index'),
    permission: [
      '/customer/merchants/list',
    ],
    children: [
      {
        path: 'merchants',
        name: '商户管理',
        component: getComponent('customer/merchants/index'),
        permission: '/customer/merchants/list',
        meta: { key: 'Merchants' },
      },
    ],
  },
  {
    path: '/message',
    name: '消息管理',
    component: getComponent('message/index'),
    icon: 'message',
    permission: [
      '/message/notice/list',
      '/message/alarm/list',
    ],
    children: [
      {
        path: 'notice',
        name: '通知公告',
        component: getComponent('message/notice/index'),
        permission: '/message/notice/list',
        meta: { key: 'Notice' },
      },
      {
        path: 'alarm',
        name: '告警消息',
        component: getComponent('message/alarm/index'),
        permission: '/message/alarm/list',
        meta: { key: 'Alarm' },
      },
      {
        path: 'alarmMap',
        name: '告警地点',
        component: getComponent('message/alarmMap/index'),
        permission: '/message/alarm/list',
        meta: { key: 'AlarmMap' },
        hidden: true,
      },
    ],
  },
  {
    path: '/data',
    name: '数据统计',
    component: getComponent('data/index'),
    icon: 'chart',
    permission: [
      '/data/driving/list',
    ],
    children: [
      {
        path: 'driving',
        name: '行驶统计',
        component: getComponent('data/driving/index'),
        permission: '/data/driving/list',
        meta: { key: 'Driving' },
      },
    ],
  },
  {
    path: '/permission',
    name: '权限管理',
    component: getComponent('permission/index'),
    icon: 'lock',
    permission: [
      '/permission/members/list',
      '/permission/role/list',
    ],
    children: [
      {
        path: 'members',
        name: '成员管理',
        component: getComponent('permission/members/index'),
        permission: '/permission/members/list',
        meta: { key: 'Members' },
      },
      {
        path: 'role',
        name: '角色管理',
        component: getComponent('permission/role/index'),
        permission: '/permission/role/list',
        meta: { key: 'Role' },
      },
    ],
  },
  {
    path: '/system',
    name: '系统设置',
    component: getComponent('system/index'),
    icon: 'setting',
    permission: [
      '/system/setting/list',
    ],
    children: [
      {
        path: 'setting',
        name: '系统配置',
        component: getComponent('system/setting/index'),
        permission: '/system/setting/list',
        meta: { key: 'Setting' },
      },
    ],
  },
];

Vue.use(Router);

export default new Router({
  routes: constantRouterMap,
});
