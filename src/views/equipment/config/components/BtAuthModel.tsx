import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
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

  @Prop() private updateAble !: boolean;

  @Prop() private data: any;

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
    this.loading = false;
  }

  onSubmit() {

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
        <div style={{ lineHeight: '50px', fontSize: '16px' }}>
          {this.data.productCode}
          <div style={{ textAlign: 'center' }}>
            {
              this.updateAble
                ? <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>重新生成</el-button> : null
            }
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </div>
      </el-dialog>
    );
  }
}
