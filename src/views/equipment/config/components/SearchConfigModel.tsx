import {
  Component, Prop, Vue, Watch
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
import './CheckConfigModel.less';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
  },
})
export default class SearchConfigModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private num: any;

  loading: boolean = false;

  step: number = 0;

  disBtn: boolean = false;

  // @Watch('num')
  // dataChange() {
  //   if (this.num === 0) {
  //     this.step += 1;
  //   }
  // }

  closeModal() {
    this.$emit('close');
    this.loading = false;
  }

  showContent() {
    // 配置参数下发成功
    if (this.step === 0) {
      return (
        <div>
          <p style={{ marginTop: '8px' }}>配置参数下载成功</p>
        </div>
      )
    } else if (this.step === 1) {
      return (
        <div>
          <p style={{ marginTop: '8px' }}>请稍等，正在校验配置...</p>
        </div>
      )
    }
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
        <div class="content">
          {
            this.showContent()
          }
        </div>
      </el-dialog>
    );
  }
}
