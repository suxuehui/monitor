import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Form, FormItem, Input, Button, Upload,
} from 'element-ui';
import { changePsw } from '@/api/permission';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
    'el-upload': Upload,
  },
})
export default class ChangePawModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  modelForm: any = {
    password: '',
    pass: '',
    checkPass: '',
  };

  loading: boolean = false;


  closeModal() {
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.clearValidate();
      From.resetFields();
    }, 200);
    this.$emit('close');
    this.loading = false;
  }

  rules = {
    password: [
      { validator: this.checkPaw, trigger: 'blur' },
    ],
    pass: [
      { validator: this.validatePass, trigger: 'blur' },
    ],
    checkPass: [
      { validator: this.validatePass2, trigger: 'blur' },
    ],
  }

  checkPaw(rule: any, value: string, callback: Function) {
    if (this.modelForm.password) {
      if (this.isChineseChar(this.modelForm.password)) {
        callback(new Error('登录密码格式有误，请重新输入'));
      } else {
        callback();
      }
    } else {
      callback(new Error('请输入密码'));
    }
  }

  validatePass(rule: any, value: string, callback: Function) {
    if (this.modelForm.pass) {
      if (this.isChineseChar(this.modelForm.pass)) {
        callback(new Error('登录密码格式有误，请重新输入'));
      } else {
        const model: any = this.$refs.modelForm;
        model.validateField('checkPass');
      }
      callback();
    } else {
      callback(new Error('请输入密码'));
    }
  }

  validatePass2(rule: any, value: string, callback: Function) {
    if (this.modelForm.checkPass) {
      if (this.isChineseChar(this.modelForm.checkPass)) {
        callback(new Error('登录密码格式有误，请重新输入'));
      } else if (value !== this.modelForm.pass) {
        callback(new Error('两次输入密码不一致!'));
      }
      callback();
    } else {
      callback(new Error('请输入密码'));
    }
  }

  isChineseChar(str: any) {
    const reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return reg.test(str);
  }

  onSubmit() {
    this.loading = true;
    const From: any = this.$refs.modelForm;
    const obj = {
      password: this.modelForm.password,
      newPassword: this.modelForm.pass,
    };
    From.validate((valid: any) => {
      if (valid) {
        changePsw(obj).then((res) => {
          if (res.result.resultCode === '0') {
            setTimeout(() => {
              this.loading = false;
              this.$emit('close');
              this.$message.success(res.result.resultMessage);
              window.location.reload();
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
      <el-dialog
        width="540px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="93px" class="model">
          <el-row>
            <el-form-item label="旧密码" prop="password">
              <el-input
                id="password"
                auto-complete="off"
                type="password"
                v-model={this.modelForm.password}
                placeholder="请输入旧密码"
              ></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="pass">
              <el-input
                id="pass"
                type="password"
                auto-complete="off"
                v-model={this.modelForm.pass}
                placeholder="请输入新密码"
              ></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="checkPass">
              <el-input
                id="checkPass"
                auto-complete="off"
                type="password"
                v-model={this.modelForm.checkPass}
                placeholder="请再次输入新密码"
              ></el-input>
            </el-form-item>
          </el-row>
        </el-form>
        <el-row>
          <el-col offset={7} span={12}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
