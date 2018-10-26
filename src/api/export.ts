import request from '@/utils/request';

// 围栏详情
export async function getFenceDetail(params: any) {
  return request({
    url: '/fence/detail',
    method: 'post',
    data: params,
  });
}

// 导出
export async function exportExcel(params: any, fileName:string, url:string) {
  return request({
    url: `${url}?${params}`,
    method: 'get',
    fetchType: 'JSON',
    responseType: 'blob',
    fileName: `${fileName}`,
  });
}
