import { Component, Prop, Vue } from 'vue-property-decorator';
import { Dialog, Row, Col, Button } from 'element-ui';
import { deliveryCfg, clearCfg } from '@/api/equipment';
import './ClearModel.less';

@Component({
  components: {
  'el-dialog': Dialog,
  'el-button': Button,
  'el-col': Col,
  'el-row': Row,
  }
  })
export default class ClearModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
    this.loading = false;
  }

  onSubmit() {
    this.loading = true;
    clearCfg({ imei: this.data.imei }).then((res) => {
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
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <p class="notice">
          确定要{this.title === '下发配置' ? '下发' : '清除'}此设备配置参数吗？
        </p>
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
