import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Form, FormItem, Input, Button,
} from 'element-ui';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-tag': Tag,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
  },
})
export default class DownConfigModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  modelForm: any = {
    vin: '',
  };

  loading: boolean = false;

  // 车型列表
  modelList: any = []

  rules = {
    vin: [
      { required: true, message: '请输入产品编码', trigger: 'blur' },
    ],
  }

  // 重置数据
  resetData() {
    this.modelForm = {};
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
    }, 200);
    this.loading = false;
  }

  onSubmit() {
    this.loading = true;
    const parent:any = this.$parent;
    setTimeout(() => {
      this.loading = false;
      if (parent) {
        parent.closeModal(); // 关闭下发配置
        parent.openCheckModel(); // 打开配置校验
        parent.startCountDown(); // 开启倒计时
      }
    }, 500);
  }

  render() {
    return (
      <div>
        <el-dialog
          width="540px"
          title="下发配置"
          visible={this.visible}
          before-close={this.closeModal}
          close-on-click-modal={false}
        >
          <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="bindModel">
            <el-form-item label="产品编码" prop="vin">
              <el-input
                id="vin"
                v-model={this.modelForm.vin}
                placeholder="请输入产品编码"
              />
            </el-form-item>
          </el-form>
          <div class="bindBtn">
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>下发</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </el-dialog>
      </div >
    );
  }
}
