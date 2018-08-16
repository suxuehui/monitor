import { Component, Vue } from 'vue-property-decorator';
import { Button } from 'element-ui';
import { FilterFormList, tableList } from '@/interface';
import { tripGPS } from '@/api/trajectory';
import coordTrasns from '@/utils/coordTrasns';
import config from '@/utils';
import commonfun from './commonfun';
import MapControl from './mapContorl';
import './index.less';

function getTimeDay(day : number) {}

@Component({
  components: {
  'el-button': Button
  }
  })
export default class Trajectory extends Vue {
  locChange : boolean = false; // 底部表格开关
  filterList : FilterFormList[] = [
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
  filterParams : any = {
    checkboxTime: '',
    time: '',
    startTime: '',
    endTime: '',
  };
  outParams : any = {
    startTime: '',
    endTime: '',
  }
  backParams : object = {
    code: 'result.resultCode',
    codeOK: '0',
    message: 'result.resultMessage',
    data: 'entity',
    total: 'count',
  };
  tableList : tableList[] = [
    {
      label: '车牌号',
      prop: 'plateNum',
    }, {
      label: '时间',
      prop: 'startTime',
    }, {
      label: '起点',
      prop: 'startAddress',
    }, {
      label: '终点',
      prop: 'endAddress',
    }, {
      label: '里程',
      prop: 'mileage',
      formatter(row : any) {
        return row.mileage
          ? `${row.mileage}km`
          : '未知';
      },
    }, {
      label: '用时',
      prop: 'minutes',
      formatter(row : any) {
        return row.mileage
          ? `${row.mileage}分钟`
          : '未知';
      },
    }, {
      label: '耗油',
      prop: 'oil',
      formatter(row : any) {
        return row.mileage
          ? `${row.mileage}L`
          : '未知';
      },
    }, {
      label: '耗电',
      prop: 'consuElectric',
      formatter(row : any) {
        return row.mileage
          ? `${row.mileage}%`
          : '未知';
      },
    }, {
      label: '平均油耗',
      prop: 'avgOil',
      formatter(row : any) {
        return row.mileage
          ? `${row.mileage}L/km`
          : '未知';
      },
    }, {
      label: '平均速度',
      prop: 'avgSpeed',
      formatter(row : any) {
        return row.mileage
          ? `${row.mileage}km/h`
          : '未知';
      },
    }, {
      label: '最高速度',
      prop: 'maxSpeed',
      formatter(row : any) {
        return row.mileage
          ? `${row.mileage}km`
          : '未知';
      },
    },
  ];
  BMap : any = null; // 百度地图对象
  SMap : any = null; // 当前地图对象实例
  SMapZoom : number = 15; // 当前地图对象zoom
  geolocationControl : any = null; // 定位
  CanvasLayer: any = null; // 轨迹渲染层
  mapCenter : {
    lat: number,
    lng: number
  } = {
    lat: 29.563694,
    lng: 106.560421,
  };
  CarPoint : any = null; // 车辆位置
  CarIcon : any = null; // 车辆图标
  CarMarker : object[] = []; // 车辆标记
  tableUrl : string = '';
  mapContorl: any = null; // 地图方法类
  constructor(props : any) {
    super(props);
    config
      .loadMap()
      .then((BMap : any) => {
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
        this.SMap.enableScrollWheelZoom(true);
        config.loadMapInfoBox().then((BMapLib: any) => {
          this.mapContorl = new MapControl({ SMap: this.SMap });
        });
        config.loadCanvasLayer().then((CanvasLayer: any) => {
          this.CanvasLayer = CanvasLayer;
        });
      });
  }
  currentTrackData = [];
  first = true;

  created() {
    this.tableUrl = `/device/trip/list/${this.$route.params.id}`;
  }
  canvasLayer: any = null;
  canvasLayerBack: any = null;
  CanvasLayerPointer: any = null;
  pointCollection: any = [];
  /**
   * view内部，绘制轨迹线路
   *
   * @param {Array} data 轨迹数据 可选
   * @param {number} starttime 时间区间起点 可选
   * @param {number} endtime 时间区间终点 可选
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
    for (let i = 0; i < data.length; i+=1) {
      const tempPoint = new this.BMap.Point(data[i].lng, data[i].lat);
      tempPoint.speed = data[i].obdspeed ? data[i].obdspeed : data[i].gpsspeed;
      tempPoint.uTCTime = data[i].uTCTime;
      tempPoint.printSpeed = commonfun.getSpeed(data[i].speed);
      tempPoint.lnglat = `${data[i].lng.toFixed(2)},${data[i].lat.toFixed(2)}`;
      totalPoints.push(tempPoint);
    }
    if (that.first) {
      this.SMap.setViewport(totalPoints, { margins: [20, 0, 0, 20] });
    }
    function updateBack() {
      const nextArray = [];
      const ctx = self.canvasLayerBack.canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (totalPoints.length !== 0) {
        for (let i = 0, len = totalPoints.length; i < len - 1; i += 1) {
          const pixel = self.SMap.pointToPixel(totalPoints[i]);
          const nextPixel = self.SMap.pointToPixel(totalPoints[i + 1]);
          ctx.beginPath();
          ctx.moveTo(pixel.x, pixel.y);
          ctx.lineWidth = 8;
          ctx.strokeStyle = '#8b8b89';
          ctx.lineTo(nextPixel.x, nextPixel.y);
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }
    }
    function update() {
      const ctx = self.canvasLayer.canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (totalPoints.length !== 0) {
        // 绘制带速度颜色的轨迹
        for (let i = 0, len = totalPoints.length; i < len -2; i+=1) {
          const pixel = self.SMap.pointToPixel(totalPoints[i]);
          const nextPixel = self.SMap.pointToPixel(totalPoints[i + 1]);
          ctx.beginPath();
          ctx.moveTo(pixel.x, pixel.y);
          ctx.lineCap = 'round';
          ctx.lineWidth = 6;
          const grd = ctx.createLinearGradient(pixel.x, pixel.y, nextPixel.x, nextPixel.y);
          const { speed } = totalPoints[i];
          const speedNext = totalPoints[i + 1].speed;
          grd.addColorStop(0, self.getColorBySpeed(speed));
          grd.addColorStop(1, self.getColorBySpeed(speedNext));
          ctx.strokeStyle = grd;
          ctx.lineTo(nextPixel.x, nextPixel.y);
          ctx.stroke();
        }
      }
    }
    function updatePointer() {
      const ctx = self.CanvasLayerPointer.canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (totalPoints.length !== 0) {
        const lineObj = {};
        let pixelPart = 0;
        const pixelPartUnit = 40;
        for (let i = 0, len = totalPoints.length; i < len - 1; i += 1) {
          const pixel = self.SMap.pointToPixel(totalPoints[i]);
          const nextPixel = self.SMap.pointToPixel(totalPoints[i + 1]);
          pixelPart += (((nextPixel.x - pixel.x) ** 2) + ((nextPixel.y - pixel.y) ** 2)) ** 0.5;
          if (pixelPart <= pixelPartUnit) {
            // continue;
          }
          pixelPart = 0;
          ctx.beginPath();
          // 根据渲染像素距离渲染箭头
          if (Math.abs(nextPixel.x - pixel.x) > 10 || Math.abs(nextPixel.y - pixel.y) > 10) {
            // 箭头一共需要5个点：起点、终点、中心点、箭头端点1、箭头端点2

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
    if (totalPoints.length > 0) {
      if (this.canvasLayer || this.canvasLayerBack || this.CanvasLayerPointer) {
        this.SMap.removeOverlay(this.CanvasLayerPointer);
        this.SMap.removeOverlay(this.canvasLayer);
        this.SMap.removeOverlay(this.canvasLayerBack);
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
    }
    const options = {
      size: window.BMAP_POINT_SIZE_HUGE,
      shape: window.BMAP_POINT_SHAPE_CIRCLE,
      color: 'rgba(0, 0, 0, 0)',
    };
    // 初始化PointCollection
    this.pointCollection = new this.BMap.PointCollection(totalPoints, options);
    this.pointCollection.addEventListener('click', (e: any) => {
      this.mapContorl.showTrackInfoBox({
        ...e.point,
        plateNum: this.plateNum,
        status: e.point.printSpeed,
      });
    });
    // 添加Overlay
    this.SMap.addOverlay(this.pointCollection);
  }

  getColorBySpeed = (speed: number) => {
    let color = '';
    let red: string | number = 0;
    let green: string | number = 0;
    let blue: string | number = 0;
    speed = speed > 100 ? 100 : speed;
    switch (Math.floor(speed / 25)) {
      case 0:
        red = 187;
        green = 0;
        blue = 0;
        break;
      case 1:
        speed -= 25;
        red = 187 + Math.ceil(((241 - 187) / 25) * speed);
        green = 0 + Math.ceil(((48 - 0) / 25) * speed);
        blue = 0 + Math.ceil(((48 - 0) / 25) * speed);
        break;
      case 2:
        speed -= 50;
        red = 241 + Math.ceil(((255 - 241) / 25) * speed);
        green = 48 + Math.ceil(((200 - 48) / 25) * speed);
        blue = 48 + Math.ceil(((0 - 48) / 25) * speed);
        break;
      case 3:
        speed -= 75;
        red = 255 + Math.ceil(((22 - 255) / 25) * speed);
        green = 200 + Math.ceil(((191 - 200) / 25) * speed);
        blue = 0 + Math.ceil(((43 - 0) / 25) * speed);
        break;
      case 4:
        red = 22;
        green = 191;
        blue = 43;
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

  timeChnage(val : string) {
    console.log(val);
  }

  // 增加zoom
  zoomAdd() : any {
    this.SMapZoom += 1;
  }
  // 减少zoom
  zoomReduce() : any {
    this.SMapZoom -= 1;
  }
  // 表格显示隐藏
  showTable() : void {
    this.locChange = true;
  }
  hideTable() : void {
    this.locChange = false;
  }
  plateNum = '';
  // 表格单选
  currentChange(val: any) {
    this.plateNum = val.plateNum;
    tripGPS({ id: val.id }).then((res) => {
      if (res.result.resultCode === '0') {
        let data = res.entity;
        data = data.map((item: any, index: number) => {
          const point = coordTrasns.transToBaidu(item, 'gcj02ll');
          item.lat = point.lat;
          item.lng = point.lng;
          return item;
        });
        this.currentTrackData = data;
        this.trackView(data);
      }
    });
  }
  render() {
    return (
      <div class="trajectory-wrap">
        <div id="map"></div>
        <div
          class={[
          'loc-change-box', this.locChange
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
                class="up btn"
                size="small"
                type="primary"
                icon="el-icon-arrow-up"
                on-click={this.showTable}></el-button>
            : <el-button
              class="down btn"
              size="small"
              type="primary"
              icon="el-icon-arrow-down"
              on-click={this.hideTable}></el-button>
}
        </div>
        <div
          class={[
          'car-table', this.locChange
            ? 'table-active'
            : '',
        ]}>
          <filter-table
            class="map-table"
            filter-list={this.filterList}
            filter-grade={[]}
            filter-params={this.filterParams}
            back-params={this.backParams}
            add-btn={false}
            out-params={this.outParams}
            highlight-current-row={true}
            on-currentChange={this.currentChange}
            export-btn={true}
            table-list={this.tableList}
            url={this.tableUrl}
            opreat-width="150px"></filter-table>
        </div>
      </div>
    );
  }
}
