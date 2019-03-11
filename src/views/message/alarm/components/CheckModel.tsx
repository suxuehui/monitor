import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { Dialog } from 'element-ui';
import './CheckModel.less';
@Component({
  components: {
    'el-dialog': Dialog,
  },
})
export default class CheckModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  closeModal() {
    this.$emit('close');
    setTimeout(() => {
      this.data = '';
    }, 200);
  }

  render() {
    return (
      <el-dialog
        width="600px"
        title="处理信息"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="fzkAlarmContainer">
          {this.data}
        </div>
      </el-dialog>
    );
  }
}
