import axios from 'axios';
import request from '@/utils/request';

export async function tripGPS(params: any) {
  return request({
    url: '/device/trip/gps',
    method: 'get',
    data: params,
  });
}

export async function tripAlarm(params: any) {
  return request({
    url: '/device/trip/alarmlist',
    method: 'post',
    data: params,
  });
}
