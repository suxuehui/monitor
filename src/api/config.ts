import request from '@/utils/request';

// 共享配置
// 配置详情
export async function configInfo(params: any) {
  return request({
    url: '/vehicle/config/info',
    method: 'post',
    data: params,
  });
}

// 新增配置
export async function configAdd(params: any) {
  return request({
    url: '/vehicle/config/add',
    method: 'post',
    data: params,
  });
}

// 修改配置
export async function configUpdate(params: any) {
  return request({
    url: '/vehicle/config/update',
    method: 'post',
    data: params,
  });
}

// 删除配置
export async function configDelete(params: any) {
  return request({
    url: '/vehicle/config/delete',
    method: 'post',
    data: params,
  });
}

// 网加配置
// 根据车型id查询网加配置
export async function attachcfgQuery(params: any) {
  return request({
    url: '/attachcfg/query',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 新增
export async function attachcfgInsert(params: any) {
  return request({
    url: '/attachcfg/insert',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 编辑
export async function attachcfgEdit(params: any) {
  return request({
    url: '/attachcfg/edit',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 启用
export async function attachcfgEnable(params: any) {
  return request({
    url: `/attachcfg/enable/${params}`,
    method: 'get',
  });
}

// 禁用
export async function attachcfgDisable(params: any) {
  return request({
    url: `/attachcfg/disable/${params}`,
    method: 'get',
  });
}

// 根据配置id查询配置修改历史记录
export async function attachcfgQuerylog(params: any) {
  return request({
    url: '/attachcfg/querylog',
    method: 'post',
    data: params,
  });
}
