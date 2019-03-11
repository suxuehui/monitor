import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Button,
} from 'element-ui';
import './ExitModel.less';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-button': Button,
  },
})
export default class ExitModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;


  modelForm: any = {};

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
    this.loading = false;
  }

  onSubmit() {
    this.loading = true;
    setTimeout(() => {
      localStorage.removeItem('token');
      window.location.reload();
    }, 1000);
  }

  render() {
    return (
      <el-dialog
        width="500px"
        title="退出登录"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="box">
          确定退出登录状态？
        </div>
        <div class="unbindBtn">
          <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
          <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
        </div>
      </el-dialog>
    );
  }
}
