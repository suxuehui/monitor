import request from '@/utils/request';

// 商户新增
export async function customerAdd(params: any) {
  return request({
    url: '/customer/org/save',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 商户修改
export async function customerUpdate(params: any) {
  return request({
    url: '/customer/org/update',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 商户冻结
export async function customerLock(params: any) {
  return request({
    url: `/customer/org/lock/${params}`,
    method: 'get',
  });
}

// 商户解冻
export async function customerUnlock(params: any) {
  return request({
    url: `/customer/org/unlock/${params}`,
    method: 'get',
  });
}

// 检查商户名是否存在
export async function checkOrgName(params: any) {
  return request({
    url: '/customer/org/check',
    data: params,
    method: 'post',
  });
}

// 所有商户列表 未使用
export async function getCustomerList(params: any) {
  return request({
    url: '/customer/org/list',
    method: 'get',
    fetchType: 'JSON',
  });
}

// 商户详情
export async function customerInfo(params: any) {
  return request({
    url: `/customer/org/detail/${params}`,
    method: 'get',
  });
}

// 商户门店下拉框列表
export async function getInfoByLevelCode(params: any) {
  return request({
    url: '/customer/org/getInfoByLevelCode',
    method: 'get',
  });
}

// 新增部门
export async function customerSaveSub(params: any) {
  return request({
    url: '/customer/org/saveSub',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}
