import axios from 'axios';
import request from '@/utils/request';

export async function vehicleInfo(params: any) {
  return request({
    url: '/monitor/vehicle/monitor/info',
    method: 'get',
    data: params,
  });
}

export async function vehicleUpdate(params: any) {
  return request({
    url: '/monitor/vehicle/monitor/edit',
    method: 'get',
    data: params,
  });
}

export async function vehicleDelete(params: any) {
  return request({
    url: '/monitor/vehicle/monitor/delete',
    method: 'get',
    data: params,
  });
}

export async function vehicleRadiusQuery(params: any) {
  return request({
    url: '/monitor/vehicle/monitor/radiusQuery',
    method: 'get',
    data: params,
  });
}
