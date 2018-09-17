import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option } from 'element-ui';
import { roleSelect, userUpdate, userAdd, userCheck } from '@/api/permission';

interface RoleType { key: number, value: string, label: string }

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
  'el-option': Option
  }
  })
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;
  @Prop() private roleIds: any;

  created() {
    this.modelForm = JSON.parse(JSON.stringify(this.data));
  }
  modelForm: any = {
    realName: '',
    userName: '',
    roles: {},
    remark: '',
    password: '',
    roleIdList: [],
  };

  roleTypeList: RoleType[] = []
  isInstaller: boolean = false;
  isPhoneNumber: boolean = false;
  phoneNumber: string = '';
  noClick: boolean = false;

  loading: boolean = false;
  rules = {
    realName: [
      { required: true, message: '请输入成员姓名', trigger: 'blur' },
    ],
    // userName: [
    //   { validator: this.checkUsername, trigger: 'blur' },
    // ],
    // roleIdList: [
    //   { required: true, message: '请选择角色类型' },
    // ],
    password: [
      { required: true, message: '请输入登录密码', trigger: 'blur' },
    ],
    remark: [
      { required: false },
    ],
  }
  userNameRule = [
    { required: true, message: '请输入登录账号' },
    { validator: this.checkUsername, trigger: 'blur' },
  ];

  roleIdRule = [
    { required: true, message: '请选择角色类型', trigger: 'change' },
  ];

  // 验证登录账号
  checkUsername(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        userCheck(value).then((res) => {
          this.phoneNumber = value;
          if (res.result.resultCode === '0') {
            if (this.isInstaller) {
              const exp: any = /^[1][3,4,5,7,8][0-9]{9}$/;
              if (exp.test(value)) {
                callback();
              } else {
                callback(new Error('安装员登录账号必须为手机号'));
              }
            } else {
              callback();
            }
          } else {
            callback(new Error('登录账号已存在，不能为空'));
          }
        });
      } else {
        callback(new Error('登录账号不能为空'));
      }
    }, 500);
  }

  mounted() {
    roleSelect(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.forEach((item: any) => {
          item.key = parseInt(item.id, 10);
          item.value = item.id;
          item.label = item.roleName;
        });
        this.roleTypeList = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  @Watch('data')
  onDataChange(data: any) {
    if (this.data.id > 0) {
      this.modelForm = {};
      this.modelForm = JSON.parse(JSON.stringify(this.data));
      this.modelForm.roleIdList = this.data.IdList;
      this.modelForm.password = '********';
      this.isAdmin = this.data.IdList.toString() === '1';
      this.phoneNumber = this.data.userName;
    } else {
      this.resetData();
    }
  }
  isAdmin: boolean = false;

  // 重置数据
  resetData() {
    this.modelForm = {
      realName: '',
      userName: '',
      roleIdList: [],
      remark: '',
      password: '',
    };
    this.isAdmin = false;
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.clearValidate();
      From.resetFields();
    }, 200);
  }

  onSubmit() {
    this.loading = true;
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    obj = {
      roleIdList: this.modelForm.roleIdList.join(','),
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
          obj.userId = this.data.id;
          if (obj.password === '********') {
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
                From.clearValidate();
                From.resetFields();
                this.$message.success(res.result.resultMessage);
                this.$emit('refresh');
                this.isAdmin = false;
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

  selectChange(val: any) {
    this.change = !this.change;
    val.forEach((element: any) => {
      if (element === 3) {
        this.isInstaller = true;
        this.noClick = true;
      } else {
        this.isInstaller = false;
        this.noClick = false;
      }
    });
    if (this.isInstaller) {
      if (this.phoneNumber) {
        const exp: any = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (exp.test(this.phoneNumber)) {
          this.isPhoneNumber = true;
          this.noClick = false;
        } else {
          this.isPhoneNumber = false;
          this.noClick = true;
          this.$message.error('安装员登录账号必须为手机号,请重新输入');
        }
      }
    }
  }

  render() {
    return (
      <el-dialog
        width="630px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} status-icon ref="modelForm" rules={this.rules} label-width="80px" class="model">
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
            {
              this.isAdmin ?
                <el-col span={12}>
                  <el-form-item label="角色类型" prop="roleIdList1">
                    <el-input
                      id="roleIdList1"
                      disabled={true}
                      v-model={this.modelForm.roleNames}
                      placeholder="请输入角色类型"
                    ></el-input>
                  </el-form-item>
                </el-col> :
                <el-col span={12}>
                  <el-form-item label="角色类型" prop="roleIdList" rules={this.visible ? this.roleIdRule : null}>
                    <el-select
                      id="roleIdList"
                      v-model={this.modelForm.roleIdList}
                      multiple={true}
                      filterable={true}
                      disabled={this.data.id === 1}
                      on-change={this.selectChange}
                      placeholder={this.change ? '请选择角色类型' : '请选择角色类型'}
                      style="width:100%"
                    >
                      {
                        this.roleTypeList.map((item: any) => (
                          <el-option value={item.value} label={item.label} >{item.label}</el-option>
                        ))
                      }
                    </el-select>
                  </el-form-item>
                </el-col>
            }
            <el-col span={12}>
              <el-form-item label="登录账号" prop="userName" rules={this.data.id > 0 ? null : this.userNameRule}>
                <el-input
                  id="userName"
                  disabled={!!this.data.id}
                  v-model={this.modelForm.userName}
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
            <el-col span={24}>
              <el-form-item label="备注" prop="remark">
                <el-input
                  id="remark"
                  v-model={this.modelForm.remark}
                  type="textarea"
                  rows="2"
                  placeholder="请输入备注"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col offset={7} span={12}>
              <el-button size="small" type="primary" id="submit" disable={this.noClick} loading={this.loading} on-click={this.onSubmit}>提交</el-button>
              <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-dialog>
    );
  }
}
