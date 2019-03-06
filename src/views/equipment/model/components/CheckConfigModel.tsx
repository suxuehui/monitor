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
export default class CheckConfigModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private num: any;

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
    this.loading = false;
  }

  handleCheck() {
    console.log(111);
  }

  render() {
    return (
      <el-dialog
        width="520px"
        title="提示"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        配置参数下载成功
        <div style={{ textAlign: 'center' }}>
          <el-button disabled={this.num > 0} on-click={this.handleCheck}>
            配置检验({this.num}s)
          </el-button>
        </div>
      </el-dialog>
    );
  }
}
