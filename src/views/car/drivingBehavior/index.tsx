import { Component, Vue } from 'vue-property-decorator';
import {
  Button, DatePicker,
} from 'element-ui';
import config from '@/utils';
import commonfun from './commonfun';
import MapControl from './mapContorl';
import './index.less';

@Component({
  components: {
    'el-button': Button,
    'el-date-picker': DatePicker,
  },
  name: 'DrivingBehavior',
})
export default class DrivingBehavior extends Vue {
  locChange: boolean = false;

  timeRangeChange(val: any) {
    console.log(val);
  }

  // 百度地图对象
  BMap: any = null;

  // 当前地图对象实例
  SMap: any = null;

  // 当前地图对象zoom
  SMapZoom: number = 15;

  // 定位
  geolocationControl: any = null;

  // 轨迹渲染层
  CanvasLayer: any = null;

  mapCenter: {
    lat: number,
    lng: number
  } = {
    lat: 29.563694,
    lng: 106.560421,
  };

  // 车辆位置
  CarPoint: any = null;

  // 车辆图标
  CarIcon: any = null;

  // 车辆标记
  CarMarker: object[] = [];

  tableUrl: string = '';

  // 地图方法类
  mapContorl: any = null;

  constructor(props: any) {
    super(props);
    config
      .loadMap()
      .then((BMap: any) => {
        this.BMap = BMap;
        this.SMap = new BMap.Map('map', { enableMapClick: false });
        this
          .SMap
          .setMapStyle({
            styleJson: [
              {
                featureType: 'all',
                elementType: 'all',
                stylers: {
                  lightness: 16,
                  saturation: -53,
                },
              },
            ],
          });
        this.SMap.centerAndZoom(new BMap.Point(this.mapCenter.lng, this.mapCenter.lat), 15);
        this.geolocationControl = new BMap.GeolocationControl();
        this.geolocationControl.addEventListener('locationSuccess', () => {
          console.log('locationSuccess');
        });
        this.SMap.enableScrollWheelZoom(true); // 设置鼠标滚动
        // 加载地图信息框
        config.loadMapInfoBox().then((BMapLib: any) => {
          this.mapContorl = new MapControl({ SMap: this.SMap });
        });
        // 加载canvas图层
        config.loadCanvasLayer().then((CanvasLayer: any) => {
          this.CanvasLayer = CanvasLayer;
        });
      });
  }

  currentTrackData = [];

  first = true;

  exportBtn: boolean = true;

  created() {
    const getNowRoles: string[] = [
      // 操作
      '/device/trip/exportExcel',
    ];
    // this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
    //   this.exportBtn = !!(res[0]);
    // });
  }

  // 切换回当前页面的时候，重新获取数据，去掉前面的轨迹数据
  activated() {
    console.log('再次进入该页面');
    const day: any = new Date();
    const startTime = `${day.Format('yyyy-MM-dd hh:mm:ss').replace(/\s\w+:\w+:\w+/g, '')} 00:00:00`;
    const endTime = day.Format('yyyy-MM-dd hh:mm:ss');
    this.searchTime={
      startTime,
      endTime,
    };
    // 判断是否新的id值传入
    this.behaivorData = [
      { num: 0, txt: '急加速' },
      { num: 0, txt: '急减速' },
      { num: 0, txt: '急转弯' },
      { num: 0, txt: '超速' },
      { num: 0, txt: '震动' },
      { num: 0, txt: '碰撞' },
      { num: 0, txt: '翻滚' },
    ];
  }

  // 清除图层
  clearCanvas = () => {
    if (this.canvasBehavior) {
      this.SMap.removeOverlay(this.canvasBehavior);
    }
  }

  // 驾驶行为层
  canvasBehavior: any = null;

  pointCollection: any = [];

  /**
   * view内部，绘制轨迹线路
   * @param {Array} data 轨迹数据
   */
  trackView = (data: any) => {
    const self = this;
    if (!data) {
      data = this.currentTrackData;
    }
    const that = this;
    const totalPoints: any = [];
    const viewportPoints = [];
    if (data.length === 0) {
      return;
    }
    for (let i = 0; i < data.length; i += 1) {
      /**
       * BMap.PointCollection中的元素为BMap.Point，在加入点集合BMap.PointCollection之前，让BMap.Point携带数据
       */
      const tempPoint = new this.BMap.Point(data[i].lng, data[i].lat);
      tempPoint.speed = data[i].obdSpeed >= 0 ? data[i].obdSpeed : data[i].gpsSpeed;
      tempPoint.direction = data[i].direction;
      tempPoint.printSpeed = commonfun.getSpeed(data[i].speed);
      tempPoint.lnglat = `${data[i].lng.toFixed(2)},${data[i].lat.toFixed(2)}`;
      tempPoint.event = data[i].events;
      totalPoints.push(tempPoint);
    }
    if (that.first) {
      // 所有的点都在地图上的可视区域内
      this.SMap.setViewport(totalPoints, { margins: [20, 0, 0, 20] });
    }
    // 绘制驾驶行为
    function renderBehavior() {
      // 定义车辆驾驶行为及对应颜色
      const NameMap = ['', '震', '碰', '翻', '加', '减', '弯'];
      const ColorMap = ['', '#52c41a', '#f5222d', '#eb2f96', '#1890ff', '#2f54eb', '#13c2c2'];
      const ctx: CanvasRenderingContext2D = self.canvasBehavior.canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      // 清空给定矩形内的canvas图像
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const mulPoint: { x: number, y: number, event: string[] }[] = [];
      /**
       * @method 画圆
       * @param {Number} x X轴
       * @param {Number} y Y轴
       * @param {String} text 展示文字
       * @param {String} color 颜色
       * @param {String} fontSize 文字大小
       * @param {String} type 驾驶行为个数
      */
      function addPoint(x: number, y: number, text: string, color: string, fontSize: string, type: 'one' | 'mul') {
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, 2 * Math.PI); // (x轴,y轴,半径,开始角度,结束角度)
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
        ctx.font = `bold ${fontSize} arial`;
        ctx.fillStyle = '#fff';
        ctx.fillText(text, type === 'one' ? x - 5.5 : x - 4, y + 4);
      }
      // 一个坐标有多个驾驶行为情况，鼠标指上圆点的时候，在上面展示多个驾驶行为图标
      function hoverMul(x: number, y: number, event: string[]) {
        let py = 0;
        event.forEach((item) => {
          addPoint(x + py, y - 30, NameMap[parseInt(item, 10)], ColorMap[parseInt(item, 10)], '12px', 'one');
          py += 30;
        });
      }
      // 移除canvas圆点
      function removeMul(x: number, y: number, num: number) {
        ctx.clearRect(x - 10, y - 40, num * 30, 20);
      }
      // canvas渲染图片
      function iconRender(x: number, y: number, url: string) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, x, y);
        };
        img.src = url;
      }
      if (totalPoints.length !== 0) {
        // 轨迹开始点
        const oneXY = self.SMap.pointToPixel(totalPoints[0]);
        iconRender(oneXY.x - 13, oneXY.y - 26, require('@/assets/start.png'));
        for (let i = 0, len = totalPoints.length; i < len - 1; i += 1) {
          if (totalPoints[i].event && totalPoints[i].event.length && totalPoints[i].event[0] !== '0') {
            // pointToPixel：经纬度坐标转像素坐标
            const pixel = self.SMap.pointToPixel(totalPoints[i]);
            if (totalPoints[i].event.length === 1) {
              addPoint(pixel.x, pixel.y, NameMap[parseInt(totalPoints[i].event[0], 10)], ColorMap[parseInt(totalPoints[i].event[0], 10)], '12px', 'one');
            } else {
              addPoint(pixel.x, pixel.y, totalPoints[i].event.length, '#faad14', '14px', 'mul');
              mulPoint.push({
                x: pixel.x,
                y: pixel.y,
                event: totalPoints[i].event,
              });
            }
          }
        }
        // 一个坐标多个驾驶行为情况
        if (mulPoint.length) {
          // 添加鼠标事件
          self.canvasBehavior.canvas.addEventListener('mousemove', (e: MouseEvent) => {
            mulPoint.forEach((item) => {
              // 判断是否鼠标位置是否在图标上
              if (Math.abs(e.pageX - item.x - 200) < 5 && Math.abs(e.pageY - item.y - 100) < 5) {
                hoverMul(item.x, item.y, item.event);
              } else {
                removeMul(item.x, item.y, item.event.length);
              }
            });
          });
        }
      }
    }
    const render = () => {
      if (totalPoints.length > 0) {
        if (this.canvasBehavior) {
          this.SMap.removeOverlay(this.canvasBehavior);
        }
        // 驾驶行为层
        this.canvasBehavior = new this.CanvasLayer({
          map: this.SMap,
          update: renderBehavior,
        });
      }
      const options = {
        size: window.BMAP_POINT_SIZE_HUGE,
        shape: window.BMAP_POINT_SHAPE_CIRCLE,
        color: 'rgba(0, 0, 0, 0)',
      };
      // 初始化PointCollection
      if (this.pointCollection) {
        this.SMap.removeOverlay(this.pointCollection);
      }
      this.pointCollection = new this.BMap.PointCollection(totalPoints, options);
      this.pointCollection.addEventListener('click', (e: any) => {
        this.mapContorl.showTrackInfoBox({
          ...e.point,
          plateNum: this.getPlateNum(),
          status: e.point.printSpeed,
          point: e.point,
        });
      });
      this.pointCollection.addEventListener('mouseover', (e: any) => {
        this.mapContorl.addTrackPointOverlay(e, 'trackpoint_over');
      });
      this.pointCollection.addEventListener('mouseout', (e: any) => {
        this.mapContorl.removeTrackPointOverlay('trackpoint_over');
      });
      // 添加Overlay
      this.SMap.addOverlay(this.pointCollection);
    };
  }

  getPlateNum() {
    return this.plateNum;
  }

  plateNum = '';

  behaivorData: { num: number, txt: string }[] = []

  // 循环转换轨迹坐标点
  // data = data.filter((item: any, index: number) => {
  //   // 过滤异常坐标点数据
  //   if (item.lat > 0 || item.lng > 0) {
  //     const point = coordTrasns.transToBaidu(item, 'bd09ll');
  //     item.lat = point.lat;
  //     item.lng = point.lng;
  //     // 判断是否有驾驶行为数据
  //     if (item.events) {
  //       // 循环统计驾驶行为数据
  //       item.events.forEach((items: string) => {
  //         if (items !== '0') {
  //           this.behaivorData[parseInt(items, 10) - 1].num += 1;
  //         }
  //       });
  //     }
  //     return item;
  //   }
  //   return false;
  // });

  todayActive: boolean = true; // 当天

  sevendayActive: boolean = false; // 7天

  thirtydayActive: boolean = false; // 30天

  allActive: boolean = false; // 全部（三个月）

  searchTime: any = {
    startTime: '',
    endTime: '',
  }; // 查询时间

  // 默认时间（当天）
  defaultTime: any = [
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
    new Date(new Date().getFullYear(), new Date().getMonth(),
      new Date().getDate(), new Date().getHours(), new Date().getMinutes(),
      new Date().getSeconds()),
  ]

  unix2time(num: any) {
    const date = new Date(num);
    const Y = `${date.getFullYear()}-`;
    const M = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`;
    const D = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()} `;
    const h = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:`;
    const m = `${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:`;
    const s = (date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds());
    return Y + M + D + h + m + s;
  }

  toDayData() {
    this.cancelAllActive();
    this.todayActive = true;
    const day: any = new Date();
    const startTime = `${day.Format('yyyy-MM-dd hh:mm:ss').replace(/\s\w+:\w+:\w+/g, '')} 00:00:00`;
    const endTime = day.Format('yyyy-MM-dd hh:mm:ss');
    this.defaultTime = [
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
      new Date(new Date().getFullYear(), new Date().getMonth(),
        new Date().getDate(), new Date().getHours(), new Date().getMinutes(),
        new Date().getSeconds()),
    ];
    this.searchTime = {
      startTime,
      endTime,
    };
  }

  sevenData() {
    this.cancelAllActive();
    this.sevendayActive = true;
    const day: any = new Date();
    const endTime = day.Format('yyyy-MM-dd hh:mm:ss');
    const oldTimestamp = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    this.defaultTime = [
      new Date(oldTimestamp),
      new Date(),
    ];
    this.searchTime = {
      startTime: this.unix2time(oldTimestamp),
      endTime,
    };
  }

  thirtyData() {
    this.cancelAllActive();
    this.thirtydayActive = true;
    const day: any = new Date();
    const endTime = day.Format('yyyy-MM-dd hh:mm:ss');
    const oldTimestamp = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
    this.defaultTime = [
      new Date(oldTimestamp),
      new Date(),
    ];
    this.searchTime = {
      startTime: this.unix2time(oldTimestamp),
      endTime,
    };
  }

  allData() {
    this.cancelAllActive();
    this.allActive = true;
    const day: any = new Date();
    const endTime = day.Format('yyyy-MM-dd hh:mm:ss');
    const oldTimestamp = new Date().getTime() - 90 * 24 * 60 * 60 * 1000;
    this.defaultTime = [
      new Date(oldTimestamp),
      new Date(),
    ];
    this.searchTime = {
      startTime: this.unix2time(oldTimestamp),
      endTime,
    };
  }

  timeSelect(data: any) {
    this.cancelAllActive();
    if (data) {
      const start = new Date(data[0]).getTime();
      const end = new Date(data[1]).getTime();
      if (end - start < 90 * 24 * 60 * 60 * 1000) {
        // const time = {
        //   startTime: data[0],
        //   endTime: data[1],
        // };
        this.searchTime = {
          startTime: data[0],
          endTime: data[1],
        };
      } else {
        this.$message.error('查询时间范围最大为三个月，请重新选择');
      }
    }
  }

  getBehaviorData(time: any, str?: string) {
    console.log(this.searchTime);
  }

  cancelAllActive() {
    this.todayActive = false;
    this.sevendayActive = false;
    this.thirtydayActive = false;
    this.allActive = false;
  }

  render() {
    return (
      <div class="drivingBehavior-wrap">
        <div id="map"></div>
        <div class="behavior-info">
          <span class="car-plate">渝BPD418</span>
          <ul class="behavior-list">
            {
              this.behaivorData && this.behaivorData.map((item, index) => (
                <li class="list-item">
                  <span class="item-val">{item.num}</span>
                  <span class="item-tit">{item.txt}</span>
                </li>
              ))
            }
          </ul>
        </div>
        <div class="timeSet">
          <ul class="normalTime">
            <li
              id="toDay"
              class={['item', this.todayActive ? 'active' : '']}
              on-click={this.toDayData}
            >
              今天
              </li>
            <li
              id="sevenDay"
              class={['item', this.sevendayActive ? 'active' : '']}
              on-click={this.sevenData}
            >
              近7天
              </li>
            <li
              id="thirtyDay"
              class={['item', this.thirtydayActive ? 'active' : '']}
              on-click={this.thirtyData}
            >
              近30天
              </li>
            <li
              id="allDay"
              class={['item', this.allActive ? 'active' : '']}
              on-click={this.allData}
            >
              全部
              </li>
          </ul>
          <el-date-picker
            id="datePicker"
            v-model={this.defaultTime}
            type="datetimerange"
            class="datePicker"
            size="mini"
            value-format="yyyy-MM-dd HH:mm:ss"
            on-change={(val: any) => this.timeSelect(val)}
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束">
          </el-date-picker>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            class="search"
            on-click={() => this.getBehaviorData('111')}
          >查询</el-button>
        </div>
      </div>
    );
  }
}
