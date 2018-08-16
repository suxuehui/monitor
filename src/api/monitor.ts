import axios from 'axios';
import request from '@/utils/request';

export async function vehicleInfo(params: any) {
  return request({
    url: '/device/vehicle/info',
    method: 'get',
    data: params,
  });
}

export async function vehicleUpdate(params: any) {
  return request({
    url: '/device/vehicle/edit',
    method: 'get',
    data: params,
  });
}

export async function vehicleDelete(params: any) {
  return request({
    url: '/device/vehicle/delete',
    method: 'get',
    data: params,
  });
}

export async function vehicleRadiusQuery(params: any) {
  return request({
    url: '/device/vehicle/radiusQuery',
    method: 'get',
    data: params,
  });
}
