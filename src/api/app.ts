import axios from 'axios';
import request from '@/utils/request';

export async function login(params: any) {
  return request({
    url: '/sys/user/login',
    method: 'post',
    data: params,
  });
}

export async function userInfo(params: any) {
  return request({
    url: '/sys/user/getUserInfo',
    method: 'post',
    data: params,
  });
}

export async function getMenu(params: any) {
  return request({
    url: '/sys/user/getMenu',
    method: 'get',
    data: params,
  });
}

export async function uploadFile(params: any) {
  return axios({
    url: '/sys/file/uploadFile',
    method: 'post',
    data: params,
    headers: {
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryf2YougAqFTPuaO2k',
    },
  });
}

export async function gpsToAddress(params: {
lat: number,
lng: number,
coordinateSystem?: string
}) {
  return request({
    url: `http://api.map.baidu.com/geocoder/v2/?callback=renderReverse&coordtype=${params.coordinateSystem}&location=${params.lat},${params.lng}&output=json&pois=1&ak=K52pNzWT61z1EHvdZptaSmlPRc7mKbjC`,
    method: 'get',
    fetchType: 'JSONP',
  });
}

export async function queryAddress(params: string) {
  return request({
    url: `http://api.map.baidu.com/place/v2/suggestion?query=${params}&region=全国&city_limit=false&output=json&ak=K52pNzWT61z1EHvdZptaSmlPRc7mKbjC`,
    method: 'get',
    fetchType: 'JSONP',
  });
}

export async function addressToGps(params: string) {
  return request({
    url: `http://api.map.baidu.com/geocoder/v2/?address=${params}&output=json&ak=K52pNzWT61z1EHvdZptaSmlPRc7mKbjC&callback=showLocation`,
    method: 'get',
    fetchType: 'JSONP',
  });
}
