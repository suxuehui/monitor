import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option } from 'element-ui';
import { createBluetooth } from '@/api/equipment';
import './AuthModel.less';
@Component({
  components: {
  'el-dialog': Dialog,
  'el-row': Row,
  'el-col': Col,
  'el-button': Button,
  }
  })
export default class AuthModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop() private data: any;

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
    setTimeout(() => {
      this.newCfgVal = '';
    }, 200);
  }

  newCfgVal: string = ''

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
        width="540px"
        title="蓝牙鉴权码"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="box">
          <p>{this.newCfgVal !== '' ? this.newCfgVal : this.data.cfgVal}</p>
        </div>
        <el-row>
          <el-col offset={6} span={12}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>重新生成</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
