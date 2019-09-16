import {
  Component, Prop, Vue, Watch, Emit,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option,
} from 'element-ui';
import { userUpdate, userAdd, userCheck } from '@/api/permission';
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

  @Prop() private roleList: any;

  modelForm: any = {
    realName: '',
    userName: '',
    roles: {},
    remark: '',
    password: '',
    roleIdList: [],
  };

  roleAddList: any = [];

  phoneNumber: string = '';

  loading: boolean = false;

  rules = {
    realName: [
      { required: true, message: '请输入成员姓名', trigger: 'blur' },
      { validator: this.checkRealName, trigger: 'blur' },
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

  roleIdRule = [
    { required: true, message: '请选择角色类型', trigger: 'change' },
  ];

  @Emit()
  checkRealName(rule: any, value: string, callback: Function) {
    if (value.length > 16) {
      callback(new Error('登录密码格式有误，请重新输入'));
    } else {
      callback();
    }
  }

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
      callback(new Error('成员角色不能为空'));
    }
  }

  // 验证登录账号
  checkUsername(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        userCheck({ userName: value, appId: 1 }).then((res) => {
          this.phoneNumber = value;
          if (res.result.resultCode === '0') {
            if (res.entity) {
              callback(new Error('登录账号已存在'));
            } else {
              callback();
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
      this.resetData();
      if (data.selectList) {
        data.selectList.forEach((item: any) => {
          this.roleAddList.push({
            value: item.id,
            label: item.roleName,
          });
        });
      } else {
        this.roleAddList = [];
      }
      this.modelForm.roleIdList = data.roleIdList ? data.roleIdList : [];
      this.modelForm.realName = data.realName;
      this.modelForm.userName = data.userName;
      this.modelForm.remark = data.remark;
      // this.modelForm.password = '********';
      this.phoneNumber = data.userName;
      this.roleLen = data.roleIdList ? data.roleIdList.length : 0;
    }
  }

  // 编辑时角色数组长度
  roleLen: number = 0;

  selectChange(val: any) {
    this.change = !this.change;
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      realName: '',
      userName: '',
      roleIdList: [],
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
      this.roleAddList = [];
    }, 600);
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
      roleIdList: this.modelForm.roleIdList ? this.modelForm.roleIdList.join(',') : '',
      realName: this.modelForm.realName,
      username: this.modelForm.userName,
      password: this.modelForm.password,
      remark: this.modelForm.remark,
    };
    From.validate((valid: any) => {
      if (valid) {
        if (this.title === '新增成员') {
          userAdd(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.modelForm.roleIdList = [];
                From.clearValidate();
                From.resetFields();
                this.roleAddList = [];
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
          if (!this.modelForm.roleIdList || this.modelForm.roleIdList.length === 0) {
            this.$message.error('成员角色不能为空！');
            this.loading = false;
            return false;
          }
          if (obj.password === '') {
            delete obj.password;
          } else if (obj.password === '') {
            this.$message.error('密码不能为空！');
            this.loading = false;
            return false;
          }
          userUpdate(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.modelForm.roleIdList = [];
                this.roleAddList = [];
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
        width="700px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} ref="modelForm" rules={this.rules} label-width="80px" class="fzkAddMember">
          <el-row>
            <el-col span={12}>
              <el-form-item label="成员姓名" prop="realName">
                <el-input
                  id="realName"
                  v-model={this.modelForm.realName}
                  placeholder="请输入成员姓名"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="角色类型" prop="roleIdList" rules={this.visible ? this.roleIdRule : null}>
                <el-select
                  id="roleIdList"
                  v-model={this.modelForm.roleIdList}
                  multiple={true}
                  filterable={true}
                  on-change={this.selectChange}
                  placeholder={this.change ? '请选择角色类型' : '请选择角色类型'}
                  style="width:100%"
                >
                  {
                    this.title === '新增成员' ? this.roleList.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    )) : this.roleAddList.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="登录账号" prop="userName" rules={this.data && this.data.userId > 0 ? null : this.userNameRule}>
                <el-input
                  id="userName"
                  disabled={!!this.data.userId}
                  v-model={this.modelForm.userName}
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
              <el-form-item label="成员描述" prop="remark">
                <el-input
                  id="remark"
                  v-model={this.modelForm.remark}
                  type="textarea"
                  rows="2"
                  placeholder="请输入成员描述"
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
