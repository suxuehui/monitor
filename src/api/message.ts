import request from '@/utils/request';

// 告警消息
// 处理告警
export async function handleAlarm(params: any) {
  return request({
    url: '/message/alarm/handle',
    method: 'post',
    data: params,
  });
}
// 告警详情
export async function getSolution(params: any) {
  return request({
    url: '/message/alarm/getSolution',
    method: 'get',
    data: params,
  });
}
// 未阅读告警
export async function getNotHandled(params: any) {
  return request({
    url: '/message/alarm/notHandled',
    method: 'post',
    data: params,
  });
}

// 通知公告
// 新增
export async function noticeAdd(params: any) {
  return request({
    url: '/message/notice/publish',
    method: 'post',
    data: params,
    fetchType: 'JSON',
  });
}
// 删除
export async function noticeDelete(params: any) {
  return request({
    url: '/message/notice/delete',
    method: 'post',
    data: params,
  });
}

// 未阅读通知公告
export async function noticeNotHandled(params: any) {
  return request({
    url: '/message/notice/notHandled',
    method: 'post',
    data: params,
  });
}

// 查看消息
export async function noticeView(params: any) {
  return request({
    url: '/message/notice/view',
    method: 'post',
    data: params,
  });
}
