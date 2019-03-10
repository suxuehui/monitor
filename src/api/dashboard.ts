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
export async function getVehicleData(params: any) {
  return request({
    url: '/home/report/vehicleData',
    method: 'get',
  });
}
