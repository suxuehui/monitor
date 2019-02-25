import { Component, Vue } from 'vue-property-decorator';
import { Button, Slider, Select, Option, Tooltip } from 'element-ui';
import { FilterFormList, tableList } from '@/interface';
import qs from 'qs';
import { exportExcel } from '@/api/export';
import { tripGPS } from '@/api/trajectory';
import coordTrasns from '@/utils/coordTrasns';
import config from '@/utils';
import commonfun from './commonfun';
import MapControl from './mapContorl';
import './index.less';

@Component({
  components: {
  'el-button': Button,
  'el-slider': Slider,
  'el-select': Select,
  'el-option': Option,
  'el-tooltip': Tooltip,
  },
  name: 'Trajectory',
  })
export default class Trajectory extends Vue {
  locChange: boolean = false;

  // 底部表格开关
  filterList: FilterFormList[] = [
    {
      key: 'time',
      type: 'datetimerange',
      label: '时间',
      placeholder: [
        '开始时间', '结束时间',
      ],
      value: [
        'startTime', 'endTime',
      ],
      change: this.timeRangeChange,
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const end = new Date();
              const start = new Date(`${end.Format('yyyy-MM-dd hh:mm:ss').replace(/\s\w+:\w+:\w+/g, '')} 00:00:00`);
              picker.$emit('pick', [start, end]);
            },
          }, {
            text: '昨天',
            onClick(picker) {
              const end = new Date();
              const start = new Date(`${end.Format('yyyy-MM-dd hh:mm:ss').replace(/\s\w+:\w+:\w+/g, '')} 00:00:00`);
              end.setTime(start.getTime());
              start.setTime(start.getTime() - (3600 * 1000 * 24));
              picker.$emit('pick', [start, end]);
            },
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - (3600 * 1000 * 24 * 7));
              picker.$emit('pick', [start, end]);
            },
          },
        ],
      },
    },
  ];

  filterParams: any = {
    checkboxTime: '',
    time: '',
    startTime: '',
    endTime: '',
  };

  outParams: any = {
    startTime: '',
    endTime: '',
  }

  backParams: object = {
    code: 'result.resultCode',
    codeOK: '0',
    message: 'result.resultMessage',
    data: 'entity.data',
    total: 'entity.count',
  };

  clear() {
    this.outParams = {
      startTime: '',
      endTime: '',
    };
  }

  timeRangeChange(val: any) {
    if (val) {
      if (val.length === 2) {
        const startT = val[0].Format('yyyy-MM-dd hh:mm:ss');
        const endT = val[1].Format('yyyy-MM-dd hh:mm:ss');
        this.outParams.startTime = startT;
        this.outParams.endTime = endT;
      } else {
        this.outParams.startTime = `${val[0]}`;
        this.outParams.endTime = `${val[1]}`;
      }
    } else {
      this.outParams.startTime = '';
      this.outParams.endTime = '';
    }
  }

  tableList: tableList[] = [
    {
      label: '车牌号',
      prop: 'platenum',
    }, {
      label: '开始时间',
      prop: 'startTime',
      sortable: true,
      sortBy: 'startTime',
    }, {
      label: '结束时间',
      prop: 'endTime',
      sortable: true,
      sortBy: 'endTime',
    }, {
      label: '起点',
      prop: 'startAddr',
    }, {
      label: '终点',
      prop: 'endAddr',
    }, {
      label: '里程',
      prop: 'mileage',
      sortable: true,
      sortBy: 'mileage',
      formatter(row: any) {
        return row.mileage !== null
          ? `${Math.abs(row.mileage)}km` // 里程可能为负
          : '--';
      },
    }, {
      label: '用时',
      prop: 'periodMinute',
      sortable: true,
      sortBy: 'periodMinute',
    }, {
      label: '耗油',
      prop: 'oilConsumption',
      sortable: true,
      sortBy: 'oilConsumption',
    }, {
      label: '耗电',
      prop: 'powerCons',
      sortable: true,
      sortBy: 'powerCons',
      formatter(row: any) {
        return row.powerCons !== null
          ? `${row.powerCons}%`
          : '--';
      },
    }, {
      label: '平均油耗',
      prop: 'avgfuelConsString',
      sortable: true,
      sortBy: 'avgfuelConsString',
    }, {
      label: '平均速度',
      prop: 'avgSpeed',
      sortable: true,
      sortBy: 'avgSpeed',
      formatter(row: any) {
        return row.avgSpeed !== null
          ? `${Math.abs(row.avgSpeed)}km/h`
          : '--';
      },
    }, {
      label: '最高速度',
      prop: 'maxSpeed',
      sortable: true,
      sortBy: 'maxSpeed',
      formatter(row: any) {
        return row.maxSpeed !== null
          ? `${row.maxSpeed}km/h`
          : '--';
      },
    },
  ];

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
    this.tableUrl = '/device/trip/list';
    this.outParams.vehicleId = this.$route.params.id;
    const getNowRoles: string[] = [
      // 操作
      '/device/trip/exportExcel',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.exportBtn = !!(res[0]);
    });
  }
  // 切换回当前页面的时候，重新获取数据，去掉前面的轨迹数据
  activated() {
    // 判断是否新的id值传入
    if (this.$route.params.id !== this.outParams.vehicleId) {
      this.outParams.vehicleId = this.$route.params.id;
      const TableRecord: any = this.$refs.table;
      TableRecord.reloadTable();
      this.clearCanvas();
      this.isEnd = false;
      this.locChange = false;
      this.behaivorData = [
        { num: 0, txt: '震动' },
        { num: 0, txt: '碰撞' },
        { num: 0, txt: '翻滚' },
        { num: 0, txt: '急加速' },
        { num: 0, txt: '急减速' },
        { num: 0, txt: '急转弯' },
      ];
    }
  }

  // 清除图层
  clearCanvas = () => {
    if (this.canvasLayer || this.canvasLayerBack
      || this.CanvasLayerPointer || this.canvasBehavior) {
      this.SMap.removeOverlay(this.CanvasLayerPointer);
      this.SMap.removeOverlay(this.canvasLayer);
      this.SMap.removeOverlay(this.canvasLayerBack);
      this.SMap.removeOverlay(this.canvasBehavior);
    }
  }
  // 轨迹边框层
  canvasLayer: any = null;
  // 轨迹渐变层
  canvasLayerBack: any = null;
  // 轨迹点层
  CanvasLayerPointer: any = null;
  // 驾驶行为层
  canvasBehavior: any = null;

  pointCollection: any = [];

  // utc时间转换为北京时间
  utc2now(time: string) {
    const date = new Date(time);
    const str = date.getTime() + (8 * 60 * 60 * 1000); // 转换成时间戳+8小时
    const nowDate = new Date(str);
    return nowDate.Format('yyyy-MM-dd hh:mm:ss');
  }

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
      tempPoint.uTCTime = this.utc2now(data[i].utctime);
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
    // 渲染轨迹边框
    function updateBack() {
      // ctx：返回一个用于在画布上绘图的环境
      const ctx = self.canvasLayerBack.canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      // 清空给定矩形内的canvas图像
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      /**
       * 地图都是显示在确定大小的矩形框中的，这个矩形框通常是开发者在初始化地图传入的某个容器元素。
       * 这个矩形框也有自己的坐标系，在百度地图API中称之为可视区域坐标系，它的原点位于矩形的左上角。
       * pointToPixel:可视区域坐标转经纬度坐标
       * 利用canvas将前后两点连接起来
       */
      if (totalPoints.length !== 0) {
        for (let i = 0, len = totalPoints.length; i < len - 1; i += 1) {
          const pixel = self.SMap.pointToPixel(totalPoints[i]);
          const nextPixel = self.SMap.pointToPixel(totalPoints[i + 1]);
          ctx.beginPath(); // 开始一条路径
          ctx.moveTo(pixel.x, pixel.y);
          ctx.lineWidth = 8;
          ctx.strokeStyle = '#8b8b89';
          ctx.lineTo(nextPixel.x, nextPixel.y);
          ctx.lineCap = 'round';
          ctx.stroke(); // 开始绘制
        }
      }
    }
    // 绘制带颜色的轨迹
    function update() {
      const ctx = self.canvasLayer.canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      // 清空给定矩形内的canvas图像
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (totalPoints.length !== 0) {
        // 绘制带速度颜色的轨迹
        for (let i = 0, len = totalPoints.length; i < len - 2; i += 1) {
          // pointToPixel:可视区域坐标转经纬度坐标
          const pixel = self.SMap.pointToPixel(totalPoints[i]);
          const nextPixel = self.SMap.pointToPixel(totalPoints[i + 1]);
          ctx.beginPath();
          ctx.moveTo(pixel.x, pixel.y);
          ctx.lineCap = 'round';
          ctx.lineWidth = 6;
          // 两点之间的颜色渐变
          const grd = ctx.createLinearGradient(pixel.x, pixel.y, nextPixel.x, nextPixel.y);
          const { speed } = totalPoints[i];
          const speedNext = totalPoints[i + 1].speed;
          grd.addColorStop(0, self.getColorBySpeed(speed)); // 开始时点的颜色
          grd.addColorStop(1, self.getColorBySpeed(speedNext)); // 结束时点的颜色
          ctx.strokeStyle = grd;
          ctx.lineTo(nextPixel.x, nextPixel.y);
          ctx.stroke();
        }
      }
    }
    // 绘制轨迹方向
    function updatePointer() {
      const ctx = self.CanvasLayerPointer.canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      // 清空给定矩形内的canvas图像
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (totalPoints.length !== 0) {
        // 坐标像素距离累加值，大于40就渲染一个箭头
        let pixelPart = 0;
        for (let i = 0, len = totalPoints.length; i < len - 1; i += 1) {
          // pointToPixel:可视区域坐标转经纬度坐标
          const pixel = self.SMap.pointToPixel(totalPoints[i]);
          const nextPixel = self.SMap.pointToPixel(totalPoints[i + 1]);
          ctx.beginPath();
          pixelPart += Math.abs(nextPixel.x - pixel.x) + Math.abs(nextPixel.y - pixel.y);
          // 根据渲染像素距离渲染箭头
          if (pixelPart > 40) {
            // 箭头一共需要5个点：起点、终点、中心点、箭头端点1、箭头端点2
            pixelPart = 0;
            // 两点之间的中心点
            const midPixel = new self.BMap.Pixel(
              (pixel.x + nextPixel.x) / 2,
              (pixel.y + nextPixel.y) / 2,
            );
            // 起点终点距离
            const distance = (((nextPixel.x - pixel.x) ** 2)
              + ((nextPixel.y - pixel.y) ** 2)) ** 0.5;
            // 箭头长度
            const pointerLong = 4;
            const aPixel: any = {};
            const bPixel: any = {};
            if (nextPixel.x - pixel.x === 0) {
              if (nextPixel.y - pixel.y > 0) {
                aPixel.x = midPixel.x - (pointerLong * (0.5 ** 0.5));
                aPixel.y = midPixel.y - (pointerLong * (0.5 ** 0.5));
                bPixel.x = midPixel.x + (pointerLong * (0.5 ** 0.5));
                bPixel.y = midPixel.y - (pointerLong * (0.5 ** 0.5));
              } else if (nextPixel.y - pixel.y < 0) {
                aPixel.x = midPixel.x - (pointerLong * (0.5 ** 0.5));
                aPixel.y = midPixel.y + (pointerLong * (0.5 ** 0.5));
                bPixel.x = midPixel.x + (pointerLong * (0.5 ** 0.5));
                bPixel.y = midPixel.y + (pointerLong * (0.5 ** 0.5));
              } else {
                // continue;
              }
            } else {
              const k0 = (
                (
                  (-(2 ** 0.5) * distance * pointerLong)
                  + (2 * (nextPixel.y - pixel.y) * midPixel.y)
                ) / (2 * (nextPixel.x - pixel.x))) + midPixel.x;
              const k1 = -((nextPixel.y - pixel.y) / (nextPixel.x - pixel.x));
              const a = (k1 ** 2) + 1;
              const b = (2 * k1 * (k0 - midPixel.x)) - (2 * midPixel.y);
              const c = (((k0 - midPixel.x) ** 2) + (midPixel.y ** 2)) - (pointerLong ** 2);

              aPixel.y = (-b + (((b * b) - (4 * a * c)) ** 0.5)) / (2 * a);
              bPixel.y = (-b - (((b * b) - (4 * a * c)) ** 0.5)) / (2 * a);
              aPixel.x = (k1 * aPixel.y) + k0;
              bPixel.x = (k1 * bPixel.y) + k0;
            }
            ctx.moveTo(aPixel.x, aPixel.y);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#eee';
            ctx.lineTo(midPixel.x, midPixel.y);
            ctx.lineTo(bPixel.x, bPixel.y);
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        }
      }
    }
    // 绘制标记点
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
        if (self.getIsEnd()) {
          // 轨迹结束点
          const endXY = self.SMap.pointToPixel(totalPoints[totalPoints.length - 1]);
          iconRender(endXY.x - 13, endXY.y - 26, require('@/assets/end.png'));
        }
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
        if (this.canvasLayer || this.canvasLayerBack
          || this.CanvasLayerPointer || this.canvasBehavior) {
          this.SMap.removeOverlay(this.CanvasLayerPointer);
          this.SMap.removeOverlay(this.canvasLayer);
          this.SMap.removeOverlay(this.canvasLayerBack);
          this.SMap.removeOverlay(this.canvasBehavior);
        }
        // 轨迹边框渲染
        this.canvasLayerBack = new this.CanvasLayer({
          map: this.SMap,
          update: updateBack,
        });
        // 轨迹渐变渲染
        this.canvasLayer = new this.CanvasLayer({
          map: this.SMap,
          update,
        });
        // 轨迹箭头渲染
        this.CanvasLayerPointer = new this.CanvasLayer({
          map: this.SMap,
          update: updatePointer,
        });
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
    if (that.first) {
      setTimeout(() => render(), 100);
    } else {
      this.render();
    }
  }

  getIsEnd() {
    return this.isEnd;
  }

  getPlateNum() {
    return this.plateNum;
  }

  // 根据速度获取相应颜色
  getColorBySpeed = (speed: number) => {
    let color = '';
    let red: string | number = 0;
    let green: string | number = 0;
    let blue: string | number = 0;
    speed = speed > 100 ? 100 : speed;
    switch (Math.floor(speed / 25)) {
      case 0:
        red = 187 + Math.ceil(((241 - 187) / 25) * speed);
        green = 0 + Math.ceil(((48 - 0) / 25) * speed);
        blue = 0 + Math.ceil(((48 - 0) / 25) * speed);
        break;
      case 1:
        speed -= 25;
        red = 241 + Math.ceil(((255 - 241) / 25) * speed);
        green = 48 + Math.ceil(((200 - 48) / 25) * speed);
        blue = 48 + Math.ceil(((0 - 48) / 25) * speed);
        break;
      case 2:
        speed -= 50;
        red = 255 + Math.ceil(((22 - 255) / 25) * speed);
        green = 200 + Math.ceil(((191 - 200) / 25) * speed);
        blue = 0 + Math.ceil(((43 - 0) / 25) * speed);
        break;
      case 3:
        speed -= 75;
        red = 85 + Math.ceil(((22 - 85) / 25) * speed);
        green = 170 + Math.ceil(((191 - 170) / 25) * speed);
        blue = 0 + Math.ceil(((85 - 0) / 25) * speed);
        break;
      case 4:
        red = 85;
        green = 170;
        blue = 85;
        break;
      default: break;
    }

    red = red
      .toString(16)
      .length === 1
      ? `0${red.toString(16)}`
      : red.toString(16);
    green = green
      .toString(16)
      .length === 1
      ? `0${green.toString(16)}`
      : green.toString(16);
    blue = blue
      .toString(16)
      .length === 1
      ? `0${blue.toString(16)}`
      : blue.toString(16);
    color = `#${red}${green}${blue}`;
    return color;
  }

  // 增加zoom
  zoomAdd = () => {
    const newZoom = this.SMap.getZoom() + 1;
    this.SMap.setZoom(newZoom);
  }

  // 减少zoom
  zoomReduce = () => {
    const newZoom = this.SMap.getZoom() - 1;
    this.SMap.setZoom(newZoom);
  }

  // 表格显示隐藏
  showTable(): void {
    this.locChange = false;
  }

  hideTable(): void {
    this.locChange = true;
  }

  plateNum = '';

  behaivorData: { num: number, txt: string }[] = []

  isEnd: boolean = true;

  // 表格单选
  currentChange(val: any) {
    if (val) {
      // 通过是否有结束时间判断当前轨迹是否结束
      if (!val.endTime) {
        this.isEnd = false;
      } else {
        this.isEnd = true;
      }
      this.behaivorData = [
        { num: 0, txt: '震动' },
        { num: 0, txt: '碰撞' },
        { num: 0, txt: '翻滚' },
        { num: 0, txt: '急加速' },
        { num: 0, txt: '急减速' },
        { num: 0, txt: '急转弯' },
      ];
      this.plateNum = val.platenum;
      // 清除播放
      this.getMapContorl().clearPlay();
      this.clearPlay();
      // 清除上一条轨迹
      this.getMapContorl().removeTrackPointOverlay('trackpoint_in');
      // 清除轨迹点信息框
      this.getMapContorl().removeTrackInfoBox();
      // 根据轨迹id，查询轨迹详情
      tripGPS({ id: val.tripId }).then((res) => {
        if (res.result.resultCode === '0') {
          let data = res.entity;
          // 判断轨迹数据是否为空
          if (!data || !data.length) {
            this.getMapContorl().clearPlay();
            this.clearPlay();
            this.getMapContorl().removeTrackPointOverlay('trackpoint_in');
            this.getMapContorl().removeTrackInfoBox();
            this.$message.error('轨迹信息为空！');
            return false;
          }
          // 重置驾驶行为数据
          this.behaivorData = [
            { num: 0, txt: '震动' },
            { num: 0, txt: '碰撞' },
            { num: 0, txt: '翻滚' },
            { num: 0, txt: '急加速' },
            { num: 0, txt: '急减速' },
            { num: 0, txt: '急转弯' },
          ];
          // 循环转换轨迹坐标点
          data = data.filter((item: any, index: number) => {
            // 过滤异常坐标点数据
            if (item.lat > 0 || item.lng > 0) {
              const point = coordTrasns.transToBaidu(item, 'bd09ll');
              item.lat = point.lat;
              item.lng = point.lng;
              // 判断是否有驾驶行为数据
              if (item.events) {
                // 循环统计驾驶行为数据
                item.events.forEach((items: string) => {
                  if (items !== '0') {
                    this.behaivorData[parseInt(items, 10) - 1].num += 1;
                  }
                });
              }
              return item;
            }
            return false;
          });
          this.currentTrackData = data;
          this.trackView(data);
          // 设置轨迹播放时间-1小时轨迹播放时长为1分钟
          this.playTime = this.timeFormat(val.period);
          this.defaultTime = this.playTime;
        }
        return true;
      });
    }
  }

  /**
   * 播放轨迹动画-start
   */
  playOnTime: number = 0;

  // 播放当前时间点
  defaultTime: string = '';

  playTime: string = '1:00';

  // 播放时长
  playStatus: boolean = false;

  // 播放状态
  playMultiple: number = 1;

  // 播放速度
  timeFormat(val: number) { // 格式化时间
    return `${parseInt((val / 60).toString(), 10)}:${(val % 60) < 10 ? `0${(val % 60).toFixed(0)}` : (val % 60).toFixed(0)}`;
  }

  /**
   * @method 时间转为秒数
   * @param {string} time 时间 格式为 10:00
   */
  playTimeNumber(time: string) {
    const timeArr = time.split(':');
    let timeNumber = 0;
    timeNumber += parseInt(timeArr[0], 10) * 60;
    timeNumber += parseInt(timeArr[1], 10);
    return timeNumber;
  }

  // 播放seInterval值
  playTimer: any = null;

  // 是否第一次播放轨迹
  firstPlay: boolean = true;

  getTrackData() {
    return this.currentTrackData;
  }

  getMapContorl = () => this.mapContorl

  // 播放轨迹动画
  trackPlay() {
    const mapContorl = this.getMapContorl();
    // 是否第一次播放轨迹，用于判断是否是暂停
    if (this.firstPlay) {
      // 初始化播放车辆
      mapContorl.initMapPlay(this.getTrackData(), this.playTimeNumber(this.playTime));
      this.firstPlay = false;
    }
    // 判断当前播放状态
    if (this.playStatus) {
      // 暂停播放
      this.playStatus = false;
      clearInterval(this.playTimer);
      mapContorl.passPlay();
    } else {
      // 开始播放轨迹
      this.playStatus = true;
      // 车辆图标开始播放
      mapContorl.playContinue();
      // 进度条播放
      this.playTimer = setInterval(() => {
        if (this.playOnTime === this.playTimeNumber(this.playTime)) {
          clearInterval(this.playTimer);
          this.playStatus = false;
          this.playOnTime = 0;
          this.firstPlay = true;
          this.getMapContorl().clearPlay();
        } else {
          this.playOnTime += 1;
        }
      }, 1000);
    }
  }

  jumpPlay(val: number) {
    this.getMapContorl().jumpPlay(val);
  }

  clearPlay() {
    // this.trackPlay();
    clearInterval(this.playTimer);
    this.playOnTime = 0;
    this.playStatus = false;
    this.firstPlay = true;
    this.getMapContorl().clearPlay();
  }

  playChange(val: number) {
    this.playTime = this.timeFormat(this.playTimeNumber(this.defaultTime) / val);
    this.clearPlay();
    this.getMapContorl().playSetTime(this.playTimeNumber(this.defaultTime) / val);
  }
  /**
   * 播放轨迹动画-end
   */

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, '轨迹列表', '/device/trip/exportExcel');
  }

  render() {
    return (
      <div class="trajectory-wrap">
        <ul class="behavior-list">
          {
            this.behaivorData && this.behaivorData.map(item => <li>
              <span class="number">{item.num}</span>
              <span className="txt">{item.txt}</span>
            </li>)
          }
        </ul>
        <div id="map"></div>
        {
          this.currentTrackData.length
            ? <div class={`play-box ${this.locChange ? '' : 'bottom'} ${this.isEnd ? '' : 'hide'}`}>
              <i on-click={this.trackPlay} class={`play-icon iconfont-${this.playStatus ? 'pass' : 'play'}`}></i>
              <span class="dot-left">{this.timeFormat(this.playOnTime)}</span>
              <el-slider
                v-model={this.playOnTime}
                max={this.playTimeNumber(this.playTime)}
                on-onchange={this.jumpPlay}
                format-tooltip={this.timeFormat}>
              </el-slider>
              <span class="dot-right">{this.playTime}</span>
              <el-select v-model={this.playMultiple} on-change={this.playChange} placeholder="请选择">
                <el-option key={0} label="0.3x" value={0.3}></el-option>
                <el-option key={1} label="0.5x" value={0.5}></el-option>
                <el-option key={2} label="0.8x" value={0.8}></el-option>
                <el-option key={3} label="1x" value={1}></el-option>
                <el-option key={4} label="1.5x" value={1.5}></el-option>
                <el-option key={5} label="2x" value={2}></el-option>
                <el-option key={6} label="3x" value={3}></el-option>
              </el-select>
            </div> : null
        }
        <div
          class={[
            'loc-change-box3', !this.locChange
              ? 'loc-active'
              : '',
          ]}>
          <img class="speedContorl-img" src={require('@/assets/speedcontrol.png')}></img>
          <el-button
            class="add btn"
            size="small"
            icon="el-icon-plus"
            on-click={this.zoomAdd}></el-button>
          <el-button
            class="less btn"
            size="small"
            icon="el-icon-minus"
            on-click={this.zoomReduce}></el-button>
          {!this.locChange
            ? <el-button
              class="down btn"
              size="small"
              type="primary"
              icon="el-icon-arrow-down"
              on-click={this.hideTable}></el-button>
            : <el-button
              class="up btn"
              size="small"
              type="primary"
              icon="el-icon-arrow-up"
              on-click={this.showTable}></el-button>
          }
        </div>
        <div class={`car-table-tra-fzk ${!this.locChange ? 'table-active' : ''}`}>
          <filter-table
            ref="table"
            class="map-table"
            filter-list={this.filterList}
            filter-grade={[]}
            filter-params={this.filterParams}
            back-params={this.backParams}
            add-btn={false}
            export-btn={this.exportBtn}
            on-downBack={this.downLoad}
            dataType={'JSON'}
            fetchType={'post'}
            out-params={this.outParams}
            highlight-current-row={true}
            on-currentChange={this.currentChange}
            on-clearOutParams={this.clear}
            localName={'trajectory'}
            table-list={this.tableList}
            url={this.tableUrl}
            opreat-width="150px">
          </filter-table>
        </div>
      </div>
    );
  }
}
