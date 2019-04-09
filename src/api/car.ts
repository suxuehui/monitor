import request from '@/utils/request';

// 车型配置
// 配置启用
export async function vehicleModelEnable(params: any) {
  return request({
    url: '/vehicle/model/enable',
    method: 'get',
    data: params,
  });
}

// 新增配置
export async function vehicleModelAdd(params: any) {
  return request({
    url: '/vehicle/model/add',
    method: 'post',
    data: params,
  });
}

// 新增配置
export async function vehicleModelUpdate(params: any) {
  return request({
    url: '/vehicle/model/update',
    method: 'post',
    data: params,
  });
}

// 按照id查询配置详情
export async function vehicleModelInfo(params: any) {
  return request({
    url: '/vehicle/model/info',
    method: 'get',
    data: params,
  });
}

// 获得围栏监控车辆
export async function getFenceCars(params: any) {
  return request({
    url: '/vehicle/fence/vehicleList',
    method: 'post',
    data: params,
  });
}

// 车辆来源
export async function carSource(params: any) {
  return request({
    url: '/vehicle/srcQueryOptions',
    method: 'post',
  });
}

// 车辆绑定状态
export async function carBindStatus(params: any) {
  return request({
    url: '/vehicle/bindStatuslist',
    method: 'post',
  });
}

// 查询绑定状态列表
export async function getBindStatusOptions(params: any) {
  return request({
    url: '/vehicle/bindStatusOptions',
    method: 'get',
  });
}

// 围栏内外筛选条件
export async function getFioQueryOptions(params: any) {
  return request({
    url: '/vehicle/fioQueryOptions',
    method: 'get',
  });
}


// 车辆来源筛选条件
export async function getSrcQueryOptions(params: any) {
  return request({
    url: '/vehicle/srcQueryOptions',
    method: 'get',
  });
}

// 车辆绑定设备
export async function bindTerminal(params: any) {
  return request({
    url: '/vehicle/monitor/bindTerminal',
    data: params,
    method: 'post',
    fetchType: 'JSON',
  });
}

// 车辆解绑设备
export async function unbindTerminal(params: any) {
  return request({
    url: '/vehicle/monitor/unbindTerminal',
    data: params,
    method: 'post',
    fetchType: 'JSON',
  });
}

// 查询车辆驾驶行为
export async function driveBehavior(params: any) {
  return request({
    url: '/vehicle/monitor/driveBehavior',
    data: params,
    method: 'post',
  });
}

// 查询车辆绑定设备
export async function findBindTerminalList(params: any) {
  return request({
    url: `/vehicle/monitor/findBindTerminalList/${params}`,
    method: 'get',
  });
}
