import { Component, Vue } from 'vue-property-decorator';
import {
  Input, Button, Form, Tag, Autocomplete, Dialog, FormItem, Cascader, Tooltip, Card,
} from 'element-ui';
import {
  tableList, Opreat, FilterFormList, MapCarData,
} from '@/interface';
import {
  vehicleInfo, vehicleRadiusQuery, cmdList,
} from '@/api/monitor';
import {
  getBindStatusOptions, getFioQueryOptions, getSrcQueryOptions, findBindTerminalList,
} from '@/api/car';
import exportExcel from '@/api/export';
import { gpsToAddress, queryAddress, orgTree } from '@/api/app';
import qs from 'qs';
import utils from '@/utils';
import CoordTrasns from '@/utils/coordTrasns';
import EditModel from './components/EditModel';
import ControlModel from './components/ControlModel';
import BindModel from './components/BindModel';
import AddDeviceModel from './components/AddDeviceModel';
import MenuClickModel from './components/MenuClickModel';
import UnBindModel from './components/UnBindModel';
import './index.less';

// 车子图片
const carIcon = require('@/assets/car.png');
// 定位点图标
const pointIconRed = require('@/assets/point_red.png');
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
    'control-model': ControlModel,
    'bind-model': BindModel,
    'addDevice-model': AddDeviceModel,
    'menuclick-model': MenuClickModel,
    'unbind-model': UnBindModel,
  },
  name: 'Monitor',
})
export default class Monitor extends Vue {
  // 过滤表单数据
  filterParams: object = {
    levelCodeArr: [''],
    levelCode: ' ',
    vehicleSource: '',
    online: '',
    noMoveTime: '',
    fenceIO: '',
    bindStatus: '',
  };

  // 表格ajax请求返回数据格式
  backParams: object = {
    code: 'result.resultCode',
    codeOK: '0',
    message: 'result.resultMessage',
    data: 'entity.data',
    total: 'entity.count',
  };

  // 表格ajax请求外部参数
  outParams: any = {}

  // 表格筛选表单配置数组
  filterList: FilterFormList[] = [
    {
      key: 'levelCode',
      type: 'levelcode',
      label: '所属商户',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
      placeholder: '所属商户(全部)',
      options: [],
    },
    {
      key: 'online',
      type: 'select',
      label: '网络状态',
      placeholder: '网络状态',
      options: [
        {
          value: '',
          label: '网络状态（全部）',
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
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '输入搜索',
      placeholder: '车牌/车架',
    },
  ];

  filterGrade: FilterFormList[] = [
    {
      key: 'levelCode',
      type: 'levelcode',
      label: '所属商户',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
      placeholder: '请选择所属商户',
      options: [],
    },
    {
      key: 'online',
      type: 'select',
      label: '网络状态',
      placeholder: '网络状态',
      options: [
        {
          value: '',
          label: '网络状态（全部）',
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
      options: [],
    },
    {
      key: 'fenceIO',
      type: 'select',
      label: '围栏内外',
      placeholder: '请选择围栏内外',
      options: [],
    },
    {
      key: 'vehicleSource',
      type: 'select',
      label: '车辆来源',
      placeholder: '请选择车辆来源',
      options: [],
    },
    {
      key: 'bindStatus',
      type: 'select',
      label: '绑定状态',
      placeholder: '请选择绑定状态',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '输入搜索',
      placeholder: '车牌/车架',
    },
  ];

  // 表格列配置数组
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
      label: '车辆来源',
      prop: 'sourceName',
      formatter: (row: any) => this.sourceCheck(row),
    },
    {
      label: '绑定状态',
      prop: 'bindStatusName',
    },
    {
      label: '设备数量',
      prop: 'deviceNum',
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
      label: '位置未变',
      prop: 'minutesString',
      sortable: true,
      sortBy: 'minutes',
    },
    {
      label: '围栏内外',
      prop: 'fenceIOName',
    },
    {
      label: '网络状态',
      prop: 'onlineCN',
      formatter: (row: any) => this.onlineFormat(row),
    },
  ];

  // 确定车辆来源
  sourceCheck(data: any) {
    return data.sourceName.indexOf('系统') >= 0 ? <el-tag size="small">系统生成</el-tag> : <el-tag type="success" size="small">设备绑定</el-tag>;
  }

  // 无位置变化时间格式化
  changeMinutes(row: any) {
    const str: string = this.timeChange(row);
    return row.minutes !== null
      ? <el-tooltip class="item" effect="dark" content={str} placement="top">
        <span>{str}</span>
      </el-tooltip> : '--';
  }

  // 时间格式转换
  timeChange(row: any) {
    const day: any = row.minutes / 60 / 24;
    const hour: any = (row.minutes / 60) % 24;
    const min: any = row.minutes % 60;
    const strDay = parseInt(day, 10) > 0 ? `${parseInt(day, 10)}天` : '';
    const strHour = parseInt(hour, 10) > 0 ? `${parseInt(hour, 10)}小时` : '';
    const strMin = parseInt(min, 10) > 0 ? `${parseInt(min, 10)}分钟` : '';
    const str = `${strDay}${strHour}${strMin}`;
    if (day === 0 && hour === 0 && min === 0) {
      return '--';
    }
    return str;
  }

  // online
  onlineFormat(row: any) {
    let str = null;
    let num = 0;
    if (row.onlineCN.indexOf('在线') > -1) {
      num = 1;
    } else if (row.onlineCN.indexOf('离线') > -1) {
      num = 2;
    } else if (row.onlineCN.indexOf('未知') > -1) {
      num = 3;
    }
    switch (num) {
      case 1:
        str = <el-tooltip class="item" effect="dark" content={row.onlineCN} placement="top">
          <span style={{ color: '#67C23A' }}>{row.onlineCN}</span>;
        </el-tooltip>;
        break;
      case 2:
        str = <el-tooltip class="item" effect="dark" content={row.onlineCN} placement="top">
          <span style={{ color: '#F56C6C' }}>{row.onlineCN}</span>;
      </el-tooltip>;
        break;
      case 3:
        str = <el-tooltip class="item" effect="dark" content={'未知'} placement="top">
          <span style={{ color: '#909399' }}>{'未知'}</span>;
      </el-tooltip>;
        break;
      default:
        break;
    }
    return str;
  }

  // 表格数据源添加单位 剩余油量 剩余电量 续航里程 累计里程 电瓶电压
  changeStatus(data: any, unit: string) {
    if (data !== null && data >= 0) {
      return data + unit;
    } else {
      return '--';
    }
  }

  // 表格操作栏配置数组
  opreat: Opreat[] = [
    {
      key: 'bind',
      rowKey: 'vin',
      color: 'blue',
      text: '绑定',
      roles: true,
      disabled: (row: any) => this.bindStatus(row),
    },
    {
      key: 'unbind',
      rowKey: 'vin',
      color: 'red',
      text: '解绑',
      roles: true,
      disabled: (row: any) => this.unbindStatus(row),
    },
    {
      key: 'addDevice',
      rowKey: 'vin',
      color: 'blue',
      text: '添加设备',
      roles: true,
      disabled: (row: any) => this.unbindStatus(row),
    },
    {
      key: 'edit',
      rowKey: 'vin',
      color: 'blue',
      text: '编辑',
      roles: true,
      disabled: (row: any) => this.editStatus(row),
    },
    {
      key: 'delete',
      rowKey: 'vin',
      color: 'red',
      text: '删除',
      roles: true,
      disabled: (row: any) => this.deleteStatus(row),
    },
  ];

  // 绑定按钮状态
  bindStatus(row: any) {
    return !(row.sourceName.indexOf('设备绑定') >= 0 && row.bindStatusName.indexOf('未绑定') >= 0);
  }

  // 解绑按钮状态、新增按钮状态
  unbindStatus(row: any) {
    return !(row.sourceName.indexOf('设备绑定') >= 0 && row.bindStatusName.indexOf('已绑定') >= 0);
  }

  // 编辑按钮状态
  editStatus(row: any) {
    return !(row.sourceName.indexOf('设备绑定') >= 0);
  }

  // 删除按钮状态
  deleteStatus(row: any) {
    return !(row.bindStatusName.indexOf('未绑定') >= 0);
  }

  // 表格请求地址
  tableUrl: string = '/vehicle/monitor/list';

  // 百度地图对象
  BMap: any = null;

  // 百度地图lib对象
  BMapLib: any = null;

  // 当前地图对象实例
  SMap: any = null;

  // 当前地图对象zoom
  SMapZoom: number = 15;

  // 车辆位置
  CarPoint: any = null;

  // 车辆图标
  CarIcon: any = null;

  // 车辆标记
  CarMarker: object[] = [];

  // 标记集合
  markerClusterer: any = null;

  // 车辆坐标
  CarMarkerPos: number = 1;

  address: string = '';

  // 车辆详情展示
  detailShow: boolean = false;

  // 车辆详情数据
  carDetail: any = {};

  // 底部表格开关
  locChange: boolean = false;

  // 车辆详情
  carDetailArr: any = [
    { label: '卫星星数:', prop: 'star', unit: '颗' },
    { label: '网络质量:', prop: 'gsm' },
    { label: 'ACC状态:', prop: 'acc' },
    { label: '引擎状态:', prop: 'engine' },
    { label: '排挡档位:', prop: 'gear', unit: '档' },
    { label: '电瓶电压:', prop: 'voltage', unit: 'V' },
    { label: '剩余油量:', prop: 'leftOil', unit: 'L' },
    { label: '剩余电量:', prop: 'leftElectricPercent', unit: '%' },
    { label: '累计里程:', prop: 'totalMileage', unit: 'km' },
    { label: '续航里程:', prop: 'leftMileage', unit: 'km' },
    { label: '设防状态:', prop: 'fenceStatus', unit: 'fenceStatus' },
    { label: '授权状态:', prop: 'authorizedStatus', unit: 'authorizedStatus' },
    { label: '油路状态:', prop: 'oilStatus', unit: 'oilStatus' },
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

  // 百度地图控制组件
  geolocationControl: any = null;

  // 定位
  mapCenter: { lat: number, lng: number } = { lat: 29.563694, lng: 106.560421 };

  // 地图查询半径
  radius: number = 5000;

  // 地图车辆数据
  mapCarData: MapCarData[] = [];

  constructor(props: any) {
    super(props);
    // 初始化百度地图
    utils.loadMap().then((BMap: any) => {
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
      });
      this.SMap.enableScrollWheelZoom(true);
      // 创建新的图标
      this.CarIcon = new BMap.Icon(carIcon, new BMap.Size(20, 40));
      // 加载地图覆盖层组件
      utils.loadMapTextIcon().then(() => {
        // 地图大数据优化组件
        utils.loadMapLib().then((BMapLib: any) => {
          this.BMapLib = BMapLib;
          // 根据当前地图中心，半径查询车辆
          this.radiusGetData();
          this.markerClusterer = new this.BMapLib.MarkerClusterer(this.SMap, {
            markers: this.CarMarker,
          });
        });
      });
    });
    // 门店数据查询
    orgTree(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.unshift({
          id: Math.random(),
          levelCode: '',
          orgName: '商户门店（全部）',
        });
        this.filterList[0].options = res.entity;
        this.filterGrade[0].options = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    // 获取绑定状态
    getBindStatusOptions(null).then((res: any) => {
      if (res.result.resultCode === '0') {
        res.entity.forEach((item: any) => {
          item.label = item.desc;
          item.value = item.val;
        });
        res.entity.unshift({
          label: '绑定状态（全部）',
          value: '',
        });
        this.filterGrade[5].options = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    // 围栏内外状态
    getFioQueryOptions(null).then((res: any) => {
      if (res.result.resultCode === '0') {
        res.entity.forEach((item: any) => {
          item.label = item.desc;
          item.value = item.val;
        });
        res.entity.unshift({
          label: '围栏内外（全部）',
          value: '',
        });
        this.filterGrade[3].options = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    // 车辆来源
    getSrcQueryOptions(null).then((res: any) => {
      if (res.result.resultCode === '0') {
        res.entity.forEach((item: any) => {
          item.label = item.desc;
          item.value = item.val;
        });
        res.entity.unshift({
          label: '车辆来源（全部）',
          value: '',
        });
        this.filterGrade[4].options = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  /**
   * @method 根据半径和地图中心点查询车辆
   * @param {string} id 车辆id
   */
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

  /**
   * @method 初始化渲染地图车辆
   * @param {Array} list 地图车辆数据数组
   * @param {string} id 车辆id
   */
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
      // 火星坐标系转换为百度坐标系
      const point = CoordTrasns.transToBaidu(
        {
          lat: item.lat,
          lng: item.lng,
        },
        item.coordinateSystem,
      );
      // 创建车辆图标
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
    // 渲染车辆图标
    this.markerClusterer.addMarkers(this.CarMarker);
    this.mapCarData = list;
    // 循环给车辆图标添加点击事件
    this.CarMarker.forEach((item: any, index: number) => {
      item.addEventListener('click', () => {
        this.openMsg(this.mapCarData[index]);
        this.getCarDetail(this.mapCarData[index].id, this.mapCarData[index]);
      });
    });
  }

  /**
   * @method 打开地图信息窗口
   * @param {object} data 车辆数据
   */
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

  closeMsg = () => {
    this.SMap.closeInfoWindow();
  }

  /**
   * @method 车辆信息框内容
   * @param {object} content 车辆数据
   */
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
          <span class="txt">${content.speed !== null ? `${content.speed}km/h` : '未知'}</span>
        </li>
      </ul>
    </div>`;
  }

  /**
   * @method 方向数据格式化
   * @param {number} item 方向数据源
   * @return {string} direction
   */
  getDirection(item: number) {
    const itm = Number(item);
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
    } else {
      direction = '未知';
    }
    return direction;
  }

  // 远程控制选项
  remoteControlArr: any = [];

  // 获取当前车辆控制列表
  getCarControlList(data: any) {
    this.remoteControlArr = [];
    cmdList({ vehicleId: data }).then((res: any) => {
      const { result, entity } = res;
      if (result.resultCode === '0') {
        setTimeout(() => {
          this.remoteControlArr = entity;
        }, 500);
      } else {
        setTimeout(() => {
          this.remoteControlArr = [''];
        }, 500);
        this.$message.error(result.resultMessage);
      }
    });
  }

  /**
   * @method 根据车辆ID获取车辆详情
   * @param {string} id 车辆id
   * @param {Object} data 车辆data
   */
  getCarDetail(id: string, data?: any, target?: string) {
    let carDetail1: any = {};
    this.detailShow = true;
    const oldCarDetail = JSON.parse(JSON.stringify(this.carDetail));
    this.closeMsg();
    vehicleInfo({ id }).then((res) => {
      if (res.result.resultCode === '0') {
        // 如果车辆坐标为空-位置为未知
        this.setNowCarPosi(res.entity, data);
        if (res.entity.lat && res.entity.lng) {
          // gps坐标转换为实际地址
          gpsToAddress({
            lat: res.entity.lat,
            lng: res.entity.lng,
            coordinateSystem: res.entity.coordinateSystem,
          }).then((response: any) => {
            if (response.status === 0) {
              carDetail1 = {
                address: response.result.formatted_address + response.result.sematic_description,
                ...res.entity,
              };
              this.carDetail = carDetail1;
            }
          });
          // 判断当前是否展示的其他车辆
          // if (this.currentCarId !== 0) {
          // }
        } else {
          carDetail1 = {
            address: '未知地址',
            ...res.entity,
          };
          this.carDetail = carDetail1;
          this.carDetail.plateNum = oldCarDetail.plateNum;
          this.carDetail.orgName = oldCarDetail.orgName;
        }
      } else {
        this.$message.error(res.result.resultMessage || '暂无车辆信息');
      }
    });
  }

  setNowCarPosi = (val: any, data?: any) => {
    if (data && data.lng && data.lat) {
      this.SMap.centerAndZoom(new this.BMap.Point(data.lng, data.lat), 15);
    }
    this.radiusGetData(val.id);
  }

  // 清除覆盖物
  clear = () => {
    this.SMap.clearOverlays();
  }

  // 刷新
  refreshLoad(): void {
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
    this.locChange = false;
  }

  hideTable(): void {
    this.locChange = true;
  }

  /**
   * @method 表格操作栏回调事件
   * @param {string} key 事件类型
   * @param {object} row 当前行数据
   */
  menuClick(key: string, row: any): void {
    switch (key) {
      // 绑定
      case 'bind':
        this.bindVisible = true;
        this.bindData = row;
        break;
      // 解绑
      case 'unbind':
        this.unbindVisible = true;
        this.unbindData = row;
        this.menuClickStr = '解绑';
        this.clickTime = utils.getNowTime();
        break;
      // 新增设备
      case 'addDevice':
        this.addVisible = true;
        this.addData = row;
        break;
      // 编辑
      case 'edit':
        this.editVisible = true;
        this.editData = {
          id: row.id,
          vin: row.vin,
          plateNum: row.plateNum,
        };
        break;
      // 删除
      case 'delete':
        this.deleteClickVisible = true;
        this.deleteClickData = row;
        this.menuClickStr = '删除';
        break;
      default:
        break;
    }
  }

  // 获取绑定设备信息
  findTerminalList(id: any) {
    findBindTerminalList(id).then((res: any) => {
      this.wiredTerminals = [];
      this.wirelessTerminals = [];
      const { entity, result } = res;
      if (result.resultCode === '0') {
        entity.forEach((item: any) => {
          if (`${item.online}` === 'true') {
            item.onlineName = '在线';
          } else if (`${item.online}` === 'false') {
            item.onlineName = '离线';
          } else if (`${item.online}` === 'null') {
            item.onlineName = '未知';
          }
          if (item.wireless === 0) {
            this.wiredTerminals.push(item);
          } else if (item.wireless === 1) {
            this.wirelessTerminals.push(item);
          }
        });
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 查询该设备所绑定的有线、无线设备信息
  wiredTerminals: any = [];

  wirelessTerminals: any = [];

  // 编辑开关
  editVisible: boolean = false;

  editData: any = {};

  // 设备控制
  controlData: any = {}

  controlVisible: boolean = false;

  controlTitle: string = '';

  clickTime: string = '';

  cclickTime: string = '';

  // 绑定设备
  bindVisible: boolean = false;

  bindData: any = {};

  // 解绑设备
  unbindVisible: boolean = false;

  unbindData: any = {};

  // 新增
  addVisible: boolean = false;

  addData: any = {}

  // 删除
  deleteClickVisible: boolean = false;

  deleteClickData: any = {}

  menuClickStr: string = '';

  locTimeOptions: any = [
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
  ]

  showExportBtn: boolean = true; // 导出按钮展示

  showTerminal: boolean = true; // 展示设备列表

  showTrack: boolean = true; // 展示无线追踪

  showDrive: boolean = true; // 展示驾驶行为

  showTrajectory: boolean = true; // 展示轨迹

  showControl: boolean = true; // 展示控制列表

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/vehicle/monitor/bindTerminal', // 绑定
      '/vehicle/monitor/unbindTerminal', // 解绑
      '/vehicle/monitor/addTerminal', // 添加设备
      '/vehicle/monitor/edit', // 编辑
      '/vehicle/monitor/delete', // 删除
      '/vehicle/monitor/findBindTerminalList/{vehicleId}', // 设备列表
      '/vehicle/tracke/findRecordList', // 追踪设备记录
      '/vehicle/tracke/findTerminalList', // 追踪设备
      '/vehicle/monitor/driveBehavior', // 驾驶行为
      '/device/trip/list', // 轨迹
      '/cmd/control', // 控制命令
      '/vehicle/monitor/exportExcel', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.opreat[0].roles = res[0]; // 绑定
      this.opreat[1].roles = res[1]; // 解绑
      this.opreat[2].roles = res[2]; // 添加设备
      this.opreat[3].roles = res[3]; // 编辑
      this.opreat[4].roles = res[4]; // 删除
      this.showTerminal = res[5]; // 设备列表
      this.showTrack = res[6] || res[7]; // 追踪设备记录、追踪设备
      this.showDrive = res[8]; // 驾驶行为
      this.showTrajectory = res[9]; // 轨迹
      this.showControl = res[10]; // 控制命令
      this.showExportBtn = res[11]; // 导出
    });
    this.filterList[2].options = this.locTimeOptions;
    this.filterGrade[2].options = this.locTimeOptions;
  }

  reloadTable(key: string) {
    const MapTable: any = this.$refs.mapTable;
    MapTable.reloadTable(key);
  }

  /**
   * @method 渲染车辆状态函数
   * @param {any} value 状态值
   * @param {object} data 其他数据
   * @param {string} unit 单位
   * @return 返回格式化后的数据
   */
  renderStatus(value: boolean | string | number, data: any, unit?: any) {
    const gettype = Object.prototype.toString;
    // 卫星星数 `${value}${unit}`;
    if (unit === '颗') {
      if (value !== null && value >= 0) {
        return `${value}${unit}`;
      }
      return '未知';
    }
    // 剩余油量%
    if (unit === 'L') {
      const num: any = value; // 剩余油量
      if (num && num > 0) {
        return `${num}L`;
      }
      return '未知';
    }
    // 剩余电量
    if (unit === '%') {
      if (value && value >= 0) {
        return `${value}${unit}`;
      }
      return '未知';
    }
    // 累计里程、续航里程
    if (unit === 'km') {
      if (value && value >= 0) {
        return `${value}${unit}`;
      }
      return '未知';
    }
    // 电瓶电压
    if (unit === 'V') {
      if (value && value >= 0) {
        return `${value}${unit}`;
      }
      return '未知';
    }
    // 锁状态
    if (unit === 'leftFrontLock') {
      return this.setDoorStatus(data.leftFrontDoor, data.leftFrontLock);
    } if (unit === 'rightFrontLock') {
      return this.setDoorStatus(data.rightFrontDoor, data.rightFrontLock);
    } if (unit === 'leftRearLock') {
      return this.setDoorStatus(data.leftRearDoor, data.leftRearLock);
    } if (unit === 'rightRearLock') {
      return this.setDoorStatus(data.rightRearDoor, data.rightRearLock);
    } if (unit === 'fenceStatus') {
      // 设备:defenceStatus 原车:defenceSource
      let str1: string = '';
      let str2: string = '';
      if (data.defenceStatus !== null && data.defenceStatus !== undefined) {
        str1 = data.defenceStatus ? '设备设防' : '设备撤防';
      } else {
        str1 = '未知';
      }
      if (data.defenceSource !== null && data.defenceSource !== undefined) {
        str2 = data.defenceSource ? '原车设防' : '原车撤防';
      } else {
        str2 = '未知';
      }
      return `${str1}；${str2}`;
    } if (unit === 'authorizedStatus') {
      if (data.authorizedStatus !== null && data.authorizedStatus !== undefined) {
        return data.authorizedStatus ? '授权' : '夺权';
      }
      return '未知';
    } if (unit === 'oilStatus') {
      if (data.oilStatus !== null && data.oilStatus !== undefined) {
        return data.oilStatus ? '通油' : '断油';
      }
      return '未知';
    }
    // 其他情况
    switch (gettype.call(value)) {
      case '[object Boolean]':
        return value ? '开启' : '关闭';
      case '[object String]':
        return value ? value + unit : value;
      case '[object Number]':
        return unit ? value + unit : value;
      case '[object Null]':
        return '未知';
      case '[object Undefined]':
        return '未知';
      default:
        return value;
    }
  }

  // 车门关闭、锁状态
  setDoorStatus(doorStatus: boolean, lockStatus: boolean) {
    let str1: string = '';
    let str2: string = '';
    if (doorStatus !== null && doorStatus !== undefined) {
      str1 = doorStatus ? '开启' : '关闭';
    } else {
      str1 = '未知';
    }
    if (lockStatus !== null && lockStatus !== undefined) {
      str2 = lockStatus ? '已上锁' : '未上锁';
    } else {
      str2 = '未知';
    }
    return `${str1}；${str2}`;
  }

  currentCarId: number = 0;

  searchCarId: number = 0;

  setInfo(val: any) {
    this.currentCarId = val.id;
    this.carDetail = val;
  }

  getShowTerminal() {
    return this.showTerminal;
  }

  // 设备信息、远程控制不展示
  hideTran() {
    this.showControlTran = false;
    this.showDeviceTran = false;
  }

  // 单击表格-选择车辆
  currentChange = (val: any) => {
    if (val) {
      this.setInfo(val);
      this.hideTran();
      if (this.getShowTerminal() === true) {
        this.findTerminalList(val.id); // 获取设备列表
      }
      if (val.lat && val.lng) {
        this.mapCenter = {
          lat: val.lat,
          lng: val.lng,
        };
        // 设置地图中心点
        this.SMap.centerAndZoom(new this.BMap.Point(this.mapCenter.lng, this.mapCenter.lat), 15);
      } else {
        this.$message.error('车辆暂无定位，使用默认位置！');
        this.mapCenter = {
          lat: 29.627258,
          lng: 106.496422,
        };
        this.SMap.centerAndZoom(new this.BMap.Point(106.496422, 29.627258), 15);
      }
      // 查询此车辆详细数据
      this.getCarDetail(val.id);
      // 以此车辆为中心点查询车辆
      this.radiusGetData(val.id);
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
        icon: new this.BMap.Icon(pointIconRed, new this.BMap.Size(28, 40)),
      },
    );
    this.SMap.clearOverlays();
    this.SMap.addOverlay(marker); // 创建标注
  }

  // 关闭弹窗
  closeModal(): void {
    this.editVisible = false; // 编辑
    this.controlVisible = false; // 控制
    const editBlock: any = this.$refs.editTable;
    this.bindVisible = false; // 绑定
    this.unbindVisible = false; // 解绑
    this.addVisible = false; // 新增设备
    this.deleteClickVisible = false; // 删除
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

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, `车辆列表${utils.returnNowTime()}`, '/vehicle/monitor/exportExcel');
  }

  showDeviceTran: boolean = false; // 展示设备数量

  showControlTran: boolean = false; // 展示控制操作

  // 展示三角形
  showTran(data: string) {
    if (data === '设备') {
      this.showDeviceTran = !this.showDeviceTran;
      this.showControlTran = false;
    }
    if (data === '控制') {
      if (this.searchCarId !== this.currentCarId) {
        this.getCarControlList(this.currentCarId); // 获取车辆控制列表
        this.searchCarId = this.currentCarId;
      }
      this.showDeviceTran = false;
      this.showControlTran = !this.showControlTran;
    }
  }

  // 车辆控制
  carControl(item: any) {
    this.controlData = {
      ...item,
      cmd: item.name,
      imei: this.carDetail.otuImei,
      vin: this.carDetail.vin,
      operateStr: item.desc,
    };
    this.controlVisible = true;
    this.controlTitle = this.setControlTitle(item.desc);
    this.cclickTime = utils.getNowTime();
  }

  // 车辆控制弹框标题
  setControlTitle(num: string) {
    let title = '';
    switch (num) {
      case '夺权':
        title = '夺权选择';
        break;
      case '授权':
        title = '授权选择';
        break;
      case '断油':
        title = '断油选择';
        break;
      default:
        title = '操作确认';
        break;
    }
    return title;
  }

  // 无线追踪
  lineLessTrack() {
    const id = `${this.currentCarId}`;
    this.$router.push({ name: '车辆追踪', params: { id } });
  }

  // 历史轨迹
  tripHis() {
    const id = `${this.currentCarId}`;
    this.$router.push({ name: '车辆轨迹', params: { id } });
    window.localStorage.setItem('monitorCurrentCarPlate', this.carDetail.plateNum);
  }

  // 驾驶行为
  behaviorList() {
    const id = `${this.currentCarId}`;
    this.$router.push({ name: '驾驶行为', params: { id } });
    window.localStorage.setItem('monitorCurrentCarPlate', this.carDetail.plateNum);
  }

  onLineStatus(data: any) {
    if (data === true || data === false) {
      return data ? <span style={{ margin: '0 3px' }}>在线</span> : <span style={{ color: 'red', margin: '0 3px' }}>离线</span>;
    }
    return <span style={{ color: 'red', margin: '0 3px' }}>未知</span>;
  }

  // 绑定、解绑完成后刷新设备列表
  getTerminalList(data: any): void {
    this.findTerminalList(data.id);
  }

  render() {
    const { carDetail } = this;
    return (
      <div class="fzk-monitor-wrap">
        <div id="map"></div>
        {/* 右上角搜索 */}
        <div class="loc-search-box">
          <el-autocomplete size="small" placeholder="搜索地点" prefix-icon="el-icon-location" v-model={this.address} fetch-suggestions={this.searchAddress} on-select={this.setAddress}>
          </el-autocomplete>
          <el-button class="restore" size="small" id="reload" type="primary" icon="el-icon-refresh" on-click={this.refreshLoad}></el-button>
        </div>
        <div class={['car-detail-box', this.detailShow ? 'detail-active' : '', this.locChange ? '' : 'big']} >
          <i class="el-icon-close cancel" on-click={this.cancel} ></i>
          {/* 详情头部 */}
          <div class="car-info">
            <div class="top">
              <span class="plateNumber">{carDetail.plateNum}</span>
              <span class="onlineStatus">[{this.onLineStatus(carDetail.online)}]</span>
            </div>
            <div class="center">
              <span class="brandName">{carDetail.orgName ? carDetail.orgName : '--'}</span>
            </div>
            <div class="bottom">
              <div class="loc">
                <i class="iconfont-location icon"></i>
                <span>{carDetail.address ? carDetail.address : '未知地址'}</span>
              </div>
              <div class="time">
                <i class="iconfont-time-circle icon"></i>
                <span>
                  {carDetail.gpsTime ? new Date(carDetail.gpsTime).Format('yyyy-MM-dd hh:mm:ss') : '未知时间'}
                </span>
                <span class="status">
                  ({carDetail.minutes ? this.timeChange(carDetail) : ''}无位置变化)
                </span>
                <span class="fenceStatus">
                  [<span style={{ color: 'red' }}>{carDetail.fenceIO ? carDetail.fenceIO : '未知'}</span>]
                </span>
              </div>
            </div>
          </div>
          {/* 控制区域 */}
          <ul class="car-control">
            {
              this.showTerminal
                ? <li class="controlItem">
                  <span class="itemTit" on-click={() => this.showTran('设备')}>设备信息</span>
                  {
                    this.showDeviceTran ? <span class="trangle deviceTran"></span> : null
                  }
                </li> : null
            }
            {
              this.showTrack
                ? <li class="controlItem">
                  <span class="itemTit" on-click={this.lineLessTrack}>无线追踪</span>
                </li> : null
            }
            {
              this.showDrive
                ? <li class="controlItem">
                  <span class="itemTit" on-click={this.behaviorList}>驾驶行为</span>
                </li> : null
            }
            {
              this.showTrajectory
                ? <li class="controlItem">
                  <span class="itemTit" on-click={this.tripHis}>历史轨迹</span>
                </li> : null
            }
            {
              this.showControl
                ? <li class="controlItem">
                  <span class="itemTit" on-click={() => this.showTran('控制')}>远程控制</span>
                  {
                    this.showControlTran ? <span class="trangle controlTran"></span> : null
                  }
                </li> : null
            }
          </ul>
          {/* 车上所安装设备信息 */}
          <transition name="el-fade-in-linear">
            <div v-show={this.showDeviceTran}>
              <div class="deviceInfo">
                <div class="deviceItem">
                  <div class="deviceTit">有线设备：{this.wiredTerminals.length}个</div>
                  {
                    this.wiredTerminals.length > 0 ? <ul class="deviceList">
                      <li class="deviceLi">
                        <span class="deviceModel w700">型号</span>
                        <span class="deviceIMEI w700">imei号</span>
                        <span class="deviceModel w700">网络</span>
                        <span class="deviceModel w700">状态</span>
                      </li>
                      {
                        this.wiredTerminals.map((item: any) => <li class="deviceLi">
                          <span class="deviceModel">{item.terminalModel}</span>
                          <span class="deviceIMEI">{item.imei}</span>
                          <span class="deviceModel">{item.flag4G ? '4G':'2G'}</span>
                          <span class="deviceModel">{item.onlineName}</span>
                        </li>)
                      }
                    </ul> : null
                  }
                </div>
                <div class="deviceItem">
                  <div class="deviceTit">无线设备：{this.wirelessTerminals.length}个</div>
                  {
                    this.wirelessTerminals.length > 0 ? <ul class="deviceList">
                      <li class="deviceLi">
                        <span class="deviceModel w700">型号</span>
                        <span class="deviceIMEI w700">imei号</span>
                        <span class="deviceModel w700">网络</span>
                        <span class="deviceModel w700">状态</span>
                      </li>
                      {
                        this.wirelessTerminals.map((item: any) => <li class="deviceLi">
                          <span class="deviceModel">{item.terminalModel}</span>
                          <span class="deviceIMEI">{item.imei}</span>
                          <span class="deviceModel">{item.flag4G ? '4G':'2G'}</span>
                          <span class="deviceModel">{item.onlineName}</span>
                        </li>)
                      }
                    </ul> : null
                  }
                </div>
              </div>
            </div>
          </transition>
          {/* 远程控制选项 */}
          <transition name="el-fade-in-linear">
            <div v-show={this.showControlTran}>
              {
                this.remoteControlArr.length !== 0
                  ? this.remoteControlArr.length > 1
                    ? <ul class="controlList">
                      {
                        this.remoteControlArr.map((item: any, index: number) => (
                          <li class="controlItem" on-click={() => this.carControl(item)}>{item.desc}</li>
                        ))
                      }
                    </ul> : <span class="noControl">未绑定有线设备，暂无控制功能</span> : <span class="noControl">数据查询中...</span>
              }
            </div>
          </transition>
          {/* 车辆状态 */}
          <div class="car-detail clearfix">
            <ul class="line">
              {
                this.carDetailArr.map((item: any) => <li class="item">
                  <span class="label">{item.label}</span>
                  <span class="val">
                    {this.renderStatus(carDetail[item.prop], carDetail, item.unit)}
                  </span>
                </li>)
              }
            </ul>
          </div>
        </div>
        <div class={['fzk-monitor-table', !this.locChange ? 'table-active' : '']}>
          <div class='loc-change-box1'>
            <el-button class="loc btn" size="small" icon="el-icon-location" on-click={this.setCenter}></el-button>
            <el-button class="add btn" size="small" icon="el-icon-plus" on-click={this.zoomAdd}></el-button>
            <el-button class="less btn" size="small" icon="el-icon-minus" on-click={this.zoomReduce}></el-button>
            {!this.locChange
              ? <el-button class="down btn" size="small" type="primary" icon="el-icon-arrow-down" on-click={this.hideTable}></el-button>
              : <el-button class="up btn" size="small" type="primary" icon="el-icon-arrow-up" on-click={this.showTable}></el-button>
            }
          </div>
          <filter-table
            ref="mapTable"
            class="mapTable1"
            max-height="260"
            filter-list={this.filterList}
            filter-grade={this.filterGrade}
            filter-params={this.filterParams}
            back-params={this.backParams}
            add-btn={false}
            out-params={this.outParams}
            highlight-current-row={true}
            on-currentChange={this.currentChange}
            export-btn={this.showExportBtn}
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
        />
        <control-model
          ref="controlTable"
          controltime={this.cclickTime}
          title={this.controlTitle}
          data={this.controlData}
          visible={this.controlVisible}
          on-close={this.closeModal}
          on-refresh={this.reFresh}
        />
        <bind-model
          data={this.bindData}
          visible={this.bindVisible}
          on-close={this.closeModal}
          on-refresh={this.reFresh}
          on-getTerminal={this.getTerminalList}
        />
        <unbind-model
          time={this.clickTime}
          data={this.unbindData}
          visible={this.unbindVisible}
          on-close={this.closeModal}
          on-refresh={this.reFresh}
          on-getTerminal={this.getTerminalList}
        />
        <addDevice-model
          data={this.addData}
          visible={this.addVisible}
          on-close={this.closeModal}
          on-refresh={this.reFresh}
        />
        <menuclick-model
          menuStr={this.menuClickStr}
          data={this.deleteClickData}
          visible={this.deleteClickVisible}
          on-close={this.closeModal}
          on-refresh={this.reFresh}
        />
      </div>
    );
  }
}
