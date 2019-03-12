import request from '@/utils/request';

// 导出
export default async function exportExcel(params: any, fileName:string, url:string) {
  return request({
    url: `${url}?${params}`,
    method: 'get',
    fetchType: 'JSON',
    responseType: 'blob',
    fileName: `${fileName}`,
  });
}
