import { Component, Prop, Vue } from 'vue-property-decorator';
import { Dialog, Row, Col, Button } from 'element-ui';
import { terminalCfg } from '@/api/equipment';
import './UpdateModal.less';

@Component({
  components: {
  'el-dialog': Dialog,
  'el-button': Button,
  'el-col': Col,
  'el-row': Row,
  }
  })
export default class UpdateModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  loading:boolean = false;

  closeModal() {
    this.$emit('close');
  }

  onSubmit() {
    this.loading = true;
    terminalCfg({ cfgId: this.data.cfgId }).then((res) => {
      if (res.result.resultCode) {
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
          确定更新为“<span class="type">{this.data.upCfgVer}</span>”版本
        </p>
        <el-row>
          <el-col offset={7} span={12}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
