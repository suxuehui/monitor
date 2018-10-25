import { Component, Vue, Emit } from 'vue-property-decorator';
import { Input, Button, Form, Tag, Autocomplete, Dialog, FormItem, Cascader, Tooltip } from 'element-ui';
import { tableList, Opreat, FilterFormList, MapCarData } from '@/interface';
import { vehicleInfo, vehicleRadiusQuery, vehicleDelete, vehicleUpdate, controlCar } from '@/api/monitor';
import { gpsToAddress, queryAddress, orgTree } from '@/api/app';
import qs from 'qs';
import { allList } from '@/api/model';
import config from '@/utils';
import CoordTrasns from '@/utils/coordTrasns';
import EditModel from './components/EditModel';
import './index.less';
import '../../../styles/var.less';

// 车子图片
const carIcon = require('@/assets/car.png');
const pointIcon = require('@/assets/point.png');
@Component({
  components: {
  'el-input': Input,
  'el-button': Button,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-tag': Tag,
  'el-autocomplete': Autocomplete,
  'el-dialog': Dialog,
  'el-tooltip': Tooltip,
  'el-cascader': Cascader,
  'edit-model': EditModel,
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
    data: 'entity.data',
    total: 'entity.count',
  };
  outParams: any = {
    brandId: '',
    seriesId: '',
    modelId: '',
  }
  // data
  filterList: FilterFormList[] = [
    {
      key: 'levelCode',
      type: 'levelcode',
      label: '所属门店',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
      placeholder: '请选择门店',
      options: [],
    },
    {
      key: 'brandModelArr',
      type: 'cascader',
      label: '品牌车型',
      placeholder: '品牌车型',
      options: [],
      props: {
        value: 'id',
        children: 'children',
        label: 'name',
      },
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
      key: 'online',
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
      label: '品牌车系',
      prop: 'brandName',
      formatter: this.brandChange,
    },
    {
      label: '能源类型',
      prop: 'energyType',
      formatter: this.formatEnergy,
    },
    {
      label: '剩余油量',
      prop: 'leftOil',
      sortable: true,
      sortBy: 'leftOil',
      formatter: (row: any) => this.changeStatus(row.leftOil, 'L'),
    },
    {
      label: '剩余电量',
      prop: 'leftElectricPercent',
      sortable: true,
      sortBy: 'leftElectricPercent',
      formatter: (row: any) => this.changeStatus(row.leftElectricPercent, '%'),
    },
    {
      label: '续航里程',
      prop: 'leftMileage',
      sortable: true,
      sortBy: 'leftMileage',
      formatter: (row: any) => this.changeStatus(row.leftMileage, 'km'),
    },
    {
      label: '累计里程',
      prop: 'totalMileage',
      sortable: true,
      sortBy: 'totalMileage',
      formatter: (row: any) => this.changeStatus(row.totalMileage, 'km'),
    },
    {
      label: '电瓶电压',
      prop: 'voltage',
      sortable: true,
      sortBy: 'voltage',
      formatter: (row: any) => this.changeStatus(row.voltage, 'V'),
    },
    {
      label: '无位置变化',
      prop: 'minutes',
      sortable: true,
      sortBy: 'minutes',
      formatter: this.changeMinutes,
    },
    {
      label: '网络状态',
      prop: 'online',
      formatter: this.onlineFormat,
    },
  ];
  changeMinutes(row: any) {
    const str: string = this.timeChange(row);
    return row.minutes !== null ?
      <el-tooltip class="item" effect="dark" content={str} placement="top">
        <span>{str}</span>
      </el-tooltip> : '--';
  }

  // 时间格式转换
  timeChange(row: any) {
    const day: any = row.minutes / 60 / 24;
    const hour: any = (row.minutes / 60) % 24;
    const min: any = row.minutes % 60;
    const str = `${parseInt(day, 10)}天${parseInt(hour, 10)}小时${parseInt(min, 10)}分钟`;
    return str;
  }

  brandChange(row: any) {
    const str = `${row.brandName}--${row.seriesName}--${row.modelName}`;
    return row.brandName ?
      <el-tooltip class="item" effect="dark" content={str} placement="top">
        <div>
          <p>{str}</p>
        </div>
      </el-tooltip> : '--';
  }

  changeStatus(data: any, unit: string) {
    return data > 0 ? data + unit : '--';
  }
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
      msg: '确定删除？',
      roles: true,
    },
  ];
  tableUrl: string = '/vehicle/monitor/list'; // 表格请求地址
  BMap: any = null; // 百度地图对象
  BMapLib: any = null; // 百度地图lib对象
  SMap: any = null; // 当前地图对象实例
  SMapZoom: number = 15; // 当前地图对象zoom
  CarPoint: any = null; // 车辆位置
  CarIcon: any = null; // 车辆图标
  CarMarker: object[] = []; // 车辆标记
  markerClusterer: any = null; // 标记集合
  CarMarkerPos: number = 1; // 车辆坐标
  address: string = '';
  detailShow: boolean = false; // 车辆详情展示
  carDetail: any = {}; // 车辆详情数据
  locChange: boolean = false; // 底部表格开关
  carDetailArr: any = [
    { label: '卫星星数:', prop: 'star', unit: '颗' },
    { label: '网络质量:', prop: 'gsm', unit: '' },
    { label: 'ACC状态:', prop: 'acc' },
    { label: '引擎状态:', prop: 'engine' },
    { label: '排挡档位:', prop: 'gear', unit: '档' },
    { label: '电瓶电压:', prop: 'voltage', unit: 'V' },
    { label: '剩余油量:', prop: 'leftOil', unit: 'L' },
    { label: '剩余电量:', prop: 'leftElectricPercent', unit: '%' },
    { label: '累计里程:', prop: 'totalMileage', unit: 'km' },
    { label: '续航里程:', prop: 'leftMileage', unit: 'km' },
    { label: '设防状态:', prop: 'defenceStatus', unit: 'defenceStatus' },
    { label: '充电状态:', prop: 'chargeLight' },
    { label: '车灯状态:', prop: 'allLight' },
    { label: '天窗状态:', prop: 'skyWindow' },
    { label: '引擎盖:', prop: 'hood' },
    { label: '后备箱:', prop: 'trunk' },
    { label: '左前车门:', prop: 'leftFrontDoor', unit: 'leftFrontLock' },
    { label: '右前车门:', prop: 'rightFrontDoor', unit: 'rightFrontLock' },
    { label: '左后车门:', prop: 'leftRearDoor', unit: 'leftRearLock' },
    { label: '右后车门:', prop: 'rightRearDoor', unit: 'rightRearLock' },
    { label: '左前车窗:', prop: 'leftFrontWindow' },
    { label: '右前车窗:', prop: 'rightFrontWindow' },
    { label: '左后车窗:', prop: 'leftRearWindow' },
    { label: '右后车窗:', prop: 'rightRearWindow' },
  ];
  geolocationControl: any = null; // 定位
  mapCenter: { lat: number, lng: number } = { lat: 29.563694, lng: 106.560421 };
  // 地图查询半径
  radius: number = 5000;
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
          this.markerClusterer = new this.BMapLib.MarkerClusterer(this.SMap, {
            markers: this.CarMarker,
          });
        });
      });
    });
    allList(null).then((res) => {
      if (res.result.resultCode === '0') {
        this.filterList[1].options = res.entity;
        this.brandList = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    orgTree(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.unshift({
          id: Math.random(),
          levelCode: '',
          orgName: '全部',
        });
        this.filterList[0].options = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  clearOutParams() {
    this.outParams = {
      brandId: '',
      seriesId: '',
      modelId: '',
    };
  }

  radiusGetData = (id?: string) => {
    // 获取地图车辆
    vehicleRadiusQuery({ radius: this.radius, ...this.mapCenter }).then((res) => {
      if (res.result.resultCode === '0') {
        if (res.entity) {
          this.initMap(res.entity, id);
        }
      }
    });
  }
  // 初始化渲染地图车辆
  initMap = (list: MapCarData[], id?: string) => {
    this.CarMarker = [];
    if (this.markerClusterer) {
      this.markerClusterer.clearMarkers(this.CarMarker);
    }
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
    this.markerClusterer.addMarkers(this.CarMarker);
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
        // 如果车辆坐标为空-位置为未知
        if (res.entity.lat && res.entity.lng) {
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
              this.detailShow = true;
            }
          });
        } else {
          carDetail = {
            address: '未知位置',
            ...res.entity,
          };
          this.carDetail = carDetail;
          this.detailShow = true;
        }
      } else {
        this.$message.error(res.result.resultMessage || '未知错误');
      }
    });
  }
  // online
  onlineFormat(row: any) {
    if (row.online) {
      return <el-tag size="small" type="success">在线</el-tag>;
    } else if (row.online === null) {
      return <el-tag size="small" type="info">未知</el-tag>;
    }
    return <el-tag size="small" type="danger">离线</el-tag>;
  }
  // 获取车系/车型
  selectBrandModel(value: string[]) {
    this.outParams.brandId = value[0] ? value[0] : '';
    this.outParams.seriesId = value[1] ? value[1] : '';
    this.outParams.modelId = value[2] ? value[2] : '';
  }

  // 格式化能源类型
  formatEnergy(row: any) {
    let type;
    switch (row.energyType) {
      case '燃油':
        type = <el-tag size="small" type="warning">燃油</el-tag>;
        break;
      case '电动':
        type = <el-tag size="small" type="success">电动</el-tag>;
        break;
      case '混动':
        type = <el-tag size="small" >混动</el-tag>;
        break;
      default:
        type = <el-tag size="small" type="info">未知</el-tag>;
        break;
    }
    return type;
  }

  // 清除覆盖物
  clear = () => {
    this.SMap.clearOverlays();
  }

  // 刷新
  refresh(): void {
    // 详情
    if (this.currentCarId !== 0) {
      this.getCarDetail(`${this.currentCarId}`);
    }
    // 根据该车坐标查车,按id匹配信息
    this.radiusGetData(`${this.currentCarId}`);
    // 刷新table
    const MapTable: any = this.$refs.mapTable;
    MapTable.reloadTable();
  }

  // 关闭详情
  cancel(): any {
    this.detailShow = false;
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

  // 到当前定位
  nowMk: any = '';
  nowPosition: any = {};
  setCenter = () => {
    // 创建查询对象
    const geolocation = new this.BMap.Geolocation();
    if (this.nowPosition.lat) {
      this.SMap.addOverlay(this.nowMk);
      this.SMap.panTo(this.nowPosition, { noAnimation: false });
    } else {
      geolocation.getCurrentPosition((r: any) => {
        if (geolocation.getStatus() === 0) {
          this.nowMk = new this.BMap.Marker(r.point);
          this.nowPosition = r.point;
          this.SMap.addOverlay(this.nowMk);
          this.SMap.panTo(this.nowPosition.lat ? this.nowPosition : r.point);
        } else {
          this.$message.error('定位失败');
        }
      });
    }
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
        this.editVisible = true;
        this.editData = {
          id: row.id,
          vin: row.vin,
          plateNum: row.plateNum,
          carCode: row.carCode.split('/'),
        };
        break;
      case 'delete':
        vehicleDelete({
          id: row.id,
        }).then((res) => {
          if (res.result.resultCode === '0') {
            this.$message.success(res.result.resultMessage);
            this.reloadTable('delete');
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

  // 新增、导出按钮展示
  exportBtn: boolean = true;
  controlBtn: boolean = true;

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/vehicle/monitor/edit',
      '/device/trip/list',
      '/vehicle/monitor/delete',
      '/vehicle/monitor/control',
      '/vehicle/monitor/export',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.opreat[0].roles = !!(res[0]);
      this.opreat[2].roles = !!(res[1]);
      this.opreat[3].roles = !!(res[2]);
      this.controlBtn = !!(res[3]);
      this.exportBtn = !!(res[4]);
    });
  }

  reloadTable(key: string) {
    const MapTable: any = this.$refs.mapTable;
    MapTable.reloadTable(key);
  }

  renderStatus(value: boolean | string | number, data: any, unit?: any) {
    const gettype = Object.prototype.toString;
    // 油量%
    if (unit === 'L' && typeof value === 'number' && typeof data.fuelTankCap === 'number') {
      const num = value ? value + unit : '未知';
      let num2: string = '未知';
      const str = (value / data.fuelTankCap) * 100;
      if (data.fuelTankCap !== 0) {
        num2 = value ? `${str.toFixed(2)}%` : '未知';
      }
      return `${num2} (${num})`;
    }
    if (unit === 'leftFrontLock') {
      return this.setDoorStatus(data.leftFrontDoor, data.leftFrontLock);
    } else if (unit === 'rightFrontLock') {
      return this.setDoorStatus(data.rightFrontDoor, data.rightFrontLock);
    } else if (unit === 'leftRearLock') {
      return this.setDoorStatus(data.leftRearDoor, data.leftRearLock);
    } else if (unit === 'rightRearLock') {
      return this.setDoorStatus(data.rightRearDoor, data.rightRearLock);
    } else if (unit === 'defenceStatus') {
      return data.defenceStatus ? '已设防' : '已撤防';
    }
    switch (gettype.call(value)) {
      case '[object Boolean]':
        return value ? '开启' : '关闭';
      case '[object String]':
        return value ? value + unit : value;
      case '[object Number]':
        return unit ? value + unit : value;
      case '[object Null]':
        return '未知';
      default:
        return value;
    }
  }

  // 车门关闭、锁状态
  setDoorStatus(doorStatus: boolean, lockStatus: boolean) {
    const str1 = doorStatus ? '开启' : '关闭';
    const str2 = lockStatus ? '已上锁' : '未上锁';
    return `${str1}；${str2}`;
  }

  currentCarId: number = 0;

  setCarId(val: number) {
    this.currentCarId = val;
  }

  // 单击表格-选择车辆
  currentChange = (val: any) => {
    if (val) {
      this.setCarId(val.id);
      if (val.lat && val.lng) {
        this.currentCarId = val.id;
        this.mapCenter = {
          lat: val.lat,
          lng: val.lng,
        };
        this.SMap.centerAndZoom(new this.BMap.Point(this.mapCenter.lng, this.mapCenter.lat), 15);
        this.radiusGetData(val.id);
        this.getCarDetail(val.id);
      } else {
        this.$message.error('车辆暂无定位');
        this.radiusGetData(val.id);
      }
    }
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
    // 添加坐标
    const PT = new this.BMap.Point(val.lng, val.lat);
    const marker = new this.BMap.Marker(
      PT,
      {
        icon: new this.BMap.Icon(pointIcon, new this.BMap.Size(28, 40)),
      },
    );
    this.SMap.clearOverlays();
    this.SMap.addOverlay(marker); // 创建标注
  }
  // 编辑开关
  editVisible: boolean = false;
  editData: any = {};

  // 关闭编辑
  closeEdit() {
    this.editVisible = false;
  }

  brandList: any = [];

  // 关闭弹窗
  closeModal(): void {
    this.editVisible = false;
    const editBlock: any = this.$refs.editTable;
    setTimeout(() => {
      editBlock.resetData();
    }, 200);
  }
  // 关闭弹窗时刷新
  reFresh(): void {
    const FromTable: any = this.$refs.mapTable;
    FromTable.reloadTable();
    this.closeModal();
  }

  controlLoading: boolean[] = [false, false, false, false, false, false, false]
  // 车辆控制
  controlCar(type: string, index: number): void {
    this.controlLoading[index] = true;
    controlCar({ imei: this.carDetail.otuImei, cmd: type }).then((res: any) => {
      this.controlLoading[index] = false;
      if (res.result.resultCode === '0') {
        this.getCarDetail(this.carDetail.id);
        this.$message.success(res.result.resultMessage);
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }
  downLoad(data: any) {
    const data1 = qs.stringify(data);
    console.log('导出车辆监控');
  }

  render() {
    const { carDetail } = this;
    return (
      <div class="monitor-wrap">
        <div id="map"></div>
        <div class="loc-search-box">
          <el-autocomplete size="small" placeholder="搜索地点" prefix-icon="el-icon-location" v-model={this.address} fetch-suggestions={this.searchAddress} on-select={this.setAddress}>
          </el-autocomplete>
          <el-button class="restore" size="small" id="reload" type="primary" icon="el-icon-refresh" on-click={this.refresh}></el-button>
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
          {
            this.controlBtn ?
              <div class="car-control">
                <div class="left">
                  <el-button class="fire" size="mini" on-click={(e: any) => this.controlCar('CMD_START', 0)}>点火</el-button>
                  <el-button class="unfire" size="mini" on-click={(e: any) => this.controlCar('CMD_STOP', 1)}>熄火</el-button>
                </div>
                <div class="right">
                  <el-button class="lock" type="text" size="mini" on-click={(e: any) => this.controlCar('CMD_SET_DEFENCE', 2)}>设防</el-button>
                  <el-button class="lock" type="text" size="mini" on-click={(e: any) => this.controlCar('CMD_CANCEl_DEFENCE', 3)}>撤防</el-button>
                  <el-button class="lock" type="text" icon="iconfont-lock" size="mini" on-click={(e: any) => this.controlCar('CMD_LOCK', 4)}>上锁</el-button>
                  <el-button class="unlock" type="text" icon="iconfont-unlock" size="mini" on-click={(e: any) => this.controlCar('CMD_UNLOCK', 5)}>解锁</el-button>
                  {/* <el-button
                    class="find"
                    type="text"
                    icon="iconfont-wifi"
                    loading={this.controlLoading[6]}
                    size="mini"
                    on-click={(e: any) => this.controlCar('CMD_CALL', 6)}>
                    寻车
                  </el-button> */}
                  <el-button class="find" type="text" icon="iconfont-wifi" size="mini" on-click={(e: any) => this.controlCar('CMD_CALL', 6)}>寻车</el-button>
                </div>
              </div> : null
          }
          <div class="car-address">
            <div class="loc">
              <i class="iconfont-location icon"></i>
              <span>{carDetail.address}</span>
            </div>
            <div class="time">
              <i class="iconfont-time-circle icon"></i>
              <span>
                {new Date(carDetail.gpsTime).Format('yyyy-MM-dd hh:mm:ss')}
              </span>
              <span class="status">
                ({carDetail.minutes ? this.timeChange(carDetail) : ''}无位置变化)
              </span>
            </div>
          </div>
          <div class="car-detail clearfix">
            <ul class="line">
              {
                this.carDetailArr.map((item: any) => <li class="item">
                  <span class="label">{item.label}</span>
                  <span class="val">{this.renderStatus(carDetail[item.prop], carDetail, item.unit)}</span>
                </li>)
              }
            </ul>
          </div>
        </div>
        <div class={['car-table', this.locChange ? 'table-active' : '']}>
          <div class='loc-change-box'>
            <el-button class="loc btn" size="small" icon="el-icon-location" on-click={this.setCenter}></el-button>
            <el-button class="add btn" size="small" icon="el-icon-plus" on-click={this.zoomAdd}></el-button>
            <el-button class="less btn" size="small" icon="el-icon-minus" on-click={this.zoomReduce}></el-button>
            {!this.locChange ?
              <el-button class="up btn" size="small" type="primary" icon="el-icon-arrow-up" on-click={this.showTable}></el-button> :
              <el-button class="down btn" size="small" type="primary" icon="el-icon-arrow-down" on-click={this.hideTable}></el-button>
            }
          </div>
          <filter-table
            ref="mapTable"
            class="mapTable"
            filter-list={this.filterList}
            filter-grade={[]}
            filter-params={this.filterParams}
            back-params={this.backParams}
            add-btn={false}
            data-type={'JSON'}
            on-clearOutParams={this.clearOutParams}
            out-params={this.outParams}
            highlight-current-row={true}
            on-currentChange={this.currentChange}
            export-btn={this.exportBtn}
            on-downBack={this.downLoad}
            localName={'monitor'}
            on-menuClick={this.menuClick}
            table-list={this.tableList}
            default-page-size={5}
            url={this.tableUrl}
            opreat={this.opreat}
            opreat-width="150px"
          >
          </filter-table>
        </div>
        <edit-model
          ref="editTable"
          data={this.editData}
          visible={this.editVisible}
          on-close={this.closeModal}
          on-refresh={this.reFresh}
        ></edit-model>
      </div>
    );
  }
}
