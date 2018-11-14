import axios from 'axios';
import request from '@/utils/request';
import qs from 'qs';

// 商户树状数据
export async function orgTree(params: any) {
  return request({
    url: '/customer/org/queryAllOrgOfFormat',
    method: 'post',
    data: params,
  });
}

export async function login(params: any, token: string) {
  return request({
    url: '/sys/login',
    method: 'post',
    data: params,
    headers: {
      token,
    },
  });
}

export async function getAuthCodeToken(params: any) {
  return request({
    url: '/guest-acl',
    method: 'post',
    data: params,
  });
}

export async function getAuthCode(params: any, token?: string) {
  const data = qs.stringify(params);
  return axios({
    url: `${process.env.NODE_ENV === 'production' ? '/api' : '/rootApi'}/zuul/verify/send/image`,
    method: 'post',
    data,
    headers: {
      token,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}
// 所有商户名称--来自4S门户
export async function getAllShopName(params: any, token?: string) {
  return axios({
    url: `${process.env.NODE_ENV === 'production' ? '/api' : '/rootApi'}/old/department/selectOptionsAll`,
    method: 'post',
    data: params,
    headers: {
      token,
      'Content-Type': 'application/json',
    },
  });
}

export async function getAllShopNameMoni(params: any) {
  return request({
    url: '/customer/org/create/selectOptions',
    method: 'post',
    data: params,
  });
}

export async function getCodeImg(params: any) {
  return request({
    url: `/sys/user/getImg?r=${Math.random()}`,
    method: 'get',
    data: params,
  });
}

export async function getUserInfo(params: any) {
  return request({
    url: '/sys/user/info',
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

// 字典表
export async function getDict(params: any) {
  return request({
    url: '/dict/list',
    method: 'get',
    data: params,
  });
}

// 设备表中的数据字典
export async function terminalDict(params: any) {
  return request({
    url: '/dict/terminalDict',
    method: 'post',
    data: params,
  });
}

export async function uploadFile(params: any) {
  return axios({
    url: '/verify/file/upload',
    method: 'post',
    data: params,
    headers: {
      token: window.localStorage.getItem('token'),
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryf2YougAqFTPuaO2k',
    },
  });
}

export async function gpsToAddress(params: {
lat: number,
lng: number,
coordinateSystem?: string
}) {
  if (params.coordinateSystem === 'GCJ02') {
    params.coordinateSystem = 'gcj02ll';
  }
  return request({
    url: `https://api.map.baidu.com/geocoder/v2/?callback=renderReverse&coordtype=${params.coordinateSystem}&location=${params.lat},${params.lng}&output=json&pois=1&ak=K52pNzWT61z1EHvdZptaSmlPRc7mKbjC`,
    method: 'get',
    fetchType: 'JSONP',
  });
}

export async function queryAddress(params: string) {
  return request({
    url: `https://api.map.baidu.com/place/v2/suggestion?query=${params}&region=全国&city_limit=false&output=json&ak=K52pNzWT61z1EHvdZptaSmlPRc7mKbjC`,
    method: 'get',
    fetchType: 'JSONP',
  });
}

export async function addressToGps(params: string) {
  return request({
    url: `https://api.map.baidu.com/geocoder/v2/?address=${params}&output=json&ak=K52pNzWT61z1EHvdZptaSmlPRc7mKbjC&callback=showLocation`,
    method: 'get',
    fetchType: 'JSONP',
  });
}
