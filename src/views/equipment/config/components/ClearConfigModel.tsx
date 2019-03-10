import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
import './ClearConfigModel.less';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
  },
})
export default class ClearConfigModel extends Vue {
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
    //
  }

  render() {
    return (
      <el-dialog
        width="520px"
        title="清除配置"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="clearModel">
          <div class="box">
            <p>确定要<span class="info">  清除  </span>此设备配置参数吗？</p>
          </div>
          <div class="clearBtn">
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </div>
      </el-dialog>
    );
  }
}
