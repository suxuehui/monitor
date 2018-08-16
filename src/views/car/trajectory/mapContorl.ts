import { gpsToAddress } from '@/api/app';
import { Message } from 'element-ui';

export default class MapContorl {
  SMap: any = null; // map对象
  constructor(props: any) {
    this.SMap = props.SMap;
    this.initTrackPointOverlay();
  }
  trackPointOverlay: any = null;
  point: any = null;
  type: string = '';
  /**
   * 初始化轨迹点信息覆盖物
   *
   */
  initTrackPointOverlay() {
    this.trackPointOverlay = function trackPointOverlay(point : any, type : string) {
      this.point = point;
      // this.type = 'trackpoint';
      this.type = type;
    };
    this.trackPointOverlay.prototype = new window.BMap.Overlay();
    this.trackPointOverlay.prototype.initialize = function initialize(map: any) {
      const that = this;
      this.map = map;
      this.div = document.createElement('div');
      const { div } = this;
      // div.className = 'trackpointOverlay';
      div.className = this.type;
      const innerDiv = document.createElement('div');
      innerDiv.className = 'trackpoint_in';
      div.appendChild(innerDiv);
      map
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
  addTrackPointOverlay(point: any, type: string) {
    const myCompOverlay = new this.trackPointOverlay(point, type);
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
      `<div class="carInfoHeader${data.status}">`,
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
    const infoContentNextArr = [
      '</div>',
      '<div class="infoControl">',
      '<div class="infoGoTrack" id="monitorInfoZoomIn">',
      '放大',
      '</div>',
      '</div>',
      '</div>',
    ];
    this.trackInfoBox = new window.BMapLib.InfoBox(
      this.SMap,
      infoContentFrontArr.concat(infoContentNextArr).join(''),
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
    this.trackInfoBox.open(this.entityMarker);
    // $('#monitorInfoZoomIn').click((e) => {
    //   TrackAction.triggerswitchmanagetab(1);
    //   TrackAction.triggersearchentitytrack();
    //   TrackAction.triggersetdate();
    //   TrackAction.triggerselecttrack();
    // });
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
    this.setEntityMarker(data, 2);
    gpsToAddress({ lat: data.lat, lng: data.lng, coordinateSystem: 'bd09ll' }).then((response) => {
      if (response.status === 0) {
        const address = response.result.formatted_address + response.result.sematic_description;
        const infor = [
          ['定位', data.lnglat],
          ['地址', address],
          ['速度', data.speed],
          ['定位时间', new Date(data.uTCTime).Format('yyyy-MM-dd hh:mm:ss')],
        ];
        this.setTrackInfoBox({
          plateNum: data.plateNum,
          infor,
          status: data.status,
        });
      } else {
        Message.error('获取物理地址失败！');
      }
    });
  }
}
