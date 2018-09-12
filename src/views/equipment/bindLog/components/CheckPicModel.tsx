import { Component, Prop, Vue } from 'vue-property-decorator';
import { Dialog, Row, Col } from 'element-ui';
import './CheckPicModel.less';
@Component({
  components: {
  'el-dialog': Dialog,
  'el-row': Row,
  'el-col': Col,
  }
  })
export default class UnbindModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop() private title: any;
  @Prop() private data: any;

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
  }


  render() {
    return (
      <el-dialog
        width="540px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="box">
          <img alt="安装图片" src={this.data} />
        </div>
      </el-dialog>
    );
  }
}
