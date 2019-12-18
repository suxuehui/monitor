import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Row, Col, Form, FormItem, Input, Button,
} from 'element-ui';
import { addTerminal } from '@/api/car';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-tag': Tag,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
  },
})
export default class BindModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  modelForm: any = {
    imei: '',
  };

  loading: boolean = false;

  // 验证条件
  rules = {
    imei: [
      { required: true, message: '请输入imei号', trigger: 'blur' },
    ],
  }

  // 重置数据
  resetData() {
    this.modelForm = {
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
      vehicleId: this.data.id,
    };
    From.validate((valid: any) => {
      if (valid) {
        addTerminal(obj).then((res: any) => {
          if (res.result.resultCode === '0') {
            setTimeout(() => {
              this.loading = false;
              From.resetFields();
              this.$message.success(res.result.resultMessage);
              this.$emit('refresh'); // 传出refresh，刷新列表
            }, 500);
          } else {
            setTimeout(() => {
              this.loading = false;
              this.$message.error(res.result.resultMessage);
            }, 500);
          }
        });
      } else {
        // 验证失败，取消loading
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
          width="500px"
          title="添加设备"
          visible={this.visible}
          before-close={this.closeModal}
          close-on-click-modal={false}
        >
          <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="carBindModel">
            <el-form-item label="imei号" prop="imei">
              <el-input
                id="imei"
                v-model={this.modelForm.imei}
                placeholder="请输入imei号"
              ></el-input>
            </el-form-item>
          </el-form>
          <div style={{ textAlign: 'center' }}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </el-dialog>
      </div >
    );
  }
}
