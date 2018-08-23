import axios from 'axios';
import request from '@/utils/request';

export async function tripGPS(params: any) {
  return request({
    url: `/monitor/device/trip/gps/${params.id}`,
    method: 'get',
  });
}

export async function tripAlarm(params: any) {
  return request({
    url: '/monitor/device/trip/alarmlist',
    method: 'post',
    data: params,
  });
}
