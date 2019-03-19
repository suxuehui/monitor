import request from '@/utils/request';

// 当前登录用户的菜单权限(仅包含按钮级别)
export async function getListByUser(params: any) {
  return request({
    url: '/sys/menu/listByUser',
    method: 'post',
    fetchType: 'JSON',
    data: params,
  });
}

// 添加修改时的下拉菜单下拉选项
export async function menuSelect(params: any) {
  return request({
    url: '/sys/menu/select',
    method: 'post',
    data: params,
  });
}
