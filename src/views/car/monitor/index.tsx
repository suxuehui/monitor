import { Component, Vue, Emit } from 'vue-property-decorator';
import { Input, Button, Form, Tag, Autocomplete, Dialog, FormItem } from 'element-ui';
import { tableList, Opreat, FilterFormList, MapCarData } from '@/interface';
import { vehicleInfo, vehicleRadiusQuery, vehicleDelete } from '@/api/monitor';
import { vehicleModelUpdate } from '@/api/car';
import { gpsToAddress, queryAddress } from '@/api/app';
import config from '@/utils';
import CoordTrasns from '@/utils/coordTrasns';
import './index.less';
import '../../../styles/var.less';

// 车子图片
const carIcon = require('@/assets/car.png');
@Component({
  components: {
  'el-input': Input,
  'el-button': Button,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-tag': Tag,
  'el-autocomplete': Autocomplete,
  'el-dialog': Dialog,
  }
  })
export default class Monitor extends Vue {
  filterParams: object = {
    levelCodeArr: [],
    brandModelArr: [],
    levelCode: '',
    energyType: '',
    onliine: '',
    noMoveTime: '',
  };
  backParams: object = {
    code: 'result.resultCode',
    codeOK: '0',
    message: 'result.resultMessage',
    data: 'entity',
    total: 'count',
  };
  outParams: object = {
    brandId: '',
    modelId: '',
  }
  // data
  filterList: FilterFormList[] = [
    {
      key: 'levelcode',
      type: 'levelcode',
      label: '所属门店',
      placeholder: '请选择门店',
      options: [],
    },
    {
      key: 'brandModelArr',
      type: 'cascader',
      label: '品牌车型',
      placeholder: '品牌车型',
      options: [],
      change: this.selectBrandModel,
    },
    {
      key: 'energyType',
      type: 'select',
      label: '能源类型',
      placeholder: '能源类型',
      options: [
        {
          value: '',
          label: '能源类型（全部）',
        },
        {
          value: '1',
          label: '燃油',
        },
        {
          value: '2',
          label: '电动',
        },
        {
          value: '3',
          label: '混动',
        },
      ],
    },
    {
      key: 'onliine',
      type: 'select',
      label: '车辆状态',
      placeholder: '车辆状态',
      options: [
        {
          value: '',
          label: '车辆状态（全部）',
        },
        {
          value: 'true',
          label: '在线',
        },
        {
          value: 'false',
          label: '离线',
        },
      ],
    },
    {
      key: 'noMoveTime',
      type: 'select',
      label: '无位置变化',
      placeholder: '无位置变化',
      options: [
        {
          value: '',
          label: '无位置变化（全部）',
        },
        {
          value: `${12 * 60}`,
          label: '12时以上',
        },
        {
          value: `${24 * 60}`,
          label: '1天以上',
        },
        {
          value: `${48 * 60}`,
          label: '2天以上',
        },
        {
          value: `${72 * 60}`,
          label: '3天以上',
        },
        {
          value: `${96 * 60}`,
          label: '4天以上',
        },
        {
          value: `${120 * 60}`,
          label: '5天以上',
        },
        {
          value: `${144 * 60}`,
          label: '6天以上',
        },
        {
          value: `${168 * 60}`,
          label: '7天以上',
        },
        {
          value: `${192 * 60}`,
          label: '8天以上',
        },
        {
          value: `${216 * 60}`,
          label: '9天以上',
        },
        {
          value: `${240 * 60}`,
          label: '10天以上',
        },
      ],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '车牌/车架/imei号',
      placeholder: '车牌/车架/imei号',
    },
  ];
  tableList: tableList[] = [
    {
      label: '所属商户',
      prop: 'orgName',
    },
    {
      label: '车牌号',
      prop: 'plateNum',
    },
    {
      label: '车架号',
      prop: 'vin',
    },
    {
      label: 'imei号(OTU)',
      prop: 'otuImei',
    },
    {
      label: '品牌车型',
      prop: 'brandName',
    },
    {
      label: '能源类型',
      prop: 'energyType',
      formatter: this.formatEnergy,
    },
    {
      label: '剩余油量',
      prop: 'leftOil',
      formatter(row: any) {
        return `${row.leftOil}%`;
      },
    },
    {
      label: '剩余电量',
      prop: 'leftElectricPercent',
      formatter(row: any) {
        return `${row.leftElectricPercent}%`;
      },
    },
    {
      label: '续航里程',
      prop: 'leftMileage',
      formatter(row: any) {
        return `${row.leftMileage}km`;
      },
    },
    {
      label: '累计里程',
      prop: 'totalMileage',
      formatter(row: any) {
        return `${row.totalMileage}km`;
      },
    },
    {
      label: '电瓶电压',
      prop: 'voltage',
      formatter(row: any) {
        return `${row.voltage}V`;
      },
    },
    {
      label: '无位置变化',
      prop: 'minutes',
      formatter(row: any) {
        return `${row.minutes}分钟`;
      },
    },
    {
      label: '网络状态',
      prop: 'online',
      formatter: this.onlineFormat,
    },
  ];
  opreat: Opreat[] = [
    {
      key: 'edit',
      rowKey: 'vin',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'tracking',
      rowKey: 'vin',
      color: 'blue',
      text: '追踪',
      roles: true,
    },
    {
      key: 'trip',
      rowKey: 'vin',
      color: 'blue',
      text: '轨迹',
      roles: true,
    },
    {
      key: 'delete',
      rowKey: 'vin',
      color: 'red',
      text: '删除',
      roles: true,
    },
  ];
  tableUrl: string = '/device/vehicle/list'; // 表格请求地址
  BMap: any = null; // 百度地图对象
  BMapLib: any = null; // 百度地图lib对象
  SMap: any = null; // 当前地图对象实例
  SMapZoom: number = 15; // 当前地图对象zoom
  CarPoint: any = null; // 车辆位置
  CarIcon: any = null; // 车辆图标
  CarMarker: object[] = []; // 车辆标记
  markerClusterer: object = {}; // 标记集合
  CarMarkerPos: number = 1; // 车辆坐标
  address: string = '';
  detailShow: boolean = false; // 车辆详情展示
  carDetail: any = {}; // 车辆详情数据
  locChange: boolean = false; // 底部表格开关
  carDetailArr: any = [
    { label: '卫星星数:', prop: 'star', unit: '' },
    { label: '网络质量:', prop: 'gsm', unit: '' },
    { label: 'ACC状态:', prop: 'acc' },
    { label: '引擎状态:', prop: 'engine' },
    { label: '排挡档位:', prop: 'gear', unit: '' },
    { label: '电瓶电压:', prop: 'voltage', unit: 'V' },
    { label: '剩余油量:', prop: 'leftOil', unit: 'L' },
    { label: '剩余电量:', prop: 'leftElectricPercent', unit: '%' },
    { label: '累计里程:', prop: 'totalMileage', unit: 'km' },
    { label: '续航里程:', prop: 'leftMileage', unit: 'km' },
    { label: '总灯状态:', prop: 'allLight' },
    { label: '大灯状态:', prop: 'bigLight' },
    { label: '小灯状态:', prop: 'smallLight' },
    { label: '充电状态:', prop: 'chargeLight' },
    { label: '引擎盖:', prop: 'hood' },
    { label: '后备箱:', prop: 'trunk' },
    { label: '左前车门:', prop: 'leftFrontDoor' },
    { label: '右前车门:', prop: 'rightFrontDoor' },
    { label: '左后车门:', prop: 'leftRearDoor' },
    { label: '右后车门:', prop: 'rightRearDoor' },
    { label: '左前车窗:', prop: 'leftFrontWindow' },
    { label: '右前车窗:', prop: 'rightFrontWindow' },
    { label: '左后车窗:', prop: 'leftRearWindow' },
    { label: '右后车窗:', prop: 'rightRearWindow' },
  ];
  geolocationControl: any = null; // 定位
  mapCenter: { lat: number, lng: number } = { lat: 29.563694, lng: 106.560421 };
  // 地图查询半径
  radius: number = 1000;
  mapCarData: MapCarData[] = [];
  constructor(props: any) {
    super(props);
    config.loadMap().then((BMap: any) => {
      this.BMap = BMap;
      this.SMap = new BMap.Map('map', { enableMapClick: false });
      this.SMap.setMapStyle({
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
        console.log(1);
      });
      this.SMap.enableScrollWheelZoom(true);
      // 创建新的图标
      this.CarIcon = new BMap.Icon(carIcon, new BMap.Size(20, 40));
      config.loadMapTextIcon().then(() => {
        config.loadMapLib().then((BMapLib: any) => {
          this.BMapLib = BMapLib;
          this.radiusGetData();
        });
      });
      // this.CarMarkerPos = this.CarMarker.getPosition();
    });
  }
  radiusGetData = (id?: string) => {
    // 获取地图车辆
    vehicleRadiusQuery({ radius: this.radius, ...this.mapCenter }).then((res) => {
      if (res.result.resultCode === '0') {
        this.initMap(res.entity, id);
      }
    });
  }
  // 初始化渲染地图车辆
  initMap = (list: MapCarData[], id?: string) => {
    list.forEach((item: MapCarData, index: number) => {
      // 如果有id传入，代表表格单选事件，默认打开当前车辆信息窗口
      if (id === item.id) {
        this.openMsg(item);
      }
      const point = CoordTrasns.transToBaidu(
        {
          lat: item.lat,
          lng: item.lng,
        },
        item.coordinateSystem,
      );
      const PT = new this.BMap.Point(point.lng, point.lat);
      const marker = new this.BMap.Marker(
        PT,
        {
          icon: this.CarIcon,
          rotation: item.direction,
        },
      );
      this.CarMarker.push(marker); // 创建标注
    });
    this.markerClusterer = new this.BMapLib.MarkerClusterer(this.SMap, { markers: this.CarMarker });
    this.mapCarData = list;
    // 循环给车辆图标添加点击事件
    this.CarMarker.forEach((item: any, index: number) => {
      item.addEventListener('click', () => {
        this.openMsg(this.mapCarData[index]);
        this.getCarDetail(this.mapCarData[index].id);
      });
    });
  }
  // 打开地图信息窗口
  openMsg = (data: any) => {
    const infoWindow = new this.BMap.InfoWindow(this.msgContent(data));
    const point = CoordTrasns.transToBaidu(
      {
        lat: data.lat,
        lng: data.lng,
      },
      data.coordinateSystem,
    );
    this.SMap.openInfoWindow(
      infoWindow,
      new this.BMap.Point(point.lng, point.lat),
    );
  }

  msgContent(content: any) {
    return `<div class="makerMsg">
      <h3 class="plateNum">车牌号：${content.plateNum}</h3>
      <ul class="msg clearfix">
        <li>
          <i class="icon iconfont-direction"></i>
          <span class="txt">${this.getDirection(content.direction)}</span>
        </li>
        <li>
          <i class="icon iconfont-speed"></i>
          <span class="txt">${content.speed}km/h</span>
        </li>
      </ul>
    </div>`;
  }

  getDirection(itm: number) {
    if (itm > 337.5 || itm <= 22.5) {
      return '北方';
    } else if (itm > 22.5 && itm <= 67.5) {
      return '东北方';
    } else if (itm > 67.5 && itm <= 112.5) {
      return '东方';
    } else if (itm > 112.5 && itm <= 157.5) {
      return '东南方';
    } else if (itm > 157.5 && itm <= 202.5) {
      return '南方';
    } else if (itm > 202.5 && itm <= 247.5) {
      return '西南方';
    } else if (itm > 247.5 && itm <= 292.5) {
      return '西方';
    } else if (itm > 292.5 && itm <= 337.5) {
      return '西北方';
    }
    return '未知';
  }

  // 获取车辆详情
  getCarDetail(id: string) {
    let carDetail: any = {};
    vehicleInfo({ id }).then((res) => {
      if (res.result.resultCode === '0') {
        gpsToAddress({
          lat: res.entity.lat,
          lng: res.entity.lng,
          coordinateSystem: res.entity.coordinateSystem,
        }).then((response: any) => {
          if (response.status === 0) {
            carDetail = {
              address: response.result.formatted_address + response.result.sematic_description,
              ...res.entity,
            };
            this.carDetail = carDetail;
          }
          this.detailShow = true;
        });
      }
    });
  }
  // online
  onlineFormat(row: any) {
    if (row.online) {
      return <el-tag size="small" type="success">在线</el-tag>;
    }
    return <el-tag size="small" type="danger">离线</el-tag>;
  }
  // 选择品牌车型
  selectBrandModel(value: string[]) {
    console.log(value);
  }
  // 格式化能源类型
  formatEnergy(row: any) {
    let type;
    switch (row.energyType) {
      case 1:
        type = <el-tag size="small" type="warning">燃油</el-tag>;
        break;
      case 2:
        type = <el-tag size="small" type="success">电动</el-tag>;
        break;
      case 3:
        type = <el-tag size="small" >混动</el-tag>;
        break;
      default:
        type = <el-tag size="small" type="info">未知</el-tag>;
        break;
    }
    return type;
  }

  // 地图搜索
  search(): void {
    console.log(this.address);
  }

  // 刷新
  refresh(): void {
  }

  // 关闭详情
  cancel(): any {
    this.detailShow = false;
  }

  // 增加zoom
  zoomAdd(): any {
    this.SMapZoom += 1;
  }
  // 减少zoom
  zoomReduce(): any {
    this.SMapZoom -= 1;
  }

  // 定位
  getLoc(e: any): any {
    console.log(e);
  }

  setCenter(): void {
  }

  // 表格显示隐藏
  showTable(): void {
    this.locChange = true;
  }
  hideTable(): void {
    this.locChange = false;
  }

  menuClick(key: string, row: any): void {
    switch (key) {
      case 'edit':
        this.editDialog = true;
        this.editForm = {
          id: row.id,
          plateNum: row.plateNum,
          vin: row.vin,
        };
        break;
      case 'delete':
        vehicleDelete(row.id).then((res) => {
          if (res.result.resultCode === '0') {
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
        break;
      case 'trip':
        this.$router.push({ name: '车辆轨迹', params: { id: row.id } });
        break;
      case 'tracking':
        this.$router.push({ name: '车辆追踪', params: { id: row.id } });
        break;
      default:
        break;
    }
  }

  renderStatus(value: boolean | string | number, unit?: string) {
    switch (typeof value) {
      case 'boolean':
        return value ? '开' : '关';
      case 'string':
        return value;
      case 'number':
        return unit ? value + unit : value;
      default:
        return value;
    }
  }

  currentChange = (val: any) => {
    this.mapCenter = {
      lat: val.lat,
      lng: val.lng,
    };
    this.SMap.centerAndZoom(new this.BMap.Point(this.mapCenter.lng, this.mapCenter.lat), 15);
    this.radiusGetData(val.id);
  }
  // 地址搜索
  searchAddress(val: string, cb: any) {
    queryAddress(val).then((res) => {
      if (res.status === 0) {
        const nameList: { value: any, lat: number, lng: number }[] = [];
        res.result.forEach((item: any, index: number) => {
          nameList.push({
            value: item.name,
            lat: item.location.lat,
            lng: item.location.lng,
          });
          cb(nameList);
        });
      }
    });
  }
  // 选择地址，跳转到相应位置，并查询周围车辆
  setAddress = (val: any) => {
    this.mapCenter = {
      lat: val.lat,
      lng: val.lng,
    };
    this.SMap.centerAndZoom(new this.BMap.Point(this.mapCenter.lng, this.mapCenter.lat), 15);
    this.radiusGetData();
  }
  // 编辑开关
  editDialog: boolean = false;

  // 关闭编辑
  closeEdit() {
    this.editDialog = false;
  }

  editForm: {
    plateNum: string,
    vin: string,
    id: number
  } = {
    plateNum: '',
    vin: '',
    id: 0,
  }
  editRules: any = {
    plateNum: [
      { required: true, message: '请输入活动名称', trigger: 'blur' },
    ],
    vin: [
      { required: true, message: '请选择活动区域', trigger: 'blur' },
    ],
  };

  updateCar() {
    (this.$refs.editForm as Form).validate((valid) => {
      if (valid) {
        vehicleModelUpdate(this.editForm).then((res) => {
          if (res.result.resultCode === '0') {
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
        return true;
      }
      return false;
    });
  }

  render() {
    const { carDetail } = this;
    return (
      <div class="monitor-wrap">
        <div id="map"></div>
        <div class="loc-search-box">
          <el-autocomplete size="small" placeholder="搜索地点" prefix-icon="el-icon-location" v-model={this.address} fetch-suggestions={this.searchAddress} on-select={this.setAddress}>
            <el-button slot="append" icon="el-icon-search" on-click={this.search}></el-button>
          </el-autocomplete>
          <el-button class="restore" size="small" id="reload" type="primary" icon="el-icon-refresh" on-click={this.refresh}></el-button>
        </div>
        <div class={['loc-change-box', this.locChange ? 'loc-active' : '']}>
          <el-button class="loc btn" size="small" icon="el-icon-location" on-click={this.setCenter}></el-button>
          <el-button class="add btn" size="small" icon="el-icon-plus" on-click={this.zoomAdd}></el-button>
          <el-button class="less btn" size="small" icon="el-icon-minus" on-click={this.zoomReduce}></el-button>
          {!this.locChange ?
            <el-button class="up btn" size="small" type="primary" icon="el-icon-arrow-up" on-click={this.showTable}></el-button> : <el-button class="down btn" size="small" type="primary" icon="el-icon-arrow-down" on-click={this.hideTable}></el-button>
          }
        </div>
        <div class={['car-detail-box', this.detailShow ? 'detail-active' : '', this.locChange ? '' : 'big']} >
          <i class="el-icon-close cancel" on-click={this.cancel} ></i>
          <div class="car-info">
            <div class="top">
              <span class="plateNumber">{carDetail.plateNum}</span>
              <span class="modelName">（{carDetail.brandName + carDetail.modelName}）</span>
            </div>
            <div class="center">
              <span class="brandName">{carDetail.orgName}</span>
              <span class="net">{carDetail.online ? '在线' : '离线'}</span>
            </div>
            <div class="bottom">
              <span>车架号：{carDetail.vin}</span>
              <span>imei号：{carDetail.otuImei}</span>
            </div>
          </div>
          <div class="car-control">
            <div class="left">
              <el-button class="fire" size="mini">点火</el-button>
              <el-button class="unfire" size="mini">熄火</el-button>
            </div>
            <div class="right">
              <el-button class="lock" type="text" icon="iconfont-lock" size="mini">上锁</el-button>
              <el-button class="unlock" type="text" icon="iconfont-unlock" size="mini">解锁</el-button>
              <el-button class="find" type="text" icon="iconfont-wifi" size="mini">寻车</el-button>
            </div>
          </div>
          <div class="car-address">
            <div class="loc">
              <i class="iconfont-location icon"></i>
              <span>{carDetail.address}</span>
            </div>
            <div class="time">
              <i class="iconfont-time-circle icon"></i>
              <span>
                {carDetail.gpsTime}
              </span>
              <span class="status">
                ({carDetail.minutes}分钟无位置变化)
              </span>
            </div>
          </div>
          <div class="car-detail clearfix">
            <ul class="line">
              {
                this.carDetailArr.map((item: any) => <li class="item">
                  <span class="label">{item.label}</span>
                  <span class="val">{this.renderStatus(carDetail[item.prop], item.unit)}</span>
                </li>)
              }
            </ul>
          </div>
        </div>
        <div class={['car-table', this.locChange ? 'table-active' : '']}>
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
            on-menuClick={this.menuClick}
            table-list={this.tableList}
            url={this.tableUrl}
            opreat={this.opreat}
            opreat-width="150px"
          >
          </filter-table>
        </div>
        <el-dialog
          title="编辑车辆"
          visible={this.editDialog}
          width="400px"
          before-close={this.closeEdit}
        >
          <el-form
            model={this.editForm}
            rules={this.editRules}
            ref="editForm"
            label-width="70px"
          >
            <el-form-item label="车牌号" prop="plateNum">
              <el-input v-model={this.editForm.plateNum}></el-input>
            </el-form-item>
            <el-form-item label="车架号" prop="vin">
              <el-input v-model={this.editForm.vin}></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button size="small" on-click={this.closeEdit}>取 消</el-button>
            <el-button size="small" type="primary" on-click={this.updateCar}>确 定</el-button>
          </div>
        </el-dialog>
      </div>
    );
  }
}
