import request from '@/utils/request';
import axios from 'axios';
import qs from 'qs';
// 设备绑定
export async function terminalBind(params: any) {
  return request({
    url: '/device/terminal/bind',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 设备解绑
export async function terminalUnbind(params: any) {
  return request({
    url: '/device/terminal/unbind',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 设备添加
export async function terminalAdd(params: any) {
  return request({
    url: '/device/terminal/save',
    fetchType: 'JSON',
    method: 'post',
    data: params,
  });
}

// 设备验收
export async function terminalCheck(params: any) {
  return request({
    url: '/device/terminal/confirm',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 获取设备类型
export async function terminalType(params: any) {
  return request({
    url: '/device/terminal/clienttypes',
    method: 'post',
    data: params,
  });
}

// 设备配置更新
export async function terminalCfg(params: any) {
  return request({
    url: `/device/terminal/cfg/${params}`,
    method: 'get',
  });
}

// 查询车辆列表
export async function getCarList(params: any) {
  return request({
    url: '/device/vehicle/list',
    method: 'post',
    data: params,
  });
}

// 查询车辆列表
export async function findCar(params: any) {
  return request({
    url: '/device/vehicle/platenum',
    method: 'get',
    data: params,
  });
}

// 下发配置
export async function deliveryCfg(params: any) {
  return request({
    url: '/device/terminal/deliveryCfg',
    method: 'post',
    data: params,
  });
}

// 清除配置
export async function clearCfg(params: any) {
  return request({
    url: '/device/terminal/clearCfg',
    method: 'post',
    data: params,
  });
}

// 设备安绑记录
export async function getOpsList(params: any) {
  return request({
    url: '/terminal/ops/list',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 查询蓝牙鉴权码
export async function getBluetooth(params: any) {
  return request({
    url: '/device/terminal/getBluetoothAuthCode',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}
// 生成蓝牙鉴权码
export async function createBluetooth(params: any) {
  return request({
    url: '/device/terminal/createBluetoothAuthCode',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}

// 重置
export async function resetTime(params: any) {
  return request({
    url: `/device/terminal/reset/${params}`,
    method: 'get',
    data: params,
  });
}

// 查询车辆详情
export async function terminalInfo(params: any) {
  return request({
    url: `/device/terminal/info/${params}`,
    method: 'get',
    data: params,
  });
}

// 导出
export async function terminalExport(params: any, fileName:string) {
  return request({
    url: `/device/terminal/exportExcel?${params}`,
    method: 'get',
    fetchType: 'JSON',
    responseType: 'blob',
    fileName: `${fileName}`,
  });
}
