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

  @Prop() private data: any;

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
    this.loading = false;
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
        </div>
      </el-dialog>
    );
  }
}
