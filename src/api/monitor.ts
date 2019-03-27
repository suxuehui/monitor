import request from '@/utils/request';

// 车辆详情
export async function vehicleInfo(params: any) {
  return request({
    url: '/vehicle/monitor/info',
    method: 'get',
    data: params,
  });
}

// 车辆编辑
export async function vehicleUpdate(params: any) {
  return request({
    url: '/vehicle/monitor/edit',
    method: 'post',
    fetchType: 'JSON',
    data: params,
  });
}

// 删除
export async function vehicleDelete(params: any) {
  return request({
    url: '/vehicle/monitor/delete',
    method: 'post',
    data: params,
  });
}

// 按范围查车辆
export async function vehicleRadiusQuery(params: any) {
  return request({
    url: '/vehicle/monitor/radiusQuery',
    method: 'get',
    data: params,
  });
}

// 控车
export async function controlCar(params: any) {
  return request({
    url: '/vehicle/monitor/control',
    method: 'get',
    data: params,
  });
}

// 追踪
// 设备配置
export async function vehicleDeviceSet(params: any) {
  return request({
    url: '/vehicle/tracke/saveConfig',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 设备预约
export async function vehicleDeviceRev(params: any) {
  return request({
    url: '/vehicle/tracke/reserveConfig',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 计算生效时间
export async function vehicleCalvalid(params: any) {
  return request({
    url: '/vehicle/tracke/calvalid',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 获取命令清单
export async function cmdList(params: any) {
  return request({
    url: '/cmd/list',
    method: 'post',
  });
}

// 车辆控制
export async function cmdControl(params: any) {
  return request({
    url: '/cmd/control',
    method: 'post',
  });
}
