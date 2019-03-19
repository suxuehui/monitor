import {
  Component, Prop, Vue, Watch, Emit,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Row, Col, Form, FormItem, Input, Button,
} from 'element-ui';
import { vehicleUpdate } from '@/api/monitor';
import './EditModel.less';

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
export default class EditModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  modelForm: any = {
    carInfo: [],
    vin: '',
    plateNum: '',
  };

  loading: boolean = false;

  rules = {
    vin: [
      { required: true, message: '请输入车架号', trigger: 'blur' },
      {
        validator: this.checkVinRule, trigger: 'blur',
      },
    ],
    plateNum: [
      { required: true, message: '请输入车牌号', trigger: 'blur' },
      {
        validator: this.checkPlateNum, trigger: 'blur',
      },
    ],
  }

  // 验证车架号
  @Emit()
  checkVinRule(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const upperVin = value.toUpperCase();
        // 车架号不包含I\O\Q
        if (upperVin.indexOf('O') >= 0 || upperVin.indexOf('I') >= 0 || upperVin.indexOf('Q') >= 0) {
          callback(new Error('车架号输入不合法，请重新输入'));
        } else if (upperVin.length === 17) {
          callback();
        } else {
          callback(new Error('车架号长度为17位，请重新输入'));
        }
      } else {
        callback(new Error('车架号不能为空，请输入'));
      }
    }, 500);
  }

  // 验证车牌号
  @Emit()
  checkPlateNum(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const exp: any = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4,5}[A-Z0-9挂学警港澳]{1}$/;
        if (exp.test(value)) {
          callback();
        } else {
          callback(new Error('车牌号输入不合法，请重新输入'));
        }
      } else {
        callback(new Error('车牌号不能为空，请输入'));
      }
    }, 500);
  }

  @Watch('data')
  onDataChange() {
    this.modelForm = {
      vin: this.data.vin.toUpperCase(),
      plateNum: this.data.plateNum,
    };
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      vin: '',
      plateNum: '',
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
      plateNum: this.modelForm.plateNum,
      vin: this.modelForm.vin.toUpperCase(),
      id: this.data.id,
    };
    From.validate((valid: any) => {
      if (valid) {
        vehicleUpdate(obj).then((res) => {
          if (res.result.resultCode === '0') {
            setTimeout(() => {
              this.loading = false;
              this.$message.success(res.result.resultMessage);
              From.resetFields();
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
          title="编辑车辆"
          visible={this.visible}
          before-close={this.closeModal}
          close-on-click-modal={false}
        >
          <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="model">
            <el-row>
              <el-col span={24}>
                <el-form-item label="车架号" prop="vin">
                  <el-input
                    id="vin"
                    v-model={this.modelForm.vin}
                    placeholder="请输入车架号"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={24}>
                <el-form-item label="车牌号" prop="plateNum">
                  <el-input
                    id="plateNum"
                    v-model={this.modelForm.plateNum}
                    placeholder="请输入车牌号"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
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
