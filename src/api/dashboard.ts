import request from '@/utils/request';

// 告警数据统计
export async function getAlarmData(params: any) {
  return request({
    url: '/home/report/alarmData',
    method: 'get',
  });
}

// 行驶数据统计
export async function getDrivingData(params: any) {
  return request({
    url: '/home/report/drivingData',
    method: 'post',
    fetchType: 'JSON',
    data: params,
  });
}

// 监控统计
export async function getOnlineData(params: any) {
  return request({
    url: '/home/report/onlineData',
    method: 'get',
  });
}

// 围栏内外
export async function getFenceData(params: any) {
  return request({
    url: '/home/report/fenceData',
    method: 'get',
  });
}
