import request from '@/utils/request';

// 品牌管理
// 列表
export async function brandList(params: any) {
  return request({
    url: '/vehicle/brand/list',
    method: 'post',
    data: params,
  });
}
// 全部
export async function brandAll(params: any) {
  return request({
    url: '/vehicle/brand/all',
    method: 'post',
    data: params,
  });
}
// 新增
export async function brandAdd(params: any) {
  return request({
    url: '/vehicle/brand/add',
    method: 'post',
    data: params,
  });
}
// 详情
export async function brandInfo(params: any) {
  return request({
    url: '/vehicle/brand/info',
    method: 'post',
    data: params,
  });
}
// 编辑
export async function brandEdit(params: any) {
  return request({
    url: '/vehicle/brand/edit',
    method: 'post',
    data: params,
  });
}
// 删除
export async function brandDelete(params: any) {
  return request({
    url: '/vehicle/brand/delete',
    method: 'post',
    data: params,
  });
}

// 车系管理
// 列表
export async function seriesList(params: any) {
  return request({
    url: '/vehicle/series/list',
    method: 'post',
    data: params,
  });
}
// 新增
export async function seriesAdd(params: any) {
  return request({
    url: '/vehicle/series/add',
    method: 'post',
    data: params,
  });
}
// 详情
export async function seriesInfo(params: any) {
  return request({
    url: '/vehicle/series/detail',
    method: 'post',
    data: params,
  });
}
// 编辑
export async function seriesEdit(params: any) {
  return request({
    url: '/vehicle/series/edit',
    method: 'post',
    data: params,
  });
}
// 删除
export async function seriesDelete(params: any) {
  return request({
    url: '/vehicle/series/delete',
    method: 'post',
    data: params,
  });
}

// 车型管理
// 新增
export async function modelAdd(params: any) {
  return request({
    url: '/vehicle/model/add',
    method: 'post',
    data: params,
  });
}
// 详情
export async function modelInfo(params: any) {
  return request({
    url: '/vehicle/model/info',
    method: 'post',
    data: params,
  });
}
// 编辑
export async function modelEdit(params: any) {
  return request({
    url: '/vehicle/model/edit',
    method: 'post',
    data: params,
  });
}
// 删除
export async function modelDelete(params: any) {
  return request({
    url: '/vehicle/model/delete',
    method: 'post',
    data: params,
  });
}
