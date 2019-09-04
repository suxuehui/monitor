import {
  Component, Prop, Vue, Watch, Emit,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option,
} from 'element-ui';
import { workerExist, workerAdd, workerEdit } from '@/api/permission';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-tag': Tag,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-select': Select,
    'el-button': Button,
    'el-option': Option,
  },
})
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  modelForm: any = {
    realName: '',
    username: '',
    remark: '',
    password: '',
  };

  isPhoneNumber: boolean = false;

  phoneNumber: string = '';

  loading: boolean = false;

  rules = {
    realName: [
      { required: true, message: '请输入专员姓名', trigger: 'blur' },
    ],
    remark: [
      { required: false },
    ],
  }

  passwordRule = [
    { validator: this.checkPassword, trigger: 'blur' },
  ];

  userNameRule = [
    { required: true, message: '请输入登录账号' },
    { validator: this.checkUsername, trigger: 'blur' },
  ];

  @Emit()
  checkPassword(rule: any, value: string, callback: Function) {
    if (this.data.userId > 0) {
      // 编辑
      if (this.modelForm.password) {
        setTimeout(() => {
          if (this.isChineseChar(this.modelForm.password)) {
            callback(new Error('登录密码格式有误，请重新输入'));
          } else {
            callback();
          }
        }, 500);
      } else {
        callback();
      }
    } else {
      // 新增
      setTimeout(() => {
        if (this.modelForm.password) {
          if (this.isChineseChar(this.modelForm.password)) {
            callback(new Error('登录密码格式有误，请重新输入'));
          } else {
            callback();
          }
        } else {
          callback(new Error('登录密码不能为空'));
        }
      }, 500);
    }
  }

  // 检测角色
  checkRole(rule: any, value: string, callback: Function) {
    if (value) {
      callback();
    } else {
      callback(new Error('专员角色不能为空'));
    }
  }

  // 验证登录账号
  checkUsername(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        workerExist({ userName: value }).then((res) => {
          this.phoneNumber = value;
          if (res.result.resultCode === '0') {
            const exp: any = /^1[0-9]{10}$/;
            if (exp.test(value)) {
              callback();
            } else {
              callback(new Error('安装员登录账号必须为手机号!!!'));
            }
          } else {
            callback(new Error('登录账号已存在'));
          }
        });
      } else {
        callback(new Error('登录账号不能为空'));
      }
    }, 500);
  }

  @Watch('data')
  onDataChange(data: any) {
    if (data.userId > 0) {
      this.modelForm.realName = data.realName;
      this.modelForm.username = data.userName;
      this.modelForm.remark = data.remark;
    }
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      realName: '',
      username: '',
      remark: '',
      password: '',
    };
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.clearValidate();
      From.resetFields();
      this.resetData();
    }, 300);
    this.loading = false;
  }

  isChineseChar(str: any) {
    const reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return reg.test(str);
  }

  onSubmit() {
    this.loading = true;
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    obj = {
      realName: this.modelForm.realName,
      username: this.modelForm.username,
      password: this.modelForm.password,
      remark: this.modelForm.remark,
    };
    From.validate((valid: any) => {
      if (valid) {
        if (this.title === '新增专员') {
          workerAdd(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                From.clearValidate();
                From.resetFields();
                this.resetData();
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
          // 修改
          obj.userId = this.data.userId;
          obj.userAppId = this.data.userAppId;
          if (obj.password === '') {
            delete obj.password;
          } else if (obj.password === '') {
            this.$message.error('密码不能为空！');
            this.loading = false;
            return false;
          }
          workerEdit(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                From.clearValidate();
                From.resetFields();
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
        }
      } else {
        this.loading = false;
        return false;
      }
      return false;
    });
  }

  change: boolean = false;

  render() {
    return (
      <el-dialog
        width="640px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} ref="modelForm" rules={this.rules} label-width="80px" class="fzkAddMember">
          <el-row>
            <el-col span={24}>
              <el-form-item label="专员姓名" prop="realName">
                <el-input
                  id="realName"
                  v-model={this.modelForm.realName}
                  placeholder="请输入专员姓名"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="登录账号" prop="username" rules={this.title === '新增专员' ? this.userNameRule : ''}>
                <el-input
                  id="username"
                  disabled={this.data.userId > 0}
                  v-model={this.modelForm.username}
                  placeholder="请输入登录账号"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="登录密码" prop="password" rules={this.passwordRule}>
                <el-input
                  id="password"
                  v-model={this.modelForm.password}
                  type="password"
                  placeholder="请输入登录密码"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="专员描述" prop="remark">
                <el-input
                  id="remark"
                  v-model={this.modelForm.remark}
                  type="textarea"
                  rows="2"
                  placeholder="请输入专员描述"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col offset={7} span={12}>
              <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>提交</el-button>
              <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-dialog>
    );
  }
}
