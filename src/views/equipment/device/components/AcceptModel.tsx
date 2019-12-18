import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Form, FormItem, Input, Button, Radio, RadioGroup,
} from 'element-ui';
import { terminalCheck } from '@/api/equipment';
import './AcceptModel.less';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
    'el-radio': Radio,
    'el-radio-group': RadioGroup,
  },
})
export default class AcceptModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  modelForm: any = {
    terminalStatus: '',
    remark: '',
  };

  loading: boolean = false;

  rules = {
    terminalStatus: [
      { required: true, message: '请确认是否合格', trigger: 'change' },
    ],
  }

  remarkRule = [
    { required: true, validator: this.checkRule, trigger: 'blur' },
  ]

  // 验证理由
  checkRule(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const exp: any = /^\s+$/;
        if (!exp.test(value)) {
          callback();
        } else {
          callback(new Error('理由不能为空！'));
        }
      } else {
        callback(new Error('理由不能为空！'));
      }
    }, 500);
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      terminalStatus: '',
      remark: '',
    };
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    From.resetFields();
    setTimeout(() => {
      this.resetData();
      this.loading = false;
    }, 200);
  }

  onSubmit() {
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    this.loading = true;
    obj = {
      id: this.data.id,
      imei: this.data.imei,
      remark: parseInt(this.modelForm.terminalStatus, 10) === 4 ? this.modelForm.remark : '',
      terminalStatus: parseInt(this.modelForm.terminalStatus, 10),
    };
    From.validate((valid: any) => {
      if (valid) {
        terminalCheck(obj).then((res) => {
          if (res.result.resultCode === '0') {
            setTimeout(() => {
              this.loading = false;
              this.$message.success(res.result.resultMessage);
              From.resetFields();
              this.$emit('refresh');
            }, 500);
          } else {
            setTimeout(() => {
              this.loading = false;
              this.$message.error(res.result.resultMessage);
            }, 500);
          }
        });
      } else {
        this.loading = false;
        return false;
      }
      return true;
    });
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
        <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="fzkAcceptModel">
          <el-row>
            <el-col span={24}>
              <el-form-item label="是否合格" prop="terminalStatus" class="radioGroup">
                <el-radio-group v-model={this.modelForm.terminalStatus} >
                  <el-radio id="availableY" label="3">合格</el-radio>
                  <el-radio id="availableN" label="4">不合格</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            {
              this.modelForm.terminalStatus === '4'
                ? <el-col span={24}>
                  <el-form-item
                    label="理由"
                    prop="remark"
                    rules={this.modelForm.terminalStatus === '4' ? this.remarkRule : null}>
                    <el-input
                      id="remark"
                      v-model={this.modelForm.remark}
                      type="textarea"
                      placeholder="请填写不合格理由"
                    ></el-input>
                  </el-form-item>
                </el-col> : null
            }
          </el-row>
        </el-form>
        <div class="acceptBtn">
          <el-button size="small" id="submit" type="primary" loading={this.loading} on-click={this.onSubmit}>确认</el-button>
          <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
        </div>
      </el-dialog>
    );
  }
}
