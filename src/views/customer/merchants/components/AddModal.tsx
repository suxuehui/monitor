import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator';
import { Dialog, Row, Col, Form, FormItem, Input, Button } from 'element-ui';
import { checkOrgName, customerAdd, customerUpdate } from '@/api/customer';

import { userCheck } from '@/api/permission';
import { emit } from 'cluster';
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
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;
  created() {
    this.modelForm = JSON.parse(JSON.stringify(this.data));
  }
  modelForm: any = {
    orgName: '',
    contactUser: '',
    manageUser: '',
    password: '',
    contactPhone: '',
    contactAddress: '',
  };

  loading: boolean = false;

  rules = {
    contactUser: [
      { required: true, message: '请输入联系人', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入登录密码', trigger: 'blur' },
    ],
    contactPhone: [
      { required: true, message: '请输入联系电话', trigger: 'blur' },
    ],
    contactAddress: [
      { required: true, message: '请输入联系地址', trigger: 'blur' },
    ],
  }
  orgRule = [
    { required: true, message: '请输入商户名称', trigger: 'blur' },
    {
      validator: this.checkName, trigger: 'blur',
    },
  ];
  manageUserRule = [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    {
      validator: this.checkUsername, trigger: 'blur',
    },
  ]
  ruleStatus: boolean = true;

  // 验证商户名称
  @Emit()
  checkName(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        checkOrgName(value).then((res) => {
          if (res.result.resultCode === '0') {
            callback();
          } else {
            callback(new Error('商户名已存在，请重新输入'));
          }
        });
      } else {
        callback(new Error('商户名不能为空'));
      }
    }, 500);
  }
  // 验证登录账号
  @Emit()
  checkUsername(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        userCheck(value).then((res) => {
          if (res.result.resultCode === '0') {
            callback();
          } else {
            callback(new Error('登录账号已存在，请重新输入'));
          }
        });
      } else {
        callback(new Error('登录账号不能为空'));
      }
    }, 500);
  }

  @Watch('data')
  onDataChange(data: any) {
    if (data.id > 0) {
      this.modelForm = JSON.parse(JSON.stringify(data));
      this.modelForm.password = '********';
      this.ruleStatus = false;
    } else {
      this.resetData();
    }
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      orgName: '',
      contactUser: '',
      manageUser: '',
      password: '',
      contactPhone: '',
      contactAddress: '',
    };
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
      this.ruleStatus = true;
      this.resetData();
    }, 200);
  }

  onSubmit() {
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    this.loading = true;
    obj = {
      orgName: this.modelForm.orgName ? this.modelForm.orgName : '',
      contactUser: this.modelForm.contactUser,
      contactPhone: this.modelForm.contactPhone,
      manageUser: this.modelForm.manageUser,
      password: this.modelForm.password,
      contactAddress: this.modelForm.contactAddress,
    };
    From.validate((valid: any) => {
      if (valid) {
        if (this.title === '新增商户') {
          // 新增
          customerAdd(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.ruleStatus = true;
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
          obj.id = this.data.id;
          if (obj.password === '********') {
            delete obj.password;
          }
          customerUpdate(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.ruleStatus = true;
                this.resetData();
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

  render() {
    return (
      <el-dialog
        width="700px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="model">
          <el-row>
            <el-col span={24}>
              <el-form-item label="商户名称" prop="orgName" rules={!this.ruleStatus ? null : this.orgRule}>
                <el-input
                  id="orgName"
                  v-model={this.modelForm.orgName}
                  disabled={this.title === '编辑商户'}
                  placeholder="请输入商户名称"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="登录账号" prop="manageUser" rules={!this.ruleStatus ? null : this.manageUserRule}>
                <el-input
                  id="manageUser"
                  v-model={this.modelForm.manageUser}
                  disabled={this.title === '编辑商户'}
                  placeholder="请输入登录账号"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="登录密码" prop="password">
                <el-input
                  id="password"
                  v-model={this.modelForm.password}
                  type="password"
                  placeholder="请输入登录密码"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="联系人" prop="contactUser">
                <el-input
                  id="contactUser"
                  v-model={this.modelForm.contactUser}
                  placeholder="请输入联系人"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input
                  id="contactPhone"
                  v-model={this.modelForm.contactPhone}
                  placeholder="请输入联系电话"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="联系地址" prop="contactAddress">
                <el-input
                  id="contactAddress"
                  v-model={this.modelForm.contactAddress}
                  placeholder="请输入联系地址"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-row>
          <el-col offset={7} span={12}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>提交</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
