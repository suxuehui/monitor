import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
import { terminalUnbind } from '@/api/equipment';
import './UnbindModel.less';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
  },
})
export default class UnbindModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
    this.loading = false;
  }

  newCfgVal: string = ''

  onSubmit() {
    this.loading = true;
    const obj: any = {
      imei: this.data.imei,
    };
    terminalUnbind(obj).then((res) => {
      if (res.result.resultCode === '0') {
        setTimeout(() => {
          this.loading = false;
          this.$message.success(res.result.resultMessage);
          this.$emit('refresh');
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
        title="解绑车辆"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="box">
          <p>确定<span class="info">  解绑  </span>该车辆？</p>
        </div>
        <el-row>
          <el-col offset={6} span={12}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
