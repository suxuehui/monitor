/**
 * @method 获取路由参数
 * @param {string} url 路由字符串（包含参数）
 */
function param2Obj(url: string): { token?: string } {
  const search = url.split('?')[1];
  if (!search) {
    return {};
  }
  return JSON.parse(`{"${decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`);
}
/**
 * @method 路由地址转换为/router/index.ts 里面的格式，已方便匹配
 * @return 返回一级路由带有‘/’，二级及后面的路由没带‘/’，并且带上路由参数字符串
 * @param {string} route 路由地址
 */
function routeToArray(route: string): { routeArr: string[], params: string } {
  if (!route) {
    return {
      routeArr: [],
      params: '',
    };
  }
  const arr: string[] = route.split('/');
  const ret: string[] = [];
  let params = '';
  // 去掉#号
  arr.shift();
  // 循环拆分路由
  arr.forEach((item, index) => {
    // 判断是否为路由参数 :id这种
    if (parseInt(item, 10)) {
      params = item;
      return;
    }
    ret.push(index ? item : `/${item}`);
  });
  return {
    routeArr: ret,
    params,
  };
}
/**
 * @method levelcode转换为梯级数组
 * @param {string} levelcode
 * @return 返回梯级levelcode数组 ['/1', '/1/2', '/1/2/3']
 */
function levelcodeToArray(levelcode: string) {
  if (!levelcode) {
    return [];
  }
  const arr: string[] = levelcode.split('/');
  const ret: string[] = [];
  arr.length -= 1;
  arr.forEach((itm) => {
    ret.push(ret[ret.length - 1] ? `${ret[ret.length - 1] + itm}/` : `${itm}/`);
  });
  return ret;
}
/**
 * @method 异步加载百度地图组件
 */
const loadMap = () => new Promise(((resolve, reject) => {
  if (!window.BMap) {
    const script: any = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://api.map.baidu.com/getscript?v=2.0&ak=K52pNzWT61z1EHvdZptaSmlPRc7mKbjC&ser'
      + 'vices=&t=20180629105706&s=1';
    script.onerror = reject;
    const { head } = document;
    if (head) {
      head.appendChild(script);
    }
    script.onload = function onload() {
      if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
        resolve(window.BMap);
      }
      script.onload = null;
      script.onreadystatechange = null;
    };
    script.onreadystatechange = script.onload;
  } else {
    resolve(window.BMap);
  }
}));
/**
 * @method 异步加载百度地图插件
 * @detail MarkerClusterer标记聚合器用来解决加载大量点要素到地图上产生覆盖现象的问题，并提高性能
 */
const loadMapLib = () => new Promise(((resolve, reject) => {
  const script: any = document.createElement('script');
  script.type = 'text/javascript';
  script.src = '//api.map.baidu.com/library/MarkerClusterer/1.2/src/MarkerClusterer_min.js';
  script.onerror = reject;
  const { head } = document;
  if (head) {
    head.appendChild(script);
  }
  script.onload = function onload() {
    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
      resolve(window.BMapLib);
    }
    script.onload = null;
    script.onreadystatechange = null;
  };
  script.onreadystatechange = script.onload;
}));
/**
 * @method 异步加载百度地图工具包
 */
const loadMapTextIcon = () => new Promise(((resolve, reject) => {
  const script: any = document.createElement('script');
  script.type = 'text/javascript';
  script.src = '//api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js';
  script.onerror = reject;
  const { head } = document;
  if (head) {
    head.appendChild(script);
  }
  script.onload = function onload() {
    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
      resolve();
    }
    script.onload = null;
    script.onreadystatechange = null;
  };
  script.onreadystatechange = script.onload;
}));
const loadMapInfoBox = () => new Promise(((resolve, reject) => {
  const script: any = document.createElement('script');
  script.type = 'text/javascript';
  script.src = '//api.map.baidu.com/library/InfoBox/1.2/src/InfoBox_min.js';
  script.onerror = reject;
  const { head } = document;
  if (head) {
    head.appendChild(script);
  }
  script.onload = function onload() {
    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
      resolve();
    }
    script.onload = null;
    script.onreadystatechange = null;
  };
  script.onreadystatechange = script.onload;
}));
/**
 * @method 异步加载百度地图画图插件
 */
const loadDrawScript = () => new Promise(((resolve, reject) => {
  const script: any = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js';
  script.onerror = reject;
  const link: any = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '//api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css';
  const { head } = document;
  if (head) {
    head.appendChild(link);
    head.appendChild(script);
  }
  script.onload = function onload() {
    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
      // map ok
      resolve(window.BMapLib);
    }
    script.onload = null;
    script.onreadystatechange = null;
  };
  script.onreadystatechange = script.onload;
}));

/**
 * @method 异步加载百度地图canvas图层插件
 */
const loadCanvasLayer = () => new Promise(((resolve, reject) => {
  const script: any = document.createElement('script');
  script.type = 'text/javascript';
  script.src = '/canvaslayer.js';
  script.onerror = reject;
  const { head } = document;
  if (head) {
    head.appendChild(script);
  }
  script.onload = function onload() {
    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
      resolve(window.CanvasLayer);
    }
    script.onload = null;
    script.onreadystatechange = null;
  };
  script.onreadystatechange = script.onload;
}));

/**
 * @method get表单请求下载函数
 * @param {string} url 下载地址
 */
function postDownload(url: string) {
  const Form = document.createElement('form');
  document.body.appendChild(Form);
  Form.method = 'get';
  Form.action = url;
  Form.target = '_blank';
  Form.submit();
}

export default {
  param2Obj,
  levelcodeToArray,
  routeToArray,
  postDownload,
  loadMap,
  loadMapLib,
  loadMapTextIcon,
  loadCanvasLayer,
  loadMapInfoBox,
  loadDrawScript,
};
