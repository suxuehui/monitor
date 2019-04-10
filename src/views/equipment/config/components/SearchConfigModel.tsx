import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
import './SearchConfigModel.less';

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

  closeModal() {
    this.$emit('close');
    this.loading = false;
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
            this.data && this.data.length > 0 ? this.data.map((item: any) => {
              return (
                <li class="item">
                  <span class="item_title">配置项1:</span><span>{item.tag}</span>,<span>{item.paras}</span>【{item.realCfgVal}】
                </li>
              );
            }) : <li class="noConfig">暂无配置</li>
          }
        </ul>
      </el-dialog>
    );
  }
}
