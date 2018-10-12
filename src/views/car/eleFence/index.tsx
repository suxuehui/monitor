import { Component, Vue, Emit } from 'vue-property-decorator';
import { tableList, Opreat, FilterFormList, MapCarData } from '@/interface';
import { Input, Button, Tag, Pagination, Autocomplete, Tooltip } from 'element-ui';
import { enableFence, disableFence, deleteFence, getFenceDetail, getFenceCars } from '@/api/fence';
import { gpsToAddress, queryAddress, orgTree } from '@/api/app';
import { getProvince, getCity, getDistrict } from '@/api/province';
import config from '@/utils';
import './index.less';
import '../../../styles/var.less';

interface AlarmType { key: any, value: any, label: string }

// 坐标图片
const carIcon = require('@/assets/point.png');
@Component({
  components: {
  'el-input': Input,
  'el-button': Button,
  'el-tag': Tag,
  'el-pagination': Pagination,
  'el-autocomplete': Autocomplete,
  'el-tooltip': Tooltip,
  }
  })
export default class EleFence extends Vue {
  BMap: any = null; // 百度地图对象
  SMap: any = null; // 当前地图对象实例
  BMapLib: any = null; // 百度地图lib对象
  address: string = '';
  detailShow: boolean = false; // 围栏详情展示
  locChange: boolean = false;
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
      this.SMap.centerAndZoom(new BMap.Point(106.560421, 29.563694), 15);
      this.SMap.enableScrollWheelZoom(true);

      // 创建坐标点
      // const pt = new this.BMap.Point(106.560421, 29.563694);
      // const myIcon = new this.BMap.Icon(carIcon, new BMap.Size(32, 32));
      // const point = new this.BMap.Marker(pt, { icon: myIcon });
      // this.SMap.addOverlay(point);
      // point.enableDragging(); // 点可拖拽

      // // 拖动标点
      // point.addEventListener('dragend', () => {
      //   const position = point.getPosition();
      //   this.SMap.panTo(new BMap.Point(position.lng, position.lat));
      // });
    });
  }
  tableUrl: string = '/vehicle/fence/list'; // 表格请求地址
  outParams: any = {
    area: '',
  }
  // 表格参数
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
      placeholder: '请选择所属门店',
      options: [],
    },
    {
      key: 'areaNum',
      type: 'cascader',
      label: '所在地区',
      placeholder: '请选择所在地区',
      options: [],
      props: {},
      change: this.areaLoad,
    },
    {
      key: 'alarmType',
      type: 'select',
      label: '监控类型',
      placeholder: '请选择监控类型',
      options: [],
    },
    {
      key: 'available',
      type: 'select',
      label: '状态',
      placeholder: '请选择状态',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '围栏名称或围栏地址',
      placeholder: '围栏名称或围栏地址',
    },
  ];
  tableList: tableList[] = [
    {
      label: '所属商户',
      prop: 'shopName',
    },
    {
      label: '围栏名称',
      prop: 'name',
    },
    {
      label: '所在地区',
      prop: 'areaText',
    },
    {
      label: '围栏地址',
      prop: 'address',
    },
    {
      label: '监控类型',
      prop: 'alarmType',
      formatter: this.formatAlarmType,
    },
    {
      label: '监控时段',
      prop: 'beginTime',
      formatter(row: any) {
        return `每天${row.beginTime}~${row.endTime}`;
      },
    },
    {
      label: '备注',
      prop: 'remark',
    },
    {
      label: '状态',
      prop: 'available',
      formatter: this.formatStatus,
    },
  ];
  opreat: Opreat[] = [];
  filterParams: object = {
    areaValue: '',
    levelCode: '',
    alarmType: '',
    available: '',
    keyword: '',
  };
  backParams: object = {
    code: 'result.resultCode',
    codeOK: '0',
    message: 'result.resultMessage',
    data: 'entity.data',
    total: 'entity.count',
  };

  // 格式化监控类型
  formatAlarmType(row: any) {
    let type;
    switch (row.alarmType) {
      case '1':
        type = <el-tag size="small" type="warning">驶入监控</el-tag>;
        break;
      case '2':
        type = <el-tag size="small" type="success">驶出监控</el-tag>;
        break;
      case '3':
        type = <el-tag size="small" type="info">驶入驶出监控</el-tag>;
        break;
      default:
        break;
    }
    return type;
  }
  // 格式化状态
  formatStatus(row: any) {
    let type;
    switch (row.available === 1) {
      case true:
        type = <el-tag size="small" type="success">已启用</el-tag>;
        break;
      case false:
        type = <el-tag size="small" type="danger">未启用</el-tag>;
        break;
      default:
        break;
    }
    return type;
  }

  // 监控类型
  alarmTypes: AlarmType[] = [
    { key: '', value: '', label: '监控类型(全部)' },
    { key: 1, value: 1, label: '驶入监控' },
    { key: 2, value: 2, label: '驶出监控' },
    { key: 3, value: 3, label: '驶入驶出监控' },
  ]

  carList: any = []

  // 页数
  total: number = 1;
  pageSize: number = 5;
  pageCount: number = 5;

  // 监控状态  全部、未启用、已启用
  statusOptions: any = [
    { key: '', value: '', label: '状态(全部)' },
    { key: 2, value: 2, label: '未启用' },
    { key: 1, value: 1, label: '已启用' },
  ]
  geolocationControl: any = null; // 定位
  mapCenter: { lat: number, lng: number } = { lat: 29.563694, lng: 106.560421 };

  styleOptions = {
    fillColor: 'blue', // 填充颜色。当参数为空时，圆形将没有填充效果。
    strokeColor: 'red',
    strokeWeight: 3, // 边线的宽度，以像素为单位。
    fillOpacity: 0.4, // 填充的透明度，取值范围0 - 1。
    strokeOpacity: 0.4, // 边线透明度，取值范围0 - 1。
  }

  // 到当前定位
  nowMk: any = '';
  nowPosition: any = {};

  tableDom: any = null;
  tableHeight: number = 0

  // 省
  provinceList: any = [];
  // 省市区三级联动
  areaLoad(val: any) {
    this.outParams.area = val[val.length - 1];
    if (val.length === 1) {
      this.getCitys(val[0]);
    } else if (val.length === 2) {
      this.getDistricts(val[1]);
    }
  }

  // 根据省级编码获取地级市
  getCitys(data: number) {
    getCity({ regionalismCode: data }).then((res) => {
      if (res.result.resultCode === '0') {
        this.provinceList.forEach((item: any, index: number) => {
          if (item.value === `${data}`) {
            setTimeout(() => {
              this.provinceList[index].children = [];
              res.entity.forEach((items: any) => {
                this.provinceList[index].children.push({
                  label: items.name,
                  children: [],
                  value: items.regionalismcode,
                });
              });
            }, 200);
          }
        });
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }
  // 根据市级编码获取市辖区
  getDistricts(data: number) {
    getDistrict({ regionalismCode: data }).then((res) => {
      if (res.result.resultCode === '0') {
        this.provinceList.forEach((item: any, index: number) => {
          item.children.forEach((items: any, inx: number) => {
            this.provinceList[index].children[inx].children = [];
            if (res.entity !== null) {
              if (`${data}` === items.value) {
                res.entity.forEach((it: any, key: number) => {
                  this.provinceList[index].children[inx].children.push({
                    label: it.name,
                    value: it.regionalismcode,
                  });
                });
              }
            } else {
              this.provinceList[index].children[inx].children.push({
                label: '到底了~',
                value: Math.random(),
                disabled: true,
              });
            }
          });
        });
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  props: any = {
    value: 'value',
    children: 'children',
  }

  created() {
    // 门店
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
    // 省市区
    getProvince(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.forEach((item: any, index: number) => {
          this.provinceList.push({
            label: item.name,
            children: [],
            value: item.regionalismcode,
          });
        });
        this.filterList[1].props = this.props;
        this.filterList[1].options = this.provinceList;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    this.filterList[2].options = this.alarmTypes;
    this.filterList[3].options = this.statusOptions;
  }

  mounted() {
    this.tableDom = this.$refs.tableList;
  }

  // 围栏详情
  fenceDetail: any = {}

  // 地图搜索
  search(): void {
    console.log(this.address);
  }

  refresh(): void {
  }

  cancel(): any {
    this.detailShow = false;
    this.fenceDetail = {};
  }
  // 表格显示隐藏
  showTable(): any {
    this.locChange = true;
    this.tableHeight = this.tableDom.offsetHeight;
  }
  hideTable(): any {
    this.locChange = false;
  }

  alarmTypeSet(data: string) {
    let type;
    switch (data) {
      case '1':
        type = '驶出监控';
        break;
      case '2':
        type = '驶入监控';
        break;
      case '3':
        type = '驶出入监控';
        break;
      default:
        break;
    }
    return type;
  }

  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      this.$router.push({ name: '围栏详情', params: { eleFenceId: row.id } });
    } else if (key === 'use') {
      if (row.isactive) {
        // 禁用
        disableFence({ eleFenceId: row.id }).then((res) => {
          if (res.result.resultCode) {
            FromTable.reloadTable();
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      } else {
        // 启用
        enableFence({ eleFenceId: row.id }).then((res) => {
          if (res.result.resultCode) {
            FromTable.reloadTable();
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      }
    } else if (key === 'delete') {
      // 删除
      deleteFence({ eleFenceId: row.id }).then((res) => {
        if (res.result.resultCode) {
          FromTable.reloadTable();
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    }
  }

  // 查询监控车辆列表
  getCarList(id: string) {
    const obj = {
      fenceId: id,
      pageSize: 10,
      pageNum: 1,
      page: true,
    };
    getFenceCars(obj).then((res) => {
      if (res.result.resultCode === '0') {
        this.carList = res.entity.data;
        this.total = res.entity.count;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }
  // 展开并且显示详情
  showDetailBox(data: any) {
    this.detailShow = true;
    this.fenceDetail = {
      name: data.name ? data.name : '--',
      shopName: data.shopName ? data.shopName : '--',
      available: data.available ? data.available : '--',
      alarmType: data.alarmType ? data.alarmType : '--',
      beginTime: data.beginTime ? data.beginTime : '--',
      endTime: data.endTime ? data.endTime : '--',
      address: data.address ? data.address : '--',
    };
    this.getCarList(data.id);
  }

  currentChange = (val: any) => {
    this.showDetailBox(val);
    this.mapCenter = {
      lat: val.lat,
      lng: val.lng,
    };
    // 点击设点
    const pt = new this.BMap.Point(val.lng, val.lat);
    const myIcon = new this.BMap.Icon(carIcon, new this.BMap.Size(32, 32));
    const point = new this.BMap.Marker(pt, { icon: myIcon });
    // 清除之前所涉标点
    this.SMap.clearOverlays();
    // 新建点
    this.SMap.addOverlay(point);
    this.SMap.centerAndZoom(new this.BMap.Point(this.mapCenter.lng, this.mapCenter.lat), 15);
    // 新建圆圈、多边形、矩形
    this.remark(val);
    const opts = {
      width: 200, // 信息窗口宽度
      // offset: { height: -10, width: -10 },
      title: '围栏名称：', // 信息窗口标题
    };
    const infoWindow = new this.BMap.InfoWindow(val.name, opts);
    this.SMap.openInfoWindow(infoWindow, pt); // 开启信息窗口
    point.addEventListener('click', () => {
      this.SMap.openInfoWindow(infoWindow, pt); // 开启信息窗口
    });
  }

  remark(data: any) {
    if (data.fenceType === '1') {
      this.circleInMap(data.lng, data.lat, data.radius);
    } else if (data.fenceType === '2') {
      this.polygonInMap(data);
    }
  }
  circleInMap = (lng: number, lat: number, radius: number) => {
    const point: any = new this.BMap.Point(lng, lat);
    const circle: any = new this.BMap.Circle(point, radius, this.styleOptions);
    const marker = new this.BMap.Marker(point);
    this.SMap.clearOverlays();
    this.SMap.addOverlay(marker);
    this.SMap.addOverlay(circle);
  }
  polygonInMap = (data: any) => {
    const polyPointArr: any = [];
    JSON.parse(data.latLngArray).forEach((itm: any) => {
      const point = new this.BMap.Point(itm.lng, itm.lat);
      polyPointArr.push(point);
    });
    const ret = new this.BMap.Polygon(polyPointArr, this.styleOptions); // 创建多边形
    const point: any = new this.BMap.Point(data.lng, data.lat);
    const marker = new this.BMap.Marker(point);
    this.SMap.clearOverlays();
    this.SMap.addOverlay(marker);
    this.SMap.addOverlay(ret);
  }

  // 定位至当前位置
  getNowPosition = () => {
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

  addZoom = () => {
    const newZoom = this.SMap.getZoom() + 1;
    this.SMap.setZoom(newZoom);
  }

  reduceZoom = () => {
    const newZoom = this.SMap.getZoom() - 1;
    this.SMap.setZoom(newZoom);
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
  }

  render() {
    return (
      <div class="monitor-wrap">
        <div id="map"></div>
        {/* 搜索 */}
        <div class="loc-search-box">
          <el-autocomplete size="small" placeholder="搜索地点" prefix-icon="el-icon-location" v-model={this.address} fetch-suggestions={this.searchAddress} on-select={this.setAddress}>
          </el-autocomplete>
          <el-button class="restore" size="small" type="primary" icon="el-icon-refresh" on-click={this.refresh}></el-button>
        </div>
        {/* 右下角控制台 */}
        <div ref="btnControl" id="btnControl" style={{ bottom: this.locChange ? `${this.tableHeight}px` : '0' }} class={['loc-change-box', this.locChange ? 'loc-active' : '']}>
          <el-button class="loc btn" size="mini" icon="el-icon-location" on-click={this.getNowPosition}></el-button>
          <el-button class="add btn" size="mini" icon="el-icon-plus" on-click={this.addZoom}></el-button>
          <el-button class="less btn" size="mini" icon="el-icon-minus" on-click={this.reduceZoom}></el-button>
          {!this.locChange ?
            <el-button class="up btn" size="mini" type="primary" icon="el-icon-arrow-up" on-click={this.showTable}></el-button> :
            <el-button class="down btn" size="mini" type="primary" icon="el-icon-arrow-down" on-click={this.hideTable}></el-button>
          }
        </div>
        {/* 详情 */}
        <div class={['car-detail-box', this.detailShow ? 'detail-active' : '']} >
          <i class="el-icon-close cancel" on-click={this.cancel} ></i>
          <div class="car-info">
            <div class="top">
              <span class="plateNumber">{this.fenceDetail.name}</span>
            </div>
            <div class="center">
              <span class="brandName">{this.fenceDetail.shopName}</span>
              <span class="net">{this.fenceDetail.available === 1 ? '已启用' : '未启用'}</span>
            </div>
            <div class="bottom">
              <span style="marginLeft:25px">{this.alarmTypeSet(this.fenceDetail.alarmType)}</span>
              <span style="marginRight:25px">{this.fenceDetail.beginTime}~{this.fenceDetail.endTime}</span>
            </div>
          </div>
          <div class="car-address">
            <div class="loc">
              <i class="iconfont-location icon iconfont"></i>
              <span>{this.fenceDetail.address}</span>
            </div>
          </div>
          <div class="car-detail">
            <ul class="line">
              {/* {
                this.carList.length > 0 ?
                  this.carList.forEach((item: any) => <li class="item">
                    <span class="label">{item.id}</span>
                  </li>) : null
              } */}
              {
                this.carList.length > 0 ?
                  this.carList.map((item: any) => <li class="item">
                    <span class="label">{item.platenum}</span>
                  </li>) :
                  <li class="item">
                    <span class="label">暂无监控车辆</span>
                  </li>
              }
            </ul>
            <el-pagination
              class="pageSet"
              small
              background
              page-size={this.pageSize}
              pager-count={this.pageCount}
              layout="prev, pager, next"
              total={this.total}
            >
            </el-pagination>
          </div>
        </div>
        <div ref="tableList" id="TableList" class={['car-table', this.locChange ? 'table-active' : '']}>
          <filter-table
            ref="table"
            class="map-table"
            filter-list={this.filterList}
            filter-grade={[]}
            filter-params={this.filterParams}
            back-params={this.backParams}
            add-btn={false}
            export-btn={true}
            defaultPageSize={5}
            highlight-current-row={true}
            on-currentChange={this.currentChange}
            // on-menuClick={this.menuClick}
            table-list={this.tableList}
            url={this.tableUrl}
            localName={'eleFence'}
            opreat={this.opreat}
            out-params={this.outParams}
            opreat-width="150px"
          >
          </filter-table>
        </div>
      </div>
    );
  }
}
