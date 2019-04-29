import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
import './CheckConfigModel.less';

import { queryCfg } from '@/api/equipment';

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
          <p style={{ marginTop: '8px' }}>配置参数下发成功</p>
        </div>
      );
    } if (this.step === 1) {
      return (
        <div>
          <img src={loadingPic} />
          <p style={{ marginTop: '8px' }}>请稍等，正在校验配置...</p>
        </div>
      );
    }
    return true;
  }

  handleCheck() {
    this.loading = true;
    const parent: any = this.$parent;
    queryCfg(this.data.imei).then((res: any) => {
      if (res.result.resultCode === '0') {
        setTimeout(() => {
          this.loading = false;
          if (parent) {
            parent.closeModal();
            parent.openSearchModel(); // 打开查询配置
            parent.startSearchCountDown();// 开启倒计时
            parent.searchconfigData = res.entity;
            parent.searchconfigData.origin = '检测';
          }
        }, 1500);
      } else {
        this.loading = false;
        this.$message.error(res.result.resultMessage);
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
        <div class="content">
          {
            this.showContent()
          }
        </div>
        <div style={{ textAlign: 'center' }}>
          <el-button
            disabled={this.num > 0 || this.disBtn}
            loading={this.loading}
            on-click={this.handleCheck}
          >
            {
              this.num > 0 ? <span>查询配置({this.num}s)</span> : <span>查询配置</span>
            }
          </el-button>
        </div>
      </el-dialog>
    );
  }
}
