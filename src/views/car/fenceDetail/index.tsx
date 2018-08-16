import { Component, Vue, Emit } from 'vue-property-decorator';
import { Input, Button, Form, Col, Row, FormItem, Table, TableColumn, Pagination, Select, Option, TimeSelect, Tag, RadioGroup, RadioButton, Cascader } from 'element-ui';
import { getCarList, findCar } from '@/api/equipment';
import { gpsToAddress, addressToGps } from '@/api/app';
import { getFenceDetail, updateFence, addFence } from '@/api/fence';
import { getProvince, getCity, getDistrict } from '@/api/province';
import config from '@/utils';
import './index.less';
import '../../../styles/var.less';

// 坐标图片
const locaIcon = require('@/assets/point.png');

interface AlarmType { key: any, value: any, label: string }
@Component({
  components: {
  'el-input': Input,
  'el-button': Button,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-col': Col,
  'el-row': Row,
  'el-table': Table,
  'el-table-column': TableColumn,
  'el-pagination': Pagination,
  'el-select': Select,
  'el-option': Option,
  'el-time-select': TimeSelect,
  'el-tag': Tag,
  'el-radio-group': RadioGroup,
  'el-radio-button': RadioButton,
  'el-cascader': Cascader,
  }
  })
export default class FenceDetail extends Vue {
  BMap: any = null; // 百度地图对象
  SMap: any = null; // 当前地图对象实例
  BMapLib: any = null; // 百度地图lib对象
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
      const pt = new this.BMap.Point(106.560421, 29.563694);
      const myIcon = new this.BMap.Icon(locaIcon, new BMap.Size(32, 32));
      const point = new this.BMap.Marker(pt, { icon: myIcon });
      // this.SMap.addOverlay(point);
      // point.enableDragging(); // 点可拖拽

      // 拖动标点
      point.addEventListener('dragend', () => {
        const position = point.getPosition();
        this.SMap.panTo(new BMap.Point(position.lng, position.lat));
        gpsToAddress({ lat: position.lat, lng: position.lng }).then((res) => {
          if (res.status === 0) {
            this.modelForm.address =
              `${res.result.formatted_address}-${res.result.sematic_description}`;
          }
        });
      });

      // 画线
      config.loadDrawScript().then((BMapLib: any) => {
        this.BMapLib = BMapLib;
        const overlays = [];
        // 实例化鼠标绘制工具
        const drawingManager = new BMapLib.DrawingManager(this.SMap, {
          isOpen: false, // 是否开启绘制模式
          enableDrawingTool: true, // 是否显示工具栏
          drawingToolOptions: {
            anchor: 'BMAP_ANCHOR_TOP_LEFT', // 位置
            offset: new this.BMap.Size(5, 5), // 偏离值
            drawingModes: [
              window.BMAP_DRAWING_CIRCLE,
              window.BMAP_DRAWING_POLYGON,
              window.BMAP_DRAWING_RECTANGLE,
            ],
          },
          circleOptions: this.styleOptions, // 圆的样式
          polylineOptions: this.styleOptions, // 线的样式
          polygonOptions: this.styleOptions, // 多边形的样式
          rectangleOptions: this.styleOptions, // 矩形的样式
        });

        drawingManager.addEventListener('overlaycomplete', (e: any) => {
          this.SMap.clearOverlays();
          this.iMpl = e.overlay;
          this.SMap.addOverlay(e.overlay);
          drawingManager.close();
          if (e.drawingMode === 'circle') {
            // 画圆
            this.modelForm.type = 'circle';
            const radius = parseInt(this.iMpl.getRadius(), 10);
            const center = this.iMpl.getCenter();
            // 圆形坐标中心、半径
            this.inFenLng = center.lng;
            this.inFenLat = center.lat;
            this.circleRadius = radius;
            const obj = {
              lng: center.lng,
              lat: center.lat,
              radius,
              type: this.modelForm.type,
            };
            this.remark(obj);
          } else if (e.drawingMode === 'polygon') {
            // 画多边形
            this.modelForm.type = 'polygon';
            const polygon = this.iMpl.getPath();
            this.polyPoint = JSON.stringify(polygon);
            const obj = {
              type: this.modelForm.type,
              polygon,
            };
            this.remark(obj);
          } else if (e.drawingMode === 'rectangle') {
            // 矩形
            this.modelForm.type = 'rectangle';
            const rectangle = this.iMpl.getPath();
            this.rectanglePoint = JSON.stringify(rectangle);
            const obj = {
              type: this.modelForm.type,
              rectangle,
            };
            this.remark(obj);
          }
        });
      }).catch((e) => {
        console.log(`e:${e}`);
      });
    });
  }

  remark(data: any) {
    if (data.type === 'circle') {
      this.modelForm.type = 'circle';
      this.circleInMap(data.lng, data.lat, data.radius);
    } else if (data.type === 'polygon') {
      this.modelForm.type = 'polygon';
      this.polygonInMap(data);
    } else if (data.type === 'rectangle') {
      this.modelForm.type = 'rectangle';
      this.rectInMap(data);
    }
  }

  // 矩形
  rectInMap = (data: any) => {
    const rectPointArr: any = [];
    // 创建坐标点
    if (data.id > 0) {
      // 编辑
      data.latLngArray.forEach((itm: any) => {
        const point = new this.BMap.Point(itm.lng, itm.lat);
        rectPointArr.push(point);
      });
      // 创建多边形
      const ret = new this.BMap.Polygon(rectPointArr, this.styleOptions);
      this.createPoly(ret);
      this.createPoint(data.latLngArray[0].lng, data.latLngArray[0].lat);
      // 右键删除
      this.deleteCover(ret, '删除矩形');
    } else {
      // 新增
      // 创建矩形
      const ret = new this.BMap.Polygon(data.polygon, this.styleOptions);
      this.createPoly(ret);
      this.createPoint(data.polygon[0].lng, data.polygon[0].lat);
    }
  }

  // 多边形
  polygonInMap = (data: any) => {
    const polyPointArr: any = [];
    // 创建坐标点
    if (data.id > 0) {
      // 编辑
      data.latLngArray.forEach((itm: any) => {
        const point = new this.BMap.Point(itm.lng, itm.lat);
        polyPointArr.push(point);
      });
      const ret = new this.BMap.Polygon(polyPointArr, this.styleOptions); // 创建多边形
      this.createPoly(ret);
      this.createPoint(data.latLngArray[0].lng, data.latLngArray[0].lat);
      // 右键删除
      this.deleteCover(ret, '删除多边形');
    } else {
      // 新增
      const ret = new this.BMap.Polygon(data.polygon, this.styleOptions); // 创建多边形
      this.createPoly(ret);
      this.createPoint(data.polygon[0].lng, data.polygon[0].lat);
    }
  }

  // 圆形区域
  circleInMap = (lng: number, lat: number, radius: number) => {
    const that = this;
    let point: any = null;
    let circle: any = null;
    // 中心、半径
    this.inFenLng = lng;
    this.inFenLat = lat;
    this.circleRadius = radius;
    if (!lng || !lat) {
      console.log('no lat or lng');
      return;
    }
    // 在地图上显示标注
    if (lng > 0) {
      point = new this.BMap.Point(lng, lat);
      circle = new this.BMap.Circle(point, radius, that.styleOptions);
    } else {
      point = new this.BMap.Point(this.inFenLng, this.inFenLat);
      circle = new this.BMap.Circle(point, that.circleRadius, that.styleOptions);
    }
    const marker = new this.BMap.Marker(point);
    this.SMap.clearOverlays();
    this.SMap.addOverlay(circle);
    this.SMap.addOverlay(marker);
    marker.enableDragging();
    // 获取详细地址
    this.getLocAddress(lng, lat);
    function setPoint(ev: any) {
      that.inFenLng = ev.point.lng;
      that.inFenLat = ev.point.lat;
      that.circleInMap(ev.point.lng, ev.point.lat, radius);
    }
    // 标注拖拽后的位置
    marker.removeEventListener('dragend', setPoint);
    marker.addEventListener('dragend', setPoint);
    // 拖动标点
    marker.addEventListener('dragend', () => {
      const position = marker.getPosition();
      this.SMap.panTo(new this.BMap.Point(position.lng, position.lat));
      // 获取详细地址
      this.getLocAddress(position.lng, position.lat);
    });
    setTimeout(() => {
      this.SMap.centerAndZoom(point, 15);
    }, 500);
  }

  created() {
    getCarList(null).then((res) => {
      this.total = res.count;
      this.tableData = res.entity;
    });
  }

  // 获取地址
  getLocAddress(lng: any, lat: any) {
    gpsToAddress({ lat, lng }).then((res) => {
      if (res.status === 0) {
        this.modelForm.address =
          // `${res.result.formatted_address}-${res.result.sematic_description}`;
          `${res.result.formatted_address}`;
      }
    });
  }

  // 删除覆盖物
  deleteCover=(ret:any, name:string) => {
    const deleteMenu = new this.BMap.ContextMenu();
    deleteMenu.addItem(new this.BMap.MenuItem(name, (() => {
      this.SMap.clearOverlays();
      this.modelForm.address = '';
    })));
    ret.addContextMenu(deleteMenu);
  }

  // 创建多边形
  createPoly = (ret:any) => {
    this.SMap.clearOverlays();
    this.SMap.addOverlay(ret);
    ret.enableEditing();
  }

  // 创建坐标点
  createPoint = (lng: any, lat: any) => {
    const newPoint = new this.BMap.Point(lng, lat);
    this.inFenLng = newPoint.lng;
    this.inFenLat = newPoint.lat;
    const newIcon = new this.BMap.Icon(locaIcon, new this.BMap.Size(32, 32));
    const newMarker = new this.BMap.Marker(newPoint, { icon: newIcon });
    this.SMap.addOverlay(newMarker);
    newMarker.enableDragging();
    this.getLocAddress(newMarker.point.lng, newMarker.point.lat); // 获取详细地址
    // 拖动标点
    newMarker.addEventListener('dragend', () => {
      const position = newMarker.getPosition();
      this.inFenLng = position.lng;
      this.inFenLat = position.lat;
      this.getLocAddress(position.lng, position.lat); // 获取详细地址
    });
  }

  // 覆盖物
  iMpl: any = {}
  // 线的样式
  styleOptions = {
    fillColor: 'blue', // 填充颜色。当参数为空时，圆形将没有填充效果。
    strokeColor: 'red',
    strokeWeight: 3, // 边线的宽度，以像素为单位。
    fillOpacity: 0.4, // 填充的透明度，取值范围0 - 1。
    strokeOpacity: 0.4, // 边线透明度，取值范围0 - 1。
  }

  // 圆形半径、坐标
  inFenLat: number = 1;
  inFenLng: number = 1;
  circleRadius: number = 1;
  // 多边形坐标点
  polyPoint: any = {};
  // 矩形坐标点
  rectanglePoint: any = {};

  modelForm: any = {
    name: '',
    area: [],
    address: '',
    type: '',
    alarmType: [],
    beginTime: '',
    startTime: '',
    endTime: '',
    carList: [],
  }
  // 车辆列表
  tableData: any = []
  tableSelectData: any = []
  // 告警类型
  alarmTypes: AlarmType[] = [
    { key: 1, value: '1', label: '驶入监控' },
    { key: 2, value: '2', label: '驶出监控' },
    { key: 3, value: '3', label: '驶入驶出监控' },
  ]
  // 围栏形状
  alarmOptions: any = [
    { key: 0, value: 'circle', label: '圆形' },
    { key: 1, value: 'polygon', label: '多边形' },
    { key: 2, value: 'rectangle', label: '矩形' },
    { key: 4, value: 'clear', label: '清除' },
  ]

  // 页数
  total: number = 1;
  pageSize: number = 5;
  pageCount: number = 5;
  // 多选项目
  multipleSelection: any = []
  // 时间范围
  startSet: any = {
    start: '00:00',
    step: '00:10',
    end: '24:00',
  }
  endSet: any = {
    start: '00:00',
    step: '00:10',
    end: '24:00',
    minTime: this.modelForm.startTime,
  }

  findCarPlate: string = ''; // 搜索车辆的车牌
  fenceId: string = ''; // 围栏ID
  options: any = [];

  detailHide: boolean = false; // 详情

  // 初始化
  mounted() {
    this.fenceId = this.$route.query.eleFenceId;
    if (parseInt(this.fenceId, 10) > 0) {
      getFenceDetail({ eleFenceId: this.fenceId }).then((res) => {
        this.modelForm = res.entity;
        if (this.modelForm.type === 0) {
          this.modelForm.type = 'circle';
        } else if (this.modelForm.type === 1) {
          this.modelForm.type = 'polygon';
        } else if (this.modelForm.type === 2) {
          this.modelForm.type = 'rectangle';
        }
        this.remark(this.modelForm);
      });
    }
  }

  // 监控区域类型
  fenceTypeChange = (data: any) => {
    if (data === 'clear') {
      this.modelForm.type = [];
      this.modelForm.address = '';
      this.SMap.clearOverlays(); // 删除全部覆盖物
    }
  }

  // 搜索车辆
  findCar() {
    findCar({ plateNum: this.findCarPlate }).then((res) => {
      if (res.result.resultCode) {
        this.tableSelectData.push(res.entity);
        this.total = 1;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 省市区
  areaChange() {

  }

  // 搜索框输入搜索地址
  setPoint = () => {
    addressToGps(this.modelForm.address).then((res) => {
      if (res.status === 0) {
        const posi = res.result.location;
        this.inFenLng = posi.lng;
        this.inFenLat = posi.lat;
        const myIcon = new this.BMap.Icon(locaIcon, new this.BMap.Size(32, 32));
        const point = new this.BMap.Marker(posi, { icon: myIcon });
        this.SMap.clearOverlays(); // 清除之前所涉标点
        this.SMap.addOverlay(point); // 加点
        point.enableDragging(); // 点可拖拽
        this.SMap.centerAndZoom(new this.BMap.Point(posi.lng, posi.lat), 15);

        // 拖动标点
        point.addEventListener('dragend', () => {
          const position = point.getPosition();
          this.SMap.panTo(new this.BMap.Point(position.lng, position.lat));
          this.getLocAddress(position.lng, position.lat); // 获取详细地址
        });
      }
    });
  }

  handleSelectionChange(arr: any) {
    this.modelForm.carList = [];
    arr.map((item: any) => {
      this.modelForm.carList.push(item.plateNum);
      return true;
    });
  }

  hideDetail() {
    this.detailHide = true;
  }
  showDetail() {
    this.detailHide = false;
  }

  submit = () => {
    console.log(`标点纬度：${this.inFenLng}`);
    console.log(`标点经度：${this.inFenLat}`);
    console.log(`标点经度：${this.rectanglePoint}`);

    // 圆形半径、坐标
    // inFenLat: string = '';
    // inFenLng: string = '';
    // circleRadius: number = 1;
    // // 多边形坐标点
    // polyPoint: any = {};
    // // 矩形坐标点
    // rectanglePoint: any = {};
  }

  render() {
    return (
      <div class="monitor-wrap">
        <div id="map"></div>
        <div class={['container', this.detailHide ? 'tableActive' : '']}>
          <div class="fenceSet">
            <div class="fenceTit">
              围栏设置
              <div class="hideDetail">
                <i class="icon iconfont-close" on-click={this.hideDetail}></i>
              </div>
            </div>
            <el-form model={this.modelForm} ref="modelForm" class="fenceInfo" >
              <el-form-item label="围栏名称" label-width="70px" prop="name">
                <el-input
                  id="name"
                  size="mini"
                  placeholder="请输入围栏名称"
                  v-model={this.modelForm.name}
                ></el-input>
              </el-form-item>
              <el-form-item label="所在地区" label-width="70px" prop="area">
                <el-cascader
                  style="width:100%"
                  size="mini"
                  options={this.options}
                  v-model={this.modelForm.area}
                  placeholder="请选择围栏所在地区"
                  change={this.areaChange}>
                </el-cascader>
              </el-form-item>
              <el-form-item prop="address">
                <el-input
                  id="address"
                  size="mini"
                  class="address"
                  v-model={this.modelForm.address}
                  placeholder="请输入围栏地址"
                  on-blur={this.setPoint}
                ></el-input>
              </el-form-item>
              <el-form-item label="监控区域" label-width="70px" prop="type">
                <div class="monitorArea">
                  <el-radio-group size="mini" v-model={this.modelForm.type} on-change={(ev: any) => this.fenceTypeChange(ev)}>
                    {
                      this.alarmOptions.map((item: any, index: number) => <el-radio-button
                        label={item.value}
                        key={index}
                        disabled={item.value !== 'clear'}
                      >{item.label}</el-radio-button>)
                    }
                  </el-radio-group >
                </div>
              </el-form-item>
              <el-form-item label="监控类型" label-width="70px" prop="alarmType">
                <el-select
                  id="alarmType"
                  size="mini"
                  v-model={this.modelForm.alarmType}
                  placeholder="请选择监控类型"
                  style="width:100%"
                >
                  {
                    this.alarmTypes.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
              </el-form-item>
              <el-form-item label="监控时段" label-width="70px" prop="imei" class="monitorTime">
                <el-time-select
                  style="width:95px"
                  size="mini"
                  placeholder="开始"
                  v-model={this.modelForm.beginTime}
                  picker-options={this.startSet}>
                </el-time-select>
                <span style="width:48px;textAlign:center;display:inline-block">~~</span>
                <el-time-select
                  style="width:95px"
                  size="mini"
                  placeholder="结束"
                  v-model={this.modelForm.endTime}
                  picker-options={this.endSet} />
              </el-form-item>
            </el-form>
          </div>
          <div class="monitorCars">
            <div class="fenceTit">
              监控车辆
            </div>
            <el-input size="small" placeholder="车牌号" clearable v-model={this.findCarPlate} class="selectCars">
              <el-button slot="append" icon="el-icon-search" on-click={this.findCar}></el-button>
            </el-input>
            <div class="carTable">
              <el-table
                ref="multipleTable"
                tooltip-effect="dark"
                style="width: 100%"
                data={this.tableSelectData.length ? this.tableSelectData : this.tableData}
                on-selection-change={this.handleSelectionChange}
              >
                <el-table-column type="selection" width="40"> </el-table-column>
                <el-table-column prop="plateNum" label="车牌号" width="110"></el-table-column>
                <el-table-column prop="vin" label="车架号" show-overflow-tooltip></el-table-column>
              </el-table>
            </div>
            <div class="selectPage">
              <div class="btnAll">
                <el-button size="mini" >全部</el-button>
              </div>
              <div class="setPage">
                <el-pagination
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
          </div>
          <div class="submit">
            <el-button size="small" type="primary" on-click={this.submit}>保存</el-button>
          </div>
        </div>
        <div
          class={['showActive', this.detailHide ? 'detailActive' : '']}
          on-click={this.showDetail}
        >
          围栏详情
        </div>
      </div>
    );
  }
}
