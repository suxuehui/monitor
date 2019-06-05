/* global window */
import axios from 'axios';
import qs from 'qs';
import jsonp from 'jsonp';
import lodash from 'lodash';
import pathToRegexp from 'path-to-regexp';
import { Message } from 'element-ui';
import config from '@/utils/config';
import router from '@/router';
import Raven from 'raven-js';

axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';

const service = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api/monitor' : '/api', // api的base_url
  timeout: 50000, // 请求超时时间
});

/**
 * @method 封装axios组件
 * @param {object} options
 */
const fetch = (options: Option) => {
  const { data } = options;
  let { url } = options;
  const { method = 'get', fetchType } = options;
  // 合并请求头，每次都带上token值
  options.headers = {
    token: window.localStorage.getItem('token'),
    ...options.headers,
  };
  // 对数据进行处理
  let cloneData: any = lodash.cloneDeep(data);
  cloneData = qs.stringify(cloneData);

  try {
    const domins = url.match(/[a-zA-z]+:\/\/[^/]*/);
    if (domins) {
      url = url.slice(domins[0].length);
    }
    const match = pathToRegexp.parse(url);
    url = pathToRegexp.compile(url)(data);
    match.map((item: any) => {
      if (typeof item === 'object') {
        if (item instanceof Object && item.name in cloneData) {
          delete cloneData[item.name];
        }
      }
      return true;
    });
    url = domins ? domins[0] + url : url;
  } catch (e) {
    Message.error(e.message);
  }
  // jsonp 请求
  if (fetchType === 'JSONP') {
    return new Promise((resolve, reject) => {
      jsonp(url, {
        param: `${qs.stringify(data)}&callback`,
        name: `jsonp_${new Date().getTime()}`,
        timeout: 4000,
      }, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve({ statusText: 'OK', status: 200, data: result });
      });
    });
  } if (fetchType === 'YQL') {
    // 天气查询
    url = `http://query.yahooapis.com/v1/public/yql?q=select * from json where url='${options.url}?${encodeURIComponent(qs.stringify(options.data))}'&format=json`;
  } else if (fetchType === 'JSON') {
    // 请求数据为json格式的请求
    return service({
      url,
      method: method.toLowerCase(),
      responseType: options.responseType,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      data,
    });
  }
  // 默认的formData请求方式
  switch (method.toLowerCase()) {
    case 'post':
      return service.post(url, cloneData, { headers: options.headers });
    case 'put':
      return service.put(url, cloneData, { headers: options.headers });
    case 'get':
      return service.get(`${url}?${cloneData}`, { headers: options.headers });
    default:
      return service.get(`${url}?${cloneData}`, { headers: options.headers });
  }
};

/**
 * @todo ajax请求函数的参数声明
 */
interface Option {
  url: string, // 请求地址
  method: string, // 请求方法
  data?: object, // 请求数据
  fetchType?: string, // 请求类型，JSONP, YQL, JSON
  headers?: any, // 请求头部
  responseType?: 'blob' | 'json', // 返回数据类型
  fileName?: string, // 如果是下载文件，下载的文件名称
}

export default function request(options: Option): Promise<any> {
  return fetch(options).then((response: any) => {
    const { statusText, status } = response;
    let { data } = response;
    // 判断返回是否为文件
    if (options.responseType === 'blob') {
      const reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onload = (e: any) => {
        const a = document.createElement('a');
        a.download = `${options.fileName}.xlsx`;
        a.href = e.target.result;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      return false;
    }
    // 首页模拟数据的特殊处理
    if (data instanceof Array) {
      data = {
        list: data,
      };
    }
    // 判断返回数据是否报错，方便搜集错误日志
    if (response.data.result.resultCode !== '0') {
      const responseData = {
        url: options.url,
        data: options.data,
        result: response.data.result,
      };
      if (process.env.NODE_ENV === 'production') {
        // Raven.captureException(JSON.stringify(responseData));
      }
    }
    // 返回数据
    return Promise.resolve({
      success: true,
      message: response.data.result
        ? response.data.result.resultMessage : null || statusText || null,
      statusCode: status,
      ...data,
    });
  }).catch((error) => {
    const { response } = error;
    // if (process.env.NODE_ENV === 'production') {
    //   Raven.captureException(JSON.stringify(error));
    // }
    /**
     *  无权限时，先提示，在刷新
     * */
    let msg;
    let statusCode;
    if (response.data.result) {
      const { data, statusText } = response;
      const { result: { resultCode, resultMessage } } = data;
      if (response && response instanceof Object) {
        statusCode = response.status;
        msg = data.result.resultMessage || statusText;
      } else {
        statusCode = 600;
        msg = error.message || 'Network Error';
      }
      // 存在token
      if (window.localStorage.getItem('token')) {
        if (statusCode === 401) {
          Message.error('无权限操作，请联系管理员');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else if (resultCode === 4) {
          Message.error(resultMessage);
          router.replace('/login');
        } else if (resultCode === 401) {
          Message.error('无权限操作，请联系管理员');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        // 首次登录时不存在token
        router.replace('/login');
      }
    } else {
      if (window.localStorage.getItem('token')) {
        if (response.status === 401) {
          Message.error('无权限操作，请联系管理员');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    }
    // // 判断错误码是否为4，4为登录超时，跳转到登录页，或者是http的状态码为401也代表会话失效
    // if (response.data.result.resultCode === 4) {
    //   Message.error(response.data.result.resultMessage);
    //   router.replace('/login');
    // } else if (statusCode === 401) {
    //   // if (config.noLoginList.indexOf(window.location.hash) < 0) {
    //   //   router.replace('/login');
    //   // }
    //   Message.error('无权限操作，请联系管理员');
    // }
    return Promise.reject(new Error(msg));
  });
}
