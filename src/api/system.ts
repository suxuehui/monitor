import request from '@/utils/request';

// 告警配置
export async function getAlarmSetting(params: any) {
  return request({
    url: '/system/cfg/list',
    method: 'get',
    data: params,
  });
}

// 告警模板
export async function getAlarmModelList(params: any) {
  return request({
    url: '/system/cfg/model',
    method: 'get',
    data: params,
  });
}

// 保存
export async function saveAlarmModelList(params: any) {
  return request({
    url: '/system/cfg/save',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}
