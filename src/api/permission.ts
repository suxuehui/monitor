import request from '@/utils/request';

// 角色管理
// 角色新增
export async function roleAdd(params: any) {
  return request({
    url: '/sys/role/save',
    method: 'post',
    data: params,
  });
}

// 角色修改
export async function roleUpdate(params: any) {
  return request({
    url: '/sys/role/edit',
    method: 'post',
    data: params,
  });
}

// 角色信息
export async function roleInfo(params: any) {
  return request({
    url: '/sys/role/info',
    method: 'post',
    data: params,
  });
}

// 角色启用\禁用
export async function roleUpdateStatus(params: any) {
  return request({
    url: '/sys/role/updateStatus',
    method: 'post',
    data: params,
  });
}

// 角色分配权限
export async function roleSaveRoleMenu(params: any) {
  return request({
    url: '/sys/role/saveRoleMenu',
    method: 'post',
    fetchType: 'JSON',
    data: params,
  });
}

// 角色列表
export async function roleSelect(params: any) {
  return request({
    url: '/sys/role/select',
    method: 'post',
    data: params,
  });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 成员管理
// 成员新增
export async function userAdd(params: any) {
  return request({
    url: '/sys/user/save',
    method: 'post',
    data: params,
  });
}

// 成员修改
export async function userUpdate(params: any) {
  return request({
    url: '/sys/user/update',
    method: 'post',
    data: params,
  });
}

// 成员解冻
export async function userUnlock(params: any) {
  return request({
    url: '/sys/user/unlock',
    method: 'post',
    fetchType: 'JSON',
    data: params,
  });
}

// 成员冻结
export async function userLock(params: any) {
  return request({
    url: '/sys/user/lock',
    method: 'post',
    fetchType: 'JSON',
    data: params,
  });
}

// 修改密码
export async function resetPW(params: any) {
  return request({
    url: '/sys/user/password',
    method: 'post',
    fetchType: 'JSON',
    data: params,
  });
}

// 检测成员是否存在
export async function userCheck(params: any) {
  return request({
    url: '/sys/user/exist',
    method: 'post',
    data: params,
  });
}

// 获取登录的用户信息
export async function getUserInfo(params: any) {
  return request({
    url: '/sys/user/info',
    method: 'post',
    data: params,
  });
}

// 查看用户信息
export async function userInfo(params: any) {
  return request({
    url: `/sys/user/info/${params}`,
    method: 'get',
  });
}

// 查看用户信息
export async function changePsw(params: any) {
  return request({
    url: '/sys/user/password',
    method: 'post',
    data: params,
  });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 安装专员
// 详情
export async function workerDetail(params: any) {
  return request({
    url: '/worker/detail',
    method: 'post',
    data: params,
  });
}

// 添加
export async function workerAdd(params: any) {
  return request({
    url: '/worker/add',
    method: 'post',
    data: params,
  });
}

// 编辑
export async function workerEdit(params: any) {
  return request({
    url: '/worker/edit',
    method: 'post',
    data: params,
  });
}

// 检测安装工登录名是否存在
export async function workerExist(params: any) {
  return request({
    url: '/worker/exist',
    method: 'post',
    data: params,
  });
}

// 冻结
export async function workerLock(params: any) {
  return request({
    url: '/worker/lock',
    method: 'post',
    data: params,
  });
}

// 解冻
export async function workerUnlock(params: any) {
  return request({
    url: '/worker/unlock',
    method: 'post',
    data: params,
  });
}
