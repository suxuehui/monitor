import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
import './SearchConfigModel.less';
import { queryCfg } from '@/api/equipment';

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

  @Prop() private countNum: any;

  configArr: any = [];

  showConfigArr: any = [];

  getOk: string = '';

  @Watch('num')
  onDataChange() {
    if (this.num === this.countNum - 1) {
      if (this.data.origin && this.data.origin === '检测') {
        this.getOk = 'ok';
        this.configArr = JSON.parse(JSON.stringify(this.data.entity));
      } else {
        this.getConfig();
      }
    }
    if (this.num === 0) {
      if (this.getOk === 'ok') {
        this.showConfigArr = JSON.parse(JSON.stringify(this.configArr));
      } else {
        this.showConfigArr = [];
        this.$message.error(this.getOk);
      }
    }
  }

  getConfig() {
    queryCfg(this.data.imei).then((res: any) => {
      if (res.result.resultCode === '0') {
        this.getOk = 'ok';
        this.configArr = JSON.parse(JSON.stringify(res.entity));
      } else {
        this.getOk = res.result.resultMessage;
      }
    });
  }

  closeModal() {
    setTimeout(() => {
      this.$emit('close');
    }, 200);
  }

  renderData() {
    return this.showConfigArr && this.showConfigArr.length > 0 ? this.showConfigArr.map((item: any, index: number) => <li class="item">
      <span class="item_title">配置项{index + 1}:</span><span>{item.tag}</span>,<span>{item.paras}</span>【{item.realCfgVal}】
      </li>) : <li class="noConfig">暂无配置</li>
  }

  render() {
    return (
      <el-dialog
        width="520px"
        title="查询配置"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <ul class="SearchConfigModelContent">
          {
            this.data.origin === '列表' ?
              this.renderData() : this.num !== 0 ?
                <div class="noConfig">正在查询配置参数，请稍等...</div> : this.renderData()
          }
        </ul>
      </el-dialog>
    );
  }
}
