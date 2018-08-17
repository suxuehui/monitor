import { gpsToAddress } from '@/api/app';
import { Message } from 'element-ui';

export default class MapContorl {
  SMap: any = null; // map对象
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
    this.trackCarOverlay = function trackCarOverlay(point : any, type : string) {
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
   * 添加车辆覆盖物
   *
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
  // 初始化播放轨迹
  mapPlay(data: any, playSeconds: number) {
    this.trackData = data;
    this.oneTime = (playSeconds * 1000) / this.trackData.length;
    const firstPoint = new window.BMap.Point(data[0].lng, data[0].lat);
    this.addTrackCarOverlay(firstPoint, 'playCar');
    this.myCarOverlay.div.style.transition = `all ${this.oneTime / 1000}s linear`;
    console.log(this.playTimers);
    this.playTimers = this.playInterVal();
  }
  playInterVal = () => setInterval(() => {
    if (this.playNumber === this.trackData.length - 1) {
      window.clearInterval(this.playTimers);
      this.playNumber = 0;
    }
    const Point = new window.BMap.Point(
      this.trackData[this.playNumber].lng,
      this.trackData[this.playNumber].lat,
    );
    const pixel = this.SMap.pointToOverlayPixel(Point);
    this.myCarOverlay.div.style.left = `${pixel.x - 14}px`;
    this.myCarOverlay.div.style.top = `${pixel.y - 14}px`;
    this.myCarOverlay.div.style.transform = `rotate(${this.trackData[this.playNumber].direction}deg)`;
    this.playNumber += 1;
  }, this.oneTime)
  // 继续播放动画
  playContinue() {
    this.playTimers = this.playInterVal();
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
  /**
   * 初始化轨迹点信息覆盖物
   *
   */
  initTrackPointOverlay() {
    const self = this;
    this.trackPointOverlay = function trackPointOverlay(point : any, type : string) {
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
      // div.className = 'trackpointOverlay';
      div.className = this.type;
      const innerDiv = document.createElement('div');
      innerDiv.className = 'trackpoint_in';
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
    console.log(this.entityMarker.getIcon());
  }
  trackInfoBox: any = null; // 窗口对象
  entityMarker: any = null; // 标记
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
    // $('#monitorInfoZoomIn').click((e) => {
    //   TrackAction.triggerswitchmanagetab(1);
    //   TrackAction.triggersearchentitytrack();
    //   TrackAction.triggersetdate();
    //   TrackAction.triggerselecttrack();
    // });
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
  showTrackInfoBox(data: any) {
    this.removeTrackPointOverlay('trackpoint');
    this.removeTrackInfoBox();
    this.addTrackPointOverlay(data, 'trackpoint');
    gpsToAddress({ lat: data.lat, lng: data.lng, coordinateSystem: 'bd09ll' }).then((response) => {
      if (response.status === 0) {
        const address = response.result.formatted_address + response.result.sematic_description;
        const infor = [
          ['定位', data.lnglat],
          ['地址', address],
          ['速度', `${data.speed}km/h`],
          ['定位时间', new Date(data.uTCTime).Format('yyyy-MM-dd hh:mm:ss')],
        ];
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
