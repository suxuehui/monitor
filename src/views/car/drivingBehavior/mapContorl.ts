import { gpsToAddress } from '@/api/app';
import { Message } from 'element-ui';

export default class MapContorl {
  SMap: any = null;

  // map对象
  constructor(props: any) {
    this.SMap = props.SMap;
    this.initTrackPointOverlay();
    this.initTrackCarOverlay();
  }

  trackPointOverlay: any = null;

  point: any = null;

  type: string = '';

  trackCarOverlay: any = null;

  /**
   * 初始化轨迹车辆覆盖物
   *
   */
  initTrackCarOverlay() {
    const self = this;
    this.trackCarOverlay = function trackCarOverlay(point: any, type: string) {
      this.point = point;
      // this.type = 'trackpoint';
      this.type = type;
    };
    this.trackCarOverlay.prototype = new window.BMap.Overlay();
    this.trackCarOverlay.prototype.initialize = function initialize(map: any) {
      const that = this;
      this.map = self.SMap;
      this.div = document.createElement('div');
      const { div } = this;
      // div.className = 'trackpointOverlay';
      div.className = this.type;
      const innerDiv = document.createElement('div');
      innerDiv.className = 'trackcar';
      div.appendChild(innerDiv);
      self.SMap
        .getPanes()
        .labelPane
        .appendChild(div);
      return div;
    };
    this.trackCarOverlay.prototype.draw = function draw() {
      const { map } = this;
      const pixel = map.pointToOverlayPixel(this.point);
      this.div.style.left = `${pixel.x - 8}px`;
      this.div.style.top = `${pixel.y - 8}px`;
    };
  }

  myCarOverlay: any = null;

  /**
   * @method 添加车辆覆盖物
   * @param {Object} point 点
   * @param {string} type 点类型
   */
  addTrackCarOverlay(point: any, type: string) {
    this.myCarOverlay = new this.trackCarOverlay(point, type);
    this.SMap.addOverlay(this.myCarOverlay);
  }

  // 轨迹数据
  trackData: any = null;

  // 播放一个坐标点的时长
  oneTime: number = 0;

  // 动画setinterval值
  playTimers: any = null;

  // 当前轨迹点
  playNumber: number = 0;

  /**
   * @method 初始化播放轨迹
   * @param {Array} data 轨迹数据
   * @param {number} playSeconds 播放秒数
   * */
  initMapPlay(data: any, playSeconds: number) {
    // 缓存轨迹数据
    this.trackData = data;
    // 初始化定时器时间
    this.oneTime = (playSeconds * 1000) / this.trackData.length;
    // 初始化车辆图标
    const firstPoint = new window.BMap.Point(data[0].lng, data[0].lat);
    this.removeTrackCarOverlay('playCar');
    this.addTrackCarOverlay(firstPoint, 'playCar');
    this.myCarOverlay.div.style.transition = `left ${this.oneTime / 1000}s linear, top ${this.oneTime / 1000}s linear`;
  }

  /**
   * @method 播放定时器
   */
  playInterVal() {
    return setInterval(() => {
      // 判断是否为最后一个坐标点
      if (this.playNumber === this.trackData.length - 1) {
        window.clearInterval(this.playTimers);
        this.playNumber = 0;
      }
      // 创建坐标点对象
      const Point = new window.BMap.Point(
        this.trackData[this.playNumber].lng,
        this.trackData[this.playNumber].lat,
      );
      // 坐标点 -> 像素点坐标
      const pixel = this.SMap.pointToOverlayPixel(Point);
      this.myCarOverlay.div.style.left = `${pixel.x - 14}px`;
      this.myCarOverlay.div.style.top = `${pixel.y - 14}px`;
      // 方向的特殊处理
      this.rotateAnimate(this.myCarOverlay.div, this.trackData[this.playNumber].direction);
      // 坐标点像前加1
      this.playNumber += 1;
    }, parseFloat(this.oneTime.toFixed(6)));
  }

  /**
   * @method 避免 从 10度到350度这种，会顺时针旋转，正常是逆时针旋转
   * @param dom
   * @param direction
   */
  rotateAnimate(dom: any, direction: number) {
    const patt = /\d+/g;
    // 获取当前元素的方向值
    let startVal: any = patt.exec(dom.style.transform);
    startVal = parseInt(startVal ? startVal[0] : '0', 10);
    // 是否反方向旋转
    let isThe = false;
    if (Math.abs(startVal - direction) > 180) {
      isThe = true;
    }
    dom.style.transform = `rotate(${isThe ? -direction : direction}deg)`;
  }

  // 继续播放动画
  playContinue() {
    this.playTimers = this.playInterVal();
  }

  // 播放时长设置
  playSetTime(val: number) {
    if (this.trackData) {
      this.oneTime = (val * 1000) / this.trackData.length;
      this.playNumber = 0;
      this.passPlay();
    }
  }

  // 暂停播放
  passPlay() {
    window.clearInterval(this.playTimers);
  }

  // 跳跃播放
  jumpPlay(val: number) {
    const JumpNumber = parseInt(((val * 1000) / this.oneTime).toString(), 10);
    this.playNumber = JumpNumber;
  }

  // 清除播放
  clearPlay() {
    this.removeTrackCarOverlay('playCar');
    this.passPlay();
    this.playNumber = 0;
  }

  /**
   * @method 初始化轨迹点信息覆盖物
   */
  initTrackPointOverlay() {
    const self = this;
    this.trackPointOverlay = function trackPointOverlay(point: any, type: string) {
      this.point = point;
      // this.type = 'trackpoint';
      this.type = type;
    };
    this.trackPointOverlay.prototype = new window.BMap.Overlay();
    this.trackPointOverlay.prototype.initialize = function initialize(map: any) {
      const that = this;
      this.map = self.SMap;
      this.div = document.createElement('div');
      const { div } = this;
      div.className = 'trackpoint';
      // div.className = this.type;
      const innerDiv = document.createElement('div');
      innerDiv.className = this.type;
      div.appendChild(innerDiv);
      self.SMap
        .getPanes()
        .labelPane
        .appendChild(div);
      return div;
    };
    this.trackPointOverlay.prototype.draw = function draw() {
      const { map } = this;
      const pixel = map.pointToOverlayPixel(this.point);
      this.div.style.left = `${pixel.x - 8}px`;
      this.div.style.top = `${pixel.y - 8}px`;
    };
  }

  /**
   * 添加轨迹点信息覆盖物
   *
   * @param {Object} point 点
   * @param {string} type 点类型
   */
  addTrackPointOverlay(data: any, type: string) {
    const myCompOverlay = new this.trackPointOverlay(data.point, type);
    this.SMap.addOverlay(myCompOverlay);
  }

  /**
   * 设置设备监控的marker
   *
   * @param {Object} data marker的数据信息
   * @param {number} service_type 服务类型 1 为车辆定位点, 2为轨迹点
   */
  setEntityMarker(data: any, serviceType: number) {
    const that = this;
    const point = new window.BMap.Point(data.lng, data.lat);
    let iconUrl = '';
    let size;
    let imageSize;
    const { status } = data;
    if (serviceType === 1) {
      size = new window.BMap.Size(41, 34);
      imageSize = new window.BMap.Size(41, 34);
      switch (status.substring(0, 2)) {
        case '离线':
          iconUrl = require('@/assets/caroffnorth.png');
          break;
        case '静止':
          iconUrl = require('@/assets/carstaticnorth.png');
          break;
        default:
          iconUrl = require('@/assets/carrunnorth.png');
          break;
      }
    } else {
      size = new window.BMap.Size(22, 27);
      imageSize = new window.BMap.Size(22, 27);
      switch (status.substring(0, 2)) {
        case '离线':
          iconUrl = require('@/assets/othertypeoffline.png');
          break;
        case '静止':
          iconUrl = require('@/assets/othertypestatic.png');
          break;
        default:
          iconUrl = require('@/assets/othertype.png');
          break;
      }
    }
    const icon = new window.BMap.Icon(iconUrl, size);
    icon.setImageSize(imageSize);
    this.entityMarker = new window.BMap.Marker(point, { icon });
    this.entityMarker.setZIndex(999);
    this.entityMarker.setRotation(data.direction);
    this.entityMarker.addEventListener('click', (e: any) => {
      that.trackInfoBox.open(that.entityMarker);
    });
    this.SMap.addOverlay(this.entityMarker);
    // 如果是定时器触发的，那么不移动地图
    if (!data.interval) {
      this.SMap.panTo(point);
    }
  }

  trackInfoBox: any = null;

  // 窗口对象
  entityMarker: any = null;

  // 标记
  /**
   * 初始化车辆信息详情和轨迹点详情infobox
   *
   * @param {Object} data 数据
   */
  setTrackInfoBox(data: any) {
    const infoContentFrontArr = [
      '<div class="carInfoWindow">',
      '<div class="carInfoHeader0">',
      `<abbr title="${data.plateNum}">`,
      data.plateNum,
      '</abbr>',
      '</div>',
      '<div class="carInfoContent">',
    ];
    data.infor.forEach((item: any) => {
      const itemPushArr = [
        '<div class="carInfoItem">',
        '<div class="infoItemTitle">',
        item[0],
        '</div>',
        '<div class="infoItemContent">',
        item[1],
        '</div>',
        '</div>',
      ];
      infoContentFrontArr.push(itemPushArr.join(''));
    });
    this.trackInfoBox = new window.BMapLib.InfoBox(
      this.SMap,
      infoContentFrontArr.join(''),
      {
        boxClass: 'carInfoBox',
        // boxStyle:{background:"url('tipbox.gif') no-repeatcenter top",width: "200px"},
        closeIconMargin: '15px 20px 0 0',
        alignBottom: false,
        closeIconUrl: require('@/assets/closeinfowindow.png'),
      },
    );
    this.trackInfoBox.addEventListener('close', () => {
      // TrackAction.closemonitorinfobox();
    });
    this.trackInfoBox.open(data.point);
  }

  /**
  * 删除轨迹点信息覆盖物
  *
  * @param {string} type 类型，分为鼠标浮动和点击两种
  */
  removeTrackPointOverlay(type: string) {
    const overlays = this.SMap.getOverlays();
    const { length } = overlays;
    const trackPointOverlays = [];
    for (let i = 0; i < length; i += 1) {
      if (overlays[i].type === type) {
        trackPointOverlays.push(overlays[i]);
      }
    }
    for (let j = 0; j < trackPointOverlays.length; j += 1) {
      this.SMap.removeOverlay(trackPointOverlays[j]);
    }
  }

  /**
  * 删除轨迹车辆覆盖物
  *
  * @param {string} type 类型，分为鼠标浮动和点击两种
  */
  removeTrackCarOverlay(type: string) {
    const overlays = this.SMap.getOverlays();
    const { length } = overlays;
    const trackPointOverlays = [];
    for (let i = 0; i < length; i += 1) {
      if (overlays[i].type === type) {
        trackPointOverlays.push(overlays[i]);
      }
    }
    for (let j = 0; j < trackPointOverlays.length; j += 1) {
      this.SMap.removeOverlay(trackPointOverlays[j]);
    }
  }

  /**
   * 删除设备监控的marker,
   *
   */
  removeEntityMarker() {
    this.SMap.removeOverlay(this.entityMarker);
    this.entityMarker = null;
  }

  /**
   * 删除infobox
   *
   */
  removeTrackInfoBox() {
    this.SMap.removeOverlay(this.trackInfoBox);
    this.trackInfoBox = null;
  }
  /**
   * 展示轨迹点详情
  */

  // haoverMap = ['', '震动', '碰撞', '翻滚', '急加速', '急减速', '急转弯'];
  haoverMap = ['', '急加速', '急减速', '急转弯', '震动', '', '碰撞', '翻滚', '超速'];
  // 1-急加速 2-急减速 3-急转弯 4-震动 6-碰撞 7-翻滚 8-超速 

  getDirection(itm: number) {
    let direction = '';
    if (itm > 337.5 || itm <= 22.5) {
      direction = '北方';
    } else if (itm > 22.5 && itm <= 67.5) {
      direction = '东北方';
    } else if (itm > 67.5 && itm <= 112.5) {
      direction = '东方';
    } else if (itm > 112.5 && itm <= 157.5) {
      direction = '东南方';
    } else if (itm > 157.5 && itm <= 202.5) {
      direction = '南方';
    } else if (itm > 202.5 && itm <= 247.5) {
      direction = '西南方';
    } else if (itm > 247.5 && itm <= 292.5) {
      direction = '西方';
    } else if (itm > 292.5 && itm <= 337.5) {
      direction = '西北方';
    }
    direction = '未知';
    return direction;
  }

  // 展示轨迹点信息窗口
  showTrackInfoBox(data: any) {
    this.removeTrackPointOverlay('trackpoint_in');
    this.removeTrackInfoBox();
    this.addTrackPointOverlay(data, 'trackpoint_in');
    gpsToAddress({ lat: data.lat, lng: data.lng, coordinateSystem: 'bd09ll' }).then((response) => {
      if (response.status === 0) {
        const address = response.result.formatted_address + response.result.sematic_description;
        const infor = [];
        if (data.event && data.event[0] !== '0') {
          const haovrData: string[] = [];
          data.event.forEach((item: string) => {
            haovrData.push(this.haoverMap[parseInt(item, 10)]);
          });
          infor.push(['驾驶行为', haovrData.join('-')]);
        }
        infor.push(['定位时间', new Date(data.uTCTime).Format('yyyy-MM-dd hh:mm:ss')]);
        infor.push(['定位地址', `${address}(${data.lnglat})`]);
        this.setTrackInfoBox({
          plateNum: data.plateNum,
          infor,
          point: data.point,
          status: data.status,
        });
      } else {
        Message.error('获取物理地址失败！');
      }
    });
  }
}
