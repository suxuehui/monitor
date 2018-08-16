import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Button } from 'element-ui';
import { handleAlarm } from '@/api/message';
import './HandleModel.less';
@Component({
  components: {
  'el-dialog': Dialog,
  'el-row': Row,
  'el-col': Col,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-input': Input,
  'el-button': Button,
  }
  })
export default class HandleModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop() private data: any;

  modelForm: any = {};
  loading: boolean = false;

  rules = {
    solution: [
      { required: true, message: '请输入处理意见或处理结果', trigger: 'blur' },
    ],
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      solution: '',
    };
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
    }, 200);
  }

  onSubmit() {
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    obj = {
      id: this.data.id,
      solution: this.modelForm.solution,
    };
    From.validate((valid: any) => {
      if (valid) {
        this.loading = true;
        handleAlarm(obj).then((res) => {
          if (res.result.resultCode) {
            setTimeout(() => {
              this.loading = false;
              this.$message.success(res.result.resultMessage);
              this.$emit('refresh');
            }, 1500);
          } else {
            setTimeout(() => {
              this.loading = false;
              this.$message.error(res.result.resultMessage);
            }, 1500);
          }
        });
      } else {
        return false;
      }
      return false;
    });
  }

  render() {
    return (
      <el-dialog
        width="600px"
        title="告警处理"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} rules={this.rules} ref="modelForm" class="model">
          <el-form-item prop="solution">
            <el-input
              v-model={this.modelForm.solution}
              type="textarea"
              rows="4"
              placeholder="请输入处理方法或结果"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col offset={7} span={12}>
            <el-button size="small" type="primary" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
            <el-button size="small" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
