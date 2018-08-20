import { Component, Vue } from 'vue-property-decorator';
import { gpsToAddress } from '@/api/app';
import { Button, Tabs, TabPane } from 'element-ui';
import config from '@/utils';
import RecordTable from '@/views/car/track/record/RecordTable';
import EquipmentTable from '@/views/car/track/equip/EquipTable';
import './index.less';
import '../../../styles/var.less';

// 坐标图片
const locaIcon = require('@/assets/point.png');

@Component({
  components: {
  'el-button': Button,
  'el-tabs': Tabs,
  'el-tab-pane': TabPane,
  'record-table': RecordTable,
  'equipment-table': EquipmentTable
  }
  })
export default class Track extends Vue {
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
    });
  }

  // 获取地址
  getLocAddress(lng: any, lat: any) {
    gpsToAddress({ lat, lng }).then((res) => {
      if (res.status === 0) {
        this.modelForm.address =
          `${res.result.formatted_address}`;
      }
    });
  }

  modelForm: any = {

  }


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

  locChange: boolean = false;
  tabActive: string = 'record';

  handleSelectionChange(arr: any) {
    this.modelForm.carList = [];
    arr.map((item: any) => {
      this.modelForm.carList.push(item.plateNum);
      return true;
    });
  }

  submit = () => {

  }

  mounted() {
    this.tableDom = this.$refs.tabList;
  }

  tableDom: any = null;
  tableHeight: number = 0


  addZoom = () => {
    const newZoom = this.SMap.getZoom() + 1;
    this.SMap.setZoom(newZoom);
  }

  reduceZoom = () => {
    const newZoom = this.SMap.getZoom() - 1;
    this.SMap.setZoom(newZoom);
  }

  // 表格显示隐藏
  showTable(): any {
    this.locChange = true;
    this.tableHeight = this.tableDom.offsetHeight;
  }
  hideTable(): any {
    this.locChange = false;
  }

  tabClick(data: any) {
  }
  render() {
    return (
      <div class="monitor-wrap">
        <div id="map"></div>
        {/* 右下角控制台 */}
        <div ref="btnControl" id="btnControl" style={{ bottom: this.locChange ? `${this.tableHeight}px` : '0' }} class={['loc-change-box', this.locChange ? 'loc-active' : '']}>
          <el-button class="add btn" size="mini" icon="el-icon-plus" on-click={this.addZoom}></el-button>
          <el-button class="less btn" size="mini" icon="el-icon-minus" on-click={this.reduceZoom}></el-button>
          {!this.locChange ?
            <el-button class="up btn" size="mini" type="primary" icon="el-icon-arrow-up" on-click={this.showTable}></el-button> :
            <el-button class="down btn" size="mini" type="primary" icon="el-icon-arrow-down" on-click={this.hideTable}></el-button>
          }
        </div>
        <div ref="tabList" class={['tab-table', this.locChange ? 'table-active' : '']}>
          <el-tabs
            v-model={this.tabActive}
            type="card"
            on-tab-click={this.tabClick}
          >
            <el-tab-pane label="记录" name="record">
              <record-table></record-table>
            </el-tab-pane>
            <el-tab-pane label="设备" name="equipment">
              <equipment-table></equipment-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div >
    );
  }
}
