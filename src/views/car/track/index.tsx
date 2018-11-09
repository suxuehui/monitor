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

  // 记录
  recordTable: boolean = true;
  // 设备
  deviceTable: boolean = true;

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      '/vehicle/tracke/findTerminalList',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.deviceTable = !!(res[0]);
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
    this.locChange = false;
  }
  hideTable(): any {
    this.locChange = true;
  }

  tabClick(data: any) {
  }
  render() {
    return (
      <div class="monitor-wrap">
        <div id="map"></div>
        <div ref="tabList" class={['tab-table-track', !this.locChange ? 'table-active' : '']}>
          <div ref="btnControl" id="btnControl" class={'loc-change-box-track'}>
            <el-button class="add btn" size="mini" icon="el-icon-plus" on-click={this.addZoom}></el-button>
            <el-button class="less btn" size="mini" icon="el-icon-minus" on-click={this.reduceZoom}></el-button>
            {!this.locChange ?
              <el-button class="down btn" size="mini" type="primary" icon="el-icon-arrow-down" on-click={this.hideTable}></el-button> :
              <el-button class="up btn" size="mini" type="primary" icon="el-icon-arrow-up" on-click={this.showTable}></el-button>
            }
          </div>
          <el-tabs
            v-model={this.tabActive}
            type="card"
            on-tab-click={this.tabClick}
          >
            <el-tab-pane label="记录" id="record" name="record">
              <record-table></record-table>
            </el-tab-pane>
            {
              this.deviceTable ? <el-tab-pane label="设备" id="equipment" name="equipment">
                <equipment-table></equipment-table>
              </el-tab-pane> : null
            }
          </el-tabs>
        </div>
      </div >
    );
  }
}
