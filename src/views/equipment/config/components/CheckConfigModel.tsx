import {
  Component, Prop, Vue, Watch
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
import './CheckConfigModel.less';

const alertPic = require('@/assets/d_alert.png'); // 警告
const donePic = require('@/assets/d_done.png'); // 完成
const loadingPic = require('@/assets/d_loading.png'); // 加载中

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
          <img src={donePic} />
          <p style={{ marginTop: '8px' }}>配置参数下载成功</p>
        </div>
      )
    } else if (this.step === 1) {
      return (
        <div>
          <img src={loadingPic} />
          <p style={{ marginTop: '8px' }}>请稍等，正在校验配置...</p>
        </div>
      )
    }
  }

  handleCheck() {
    console.log(this.step);
    this.step += 1;
    this.disBtn = true;
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
        <div style={{ textAlign: 'center' }}>
          <el-button disabled={this.num > 0 || this.disBtn} on-click={this.handleCheck}>
            {
              this.num > 0 ? <span>配置检验({this.num}s)</span> : <span>配置检验</span>
            }
          </el-button>
        </div>
      </el-dialog>
    );
  }
}
