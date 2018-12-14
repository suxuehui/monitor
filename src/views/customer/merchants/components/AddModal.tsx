import {
  Component, Prop, Vue, Watch, Emit,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Form, FormItem, Input, Button, Select, Option,
} from 'element-ui';
import { checkOrgName, customerAdd, customerUpdate } from '@/api/customer';
import { terminalType } from '@/api/equipment';
import { getAllShopName, getAllShopNameMoni } from '@/api/app';
import { userCheck } from '@/api/permission';
import './AddModal.less';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
    'el-select': Select,
    'el-option': Option,
  },
})
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;
  modelForm: any = {
    orgName: '',
    contactUser: '',
    manageUser: '',
    password: '',
    contactPhone: '',
    contactAddress: '',
    nameAndLev: '',
    deviceType: [],
  };

  shopFilteredList: any = [];
  typeList: any = [];

  loading: boolean = false;
  selectLoading: boolean = true;

  rules = {
    contactUser: [
      { required: true, message: '请输入联系人', trigger: 'blur' },
    ],
    contactPhone: [
      { required: true, message: '请输入联系电话', trigger: 'blur' },
    ],
    contactAddress: [
      { required: true, message: '请输入联系地址', trigger: 'blur' },
    ],
  }
  passwordRule = [
    {
      validator: this.checkPassword, trigger: 'blur',
    },
  ];
  @Emit()
  checkPassword(rule: any, value: string, callback: Function) {
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

  isChineseChar(str: any) {
    const reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return reg.test(str);
  }

  manageUserRule = [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    {
      validator: this.checkUsername, trigger: 'blur',
    },
  ]
  oldLevelCodeRule = [
    {
      validator: this.checkShopValue,
    },
  ]
  typeRule = [
    {
      validator: this.checkValue,
    },
  ]
  ruleStatus: boolean = true;

  checkShopValue(rule: any, value: string, callback: Function) {
    if (this.nameAndLev) {
      setTimeout(() => {
        callback();
      }, 200);
    } else {
      setTimeout(() => {
        callback(new Error('请选择商户'));
      }, 200);
    }
  }
  checkValue(rule: any, value: string, callback: Function) {
    if (this.deviceType) {
      setTimeout(() => {
        callback();
      }, 200);
    } else {
      setTimeout(() => {
        callback(new Error('请选择设备类型'));
      }, 200);
    }
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

  created() {
    this.modelForm = JSON.parse(JSON.stringify(this.data));
    // 设备类型
    terminalType(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.forEach((item: any) => this.typeList.push({
          key: Math.random(),
          value: item.enumValue,
          label: item.name,
        }));
        // 设备类型(全部)
        this.typeList.unshift({
          key: Math.random(),
          value: '1026',
          label: '全部',
        });
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  @Watch('data')
  onDataChange(data: any) {
    if (data.id > 0) {
      this.modelForm = JSON.parse(JSON.stringify(data));
      this.modelForm.password = '********';
      this.ruleStatus = false;
      this.deviceType = this.data.deviceType ? this.typeEdit(this.data.deviceType) : [];
      this.nameAndLev = `${this.data.orgName}`;
    } else {
      this.resetData();
    }
  }

  typeEdit(str: string) {
    let arr: any = [];
    if (str.split(',').length === this.typeList.length - 1) {
      arr = ['1026'];
    } else {
      arr = str.split(',');
    }
    return arr;
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
    this.nameAndLev = '';
    this.deviceType = [];
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
      this.ruleStatus = true;
      this.resetData();
    }, 200);
    this.loading = false;
  }

  onSubmit() {
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    this.loading = true;
    if (this.nameAndLev === '') {
      this.$message.error('请选择商户');
      return false;
    }
    if (this.deviceType.length === 0) {
      this.$message.error('请选择设备类型');
      return false;
    }
    obj = {
      orgName: this.nameAndLev.split('***')[1] ? this.nameAndLev.split('***')[1] : '',
      contactUser: this.modelForm.contactUser,
      contactPhone: this.modelForm.contactPhone,
      manageUser: this.modelForm.manageUser,
      password: this.modelForm.password,
      contactAddress: this.modelForm.contactAddress,
      oldLevelCode: this.nameAndLev.split('***')[0],
      deviceType: this.deviceType.indexOf('1026') > -1 ? '3,22,23,16,17' : this.deviceType.join(','),
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
                this.nameAndLev = '';
                this.deviceType = [];
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
          obj.orgName = this.data.orgName;
          obj.oldLevelCode = this.data.oldLevelCode;
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
    return true;
  }

  remoteMethod(query: any) {
    if (query !== '') {
      this.selectLoading = true;
      getAllShopNameMoni({ name: query }).then((res) => {
        if (res.result.resultCode === '0') {
          this.selectLoading = false;
          this.shopFilteredList = [];
          res.entity.forEach((item: any) => {
            this.shopFilteredList.push({
              label: item.name,
              value: `${item.levelCode}***${item.name}`,
            });
          });
        } else {
          this.selectLoading = false;
          this.shopFilteredList = [];
          this.$message.error(res.result.resultMessage);
        }
      });
    }
  }

  // 名字加levelCode
  nameAndLev: string = '';
  shopChecked(val: any) {
    this.nameAndLev = val;
  }
  deviceType: any = [];
  typeChecked(val: any) {
    if (val.length > 1) {
      if (val.indexOf('1026') > -1) {
        if (val[0] === '1026') {
          this.deviceType = val.slice(1, val.length);
        } else {
          this.deviceType = ['1026'];
        }
      } else {
        this.deviceType = val;
      }
    } else {
      this.deviceType = val;
    }
    this.modelForm.deviceType = this.deviceType;
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
        <el-form model={this.modelForm} rules={this.rules} ref="modelForm" label-width="80px" class="model">
          <el-row >
            <el-col span={24} class="shopName">
              <el-form-item label="商户名称" prop="oldLevelCode" rules={!this.ruleStatus ? null : this.oldLevelCodeRule}>
                <el-select
                  id="oldLevelCode"
                  v-model={this.nameAndLev}
                  filterable={true}
                  remote={true}
                  disabled={this.title !== '新增商户'}
                  placeholder="请选择商户"
                  remote-method={this.remoteMethod}
                  on-change={this.shopChecked}
                  loading={this.selectLoading}
                  style="width:100%">
                  {
                    this.shopFilteredList.map((item: any, index: number) => (
                      <el-option
                        id={item.value}
                        key={index}
                        value={item.value}
                        label={item.label}
                      >{item.label}</el-option>
                    ))
                  }
                </el-select>
                {
                  this.title === '新增商户' ? <span class="star1">*</span> : null
                }
              </el-form-item>
            </el-col>
            <el-col span={24} class="typeName">
              <el-form-item label="设备同步" prop="deviceType" rules={this.typeRule}>
                <el-select
                  id="deviceType"
                  v-model={this.deviceType}
                  filterable={true}
                  multiple={this.deviceType !== '1026'}
                  placeholder="请选择设备类型"
                  style="width:100%"
                  on-change={this.typeChecked}
                >
                  {
                    this.typeList.map((item: any) => (
                      <el-option
                        id={item.label}
                        value={item.value}
                        label={item.label}
                      >{item.label}</el-option>
                    ))
                  }
                </el-select>
                <span class="star2">*</span>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="登录账号" prop="manageUser" rules={!this.ruleStatus ? null : this.manageUserRule}>
                <el-input
                  id="manageUser"
                  v-model={this.modelForm.manageUser}
                  disabled={this.title !== '新增商户'}
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
