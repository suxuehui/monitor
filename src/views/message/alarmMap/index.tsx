import { Component, Vue, Emit } from 'vue-property-decorator';
import { Input, Button } from 'element-ui';
import config from '@/utils';
import { gpsToAddress } from '@/api/app';
import './index.less';

const pointIcon = require('@/assets/point.png');
@Component({
  components: {
  'el-input': Input,
  'el-button': Button,
  }
  })

export default class AlarmMap extends Vue {
  BMap: any = null; // 百度地图对象
  SMap: any = null; // 当前地图对象实例
  akNums: string = 'K52pNzWT61z1EHvdZptaSmlPRc7mKbjC'
  locAddress: string = '';
  mounted() {
    const Address: any = this.$route.query;
    config.loadMap().then((BMap: any) => {
      this.BMap = BMap;
      this.SMap = new BMap.Map('map', { enableMapClick: false });
      this.SMap.centerAndZoom(new BMap.Point(Address.lng, Address.lat), 15);
      this.SMap.enableScrollWheelZoom(true);
      this.getFormAddress(Address.lng, Address.lat);
    });
  }

  getFormAddress(lng: number, lat: number) {
    // 坐标点
    const pt = new this.BMap.Point(lng, lat);
    const myIcon = new this.BMap.Icon(pointIcon, new this.BMap.Size(16, 16));
    // const marker2 = new this.BMap.Marker(pt, { icon: myIcon });
    const marker2 = new this.BMap.Marker(pt);
    this.SMap.addOverlay(marker2);

    gpsToAddress({ lat, lng }).then((response: any) => {
      if (response.status === 0) {
        // 地址备注
        const opts = {
          width: 200, // 信息窗口宽度
          title: '告警地点：', // 信息窗口标题
        };
        const infoWindow = new this.BMap.InfoWindow(`${response.result.formatted_address}${response.result.sematic_description}`, opts);
        this.SMap.openInfoWindow(infoWindow, pt); // 开启信息窗口
        marker2.addEventListener('click', () => {
          this.SMap.openInfoWindow(infoWindow, pt); // 开启信息窗口
        });
      }
    });
  }

  // 定位至当前位置
  getNowPosition() {
    const Address: any = this.$route.query;
    this.SMap.centerAndZoom(new this.BMap.Point(Address.lng, Address.lat), 15);
  }

  addZoom() {
    const newZoom = this.SMap.getZoom() + 1;
    this.SMap.setZoom(newZoom);
  }

  reduceZoom() {
    const newZoom = this.SMap.getZoom() - 1;
    this.SMap.setZoom(newZoom);
  }

  render() {
    return (
      <div class="monitor-wrap">
        <div ref="btnControl" id="btnControl" class="loc-change-box">
          <el-button class="loc btn" size="mini" icon="iconfont-trace" on-click={this.getNowPosition}></el-button>
          <el-button class="add btn" size="mini" icon="el-icon-plus" on-click={this.addZoom}></el-button>
          <el-button class="less btn" size="mini" icon="el-icon-minus" on-click={this.reduceZoom}></el-button>
        </div>
        <div id="map"></div>
      </div>
    );
  }
}
