import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Form, FormItem, Input, Button,
} from 'element-ui';
import { deliveryCfg } from '@/api/equipment';
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

  @Prop() private downLoadTime: any;

  @Watch('downLoadTime')
  dataChange() {
    this.modelForm.imei = this.data.imei;
  }

  modelForm: any = {
    productCode: '',
    imei: '',
  };

  loading: boolean = false;

  // 车型列表
  modelList: any = []

  rules = {
    productCode: [
      { required: true, message: '请输入产品编码', trigger: 'blur' },
    ],
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      productCode: '',
      imei: '',
    };
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
    const From: any = this.$refs.modelForm;
    const obj: any = {
      imei: this.modelForm.imei,
      productCode: this.modelForm.productCode,
    };
    const parent: any = this.$parent;
    From.validate((valid: any) => {
      if (valid) {
        deliveryCfg(obj).then((res) => {
          if (res.result.resultCode === '0') {
            setTimeout(() => {
              this.loading = false;
              if (parent) {
                From.resetFields();
                parent.closeModal(); // 关闭下发配置
                parent.openCheckModel(); // 打开查询
                parent.startCountDown(); // 开启倒计时
              }
            }, 1500);
          } else {
            setTimeout(() => {
              this.loading = false;
              this.$message.error(res.result.resultMessage);
            }, 1500);
          }
        });
      } else {
        this.loading = false;
        return false;
      }
      return false;
    });
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
          <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="fzkDownConfigModel">
            <el-form-item label="产品编码" prop="productCode">
              <el-input
                id="productCode"
                v-model={this.modelForm.productCode}
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
