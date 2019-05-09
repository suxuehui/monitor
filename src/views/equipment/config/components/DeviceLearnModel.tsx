import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
import { modelMatch } from '@/api/equipment';

const learnOk = require('@/assets/d_done.png');
const learnWrong = require('@/assets/d_alert.png');
@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
  },
})
export default class DeviceLearnModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
    setTimeout(() => {
      this.loading = false;
      this.step = 0;
    }, 200);
  }

  // 下发成功为1，失败为2，设备不支持为3
  step: number = 0;

  contentRender() {
    if (this.step === 0) {
      return <p style={{ lineHeight: ' 50px', fontSize: '16px', marginBottom: '10px' }}>确定进行设备学习？</p>;
    }
    if (this.step === 1) {
      return <div>
        <img src={learnOk} />
        <p style={{ lineHeight: '50px', marginBottom: '10px' }}>学习成功</p>
      </div>;
    }
    if (this.step === 2) {
      return <div>
        <img src={learnWrong} />
        <p style={{ lineHeight: '50px' }}>学习失败</p>
      </div>;
    }
    if (this.step === 3) {
      return <div>
        <img src={learnWrong} />
        <p style={{ lineHeight: '50px' }}>学习失败（设备不支持）</p>
      </div>;
    }
    return true;
  }

  onSubmit() {
    this.loading = true;
    const imei: any = {
      imei: this.data.imei,
    };
    modelMatch(this.data.imei).then((res) => {
      // 学习成功
      if (res.result.resultCode === '0') {
        setTimeout(() => {
          this.step = 1;
          this.contentRender();
          this.loading = false;
          this.$message.success(res.result.resultMessage);
        }, 1500);
      } else if (res.result.resultCode === '1') { // 学习不成功，不支持
        setTimeout(() => {
          this.step = 3;
          this.contentRender();
          this.loading = false;
          this.$message.error(res.result.resultMessage);
        }, 1500);
      } else if (res.result.resultCode === '2') { // 学习不成功,失败
        setTimeout(() => {
          this.step = 2;
          this.contentRender();
          this.loading = false;
          this.$message.error(res.result.resultMessage);
        }, 500);
      }
    });
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
        <div style={{ fontSize: '16px' }}>
          {
            this.contentRender()
          }
        </div>

        {
          this.step !== 1
            ? <div style={{ textAlign: 'center' }}>
              <el-button
                size="small"
                type="primary"
                id="submit"
                loading={this.loading}
                on-click={this.onSubmit}
              >
                {this.step === 2 || this.step === 3 ? '重新学习' : '开始学习'}
              </el-button>
              <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
            </div> : null
        }
      </el-dialog>
    );
  }
}
