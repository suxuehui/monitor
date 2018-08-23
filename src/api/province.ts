import request from '@/utils/request';

// 获取省
export async function getProvince(params: any) {
  return request({
    url: '/monitor/area/province',
    method: 'get',
    data: params,
  });
}

// 获取市
export async function getCity(params: any) {
  return request({
    url: '/monitor/area/city',
    method: 'get',
    data: params,
  });
}

// 获取区县
export async function getDistrict(params: any) {
  return request({
    url: '/monitor/area/district',
    method: 'get',
    data: params,
  });
}

