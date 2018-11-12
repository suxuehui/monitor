import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator';
import { Dialog, Row, Col, Form, FormItem, Input, Button, Select, Option } from 'element-ui';
import { checkOrgName, customerAdd, customerUpdate } from '@/api/customer';
import { terminalType } from '@/api/equipment';
import { getAllShopName } from '@/api/app';

import { userCheck } from '@/api/permission';
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
  }
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
    deviceType: '',
  };

  shopNameList: any = [];
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
        if (this.data.orgName !== value) {
          // 商户名变化重新判定
          checkOrgName(value).then((res) => {
            if (res.result.resultCode === '0') {
              callback();
            } else {
              callback(new Error('商户名已存在，请重新输入'));
            }
          });
        } else {
          // 商户名未变，直接通过
          callback();
        }
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

  created() {
    this.modelForm = JSON.parse(JSON.stringify(this.data));
    // 所有门店名称
    const obj: any = {
      name: '',
    };
    getAllShopName(obj).then((res) => {
      const { data } = res.data;
      if (res.status === 200) {
        data.forEach((item: any) => {
          this.shopNameList.push({
            label: item.name,
            value: `${item.levelCode}***${item.name}`,
          });
        });
      } else {
        this.$message.error(res.data.message);
      }
    });
    // 设备类型
    terminalType(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.forEach((item: any) =>
          this.typeList.push({
            key: Math.random(),
            value: parseInt(item.enumValue, 10),
            label: item.name,
          }));
        // 设备类型(全部)
        this.typeList.unshift({
          key: Math.random(),
          value: 999999999999,
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
      deviceType: '',
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
    obj = {
      orgName: this.modelForm.orgName ? this.modelForm.orgName : '',
      // orgName: this.nameAndLev.split('***')[1] ? this.nameAndLev.split('***')[1] : '',
      contactUser: this.modelForm.contactUser,
      contactPhone: this.modelForm.contactPhone,
      manageUser: this.modelForm.manageUser,
      password: this.modelForm.password,
      contactAddress: this.modelForm.contactAddress,
      // oldLevelCode: this.nameAndLev.split('***')[0],
      // deviceType: this.deviceType.join(','),
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
                // this.nameAndLev = '';
                // this.deviceType = [];
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

  remoteMethod(query: any) {
    if (query !== '') {
      this.selectLoading = true;
      setTimeout(() => {
        this.selectLoading = false;
        this.shopFilteredList = this.shopNameList.filter((item: any) =>
          item.label.indexOf(query) > -1);
      }, 200);
    } else {
      this.shopNameList = [];
    }
  }

  // 名字加levelCode
  nameAndLev: string = '';
  shopChecked(val: any) {
    this.nameAndLev = val;
  }
  deviceType: any = [];
  typeChecked(val: any) {
    this.deviceType = val;
    val.forEach((item: any) => {
      if (item === 999999999999) {
        this.deviceType = [3, 22, 23, 17, 16];
      }
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
              <el-form-item label="商户名称" prop="oldLevelCode" >
                <el-input
                  id="orgName"
                  v-model={this.modelForm.orgName}
                  disabled={this.title === '编辑商户'}
                  placeholder="请输入商户名称"
                ></el-input>
                {/* <el-select
                  id="oldLevelCode"
                  v-model={this.nameAndLev}
                  filterable={true}
                  remote={true}
                  placeholder="请选择商户"
                  remote-method={this.remoteMethod}
                  on-change={this.shopChecked}
                  loading={this.selectLoading}
                  style="width:100%">
                  {
                    this.shopFilteredList.map((item: any, index: number) => (
                      <el-option
                        key={index}
                        value={item.value}
                        label={item.label}
                      >{item.label}</el-option>
                    ))
                  }
                </el-select> */}
              </el-form-item>
            </el-col>
            {/* <el-col span={24}>
              <el-form-item label="设备同步" prop="deviceType">
                <el-select
                  id="deviceType"
                  v-model={this.deviceType}
                  filterable={true}
                  multiple={true}
                  placeholder="请选择设备类型"
                  style="width:100%"
                  on-change={this.typeChecked}
                >
                  {
                    this.typeList.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
              </el-form-item>
            </el-col> */}
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
