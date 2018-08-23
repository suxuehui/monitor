import request from '@/utils/request';

// 商户新增
export async function customerAdd(params: any) {
  return request({
    url: '/monitor/sys/org/save',
    method: 'post',
    data: params,
  });
}
// 商户修改
export async function customerUpdate(params: any) {
  return request({
    url: '/monitor/sys/org/update',
    method: 'post',
    data: params,
  });
}
// 商户冻结
export async function customerLock(params: any) {
  return request({
    url: `/monitor/sys/org/lock/${params}`,
    method: 'post',
  });
}
// 商户解冻
export async function customerUnlock(params: any) {
  return request({
    url: `/monitor/sys/org/unlock/${params}`,
    method: 'post',
  });
}
// 检查商户
export async function checkOrgName(params: any) {
  return request({
    url: `/monitor/sys/org/unlock/${params}`,
    method: 'post',
  });
}
// 所有商户列表
export async function getCustomerList(params: any) {
  return request({
    url: '/monitor/sys/org/list',
    method: 'post',
  });
}
