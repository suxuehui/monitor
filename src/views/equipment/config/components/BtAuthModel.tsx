import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
import { createBluetooth } from '@/api/equipment';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
  },
})
export default class BtAuthModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private time: any;

  @Watch('time')
  onDataChange() {
    this.newCfgVal = this.data.cfgVal;
  }

  loading: boolean = false;

  closeModal() {
    setTimeout(() => {
      this.$emit('close');
    }, 100);
    this.loading = false;
  }

  newCfgVal: string = '';

  onSubmit() {
    this.loading = true;
    const obj: any = {
      cfgName: 'bluetoothAuthCode',
      id: this.data.id,
      imei: this.data.imei,
    };
    createBluetooth(obj).then((res) => {
      if (res.result.resultCode === '0') {
        setTimeout(() => {
          this.newCfgVal = res.entity;
          this.loading = false;
          this.$message.success(res.result.resultMessage);
        }, 1500);
      } else {
        setTimeout(() => {
          this.loading = false;
          this.$message.error(res.result.resultMessage);
        }, 1500);
      }
    });
  }

  render() {
    return (
      <el-dialog
        width="520px"
        title="蓝牙鉴权码"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div style={{ lineHeight: '50px', fontSize: '16px', minHeight: '50px' }}>
          <p style={{ minHeight: '30px' }}>{this.newCfgVal}</p>
          <div style={{ textAlign: 'center' }}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>重新生成</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </div>
      </el-dialog>
    );
  }
}
