import {
  Component, Prop, Vue, Watch, Emit,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Form, FormItem, Input, Button, Select, Option, Radio, RadioGroup,
} from 'element-ui';
import { customerAdd, customerUpdate } from '@/api/customer';
import { terminalType } from '@/api/equipment';
import { getAllShopNameMoni } from '@/api/app';
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
    'el-radio': Radio,
    'el-radio-group': RadioGroup,
  },
})
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  @Prop() private oldShopName: any;

  modelForm: any = {
    orgName: '', // 添加的商户名
    manageUser: '', // 管理账号、登录账号
    password: '', // 密码
    nameAndLev: [], // 关联门店
    deviceType: [], // 设备类型
    mainAddr: '', // 主地址
    secondaryAddr: '', // 副地址
    mainAddrPort: '', // 主地址端口
    secondaryAddrPort: '', // 副地址端口
  };

  shopFilteredList: any = []; // 商户列表

  typeList: any = []; // 设备类型

  loading: boolean = false;

  selectLoading: boolean = true; // 筛选关联门店时的loading状态

  created() {
    // this.modelForm = JSON.parse(JSON.stringify(this.data));
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
      // 编辑
      this.modelForm = {
        orgName: data.orgName,
        contactUser: data.contactUser,
        manageUser: data.manageUser,
        contactPhone: data.contactPhone,
        contactAddress: data.contactAddress,
        password: '********', // 编辑时设置默认密码为********
      };
      this.deviceType = this.data.deviceType ? this.typeEdit(this.data.deviceType) : [];
      this.nameAndLev = `${this.data.orgName}`;
      this.reBootStatus = data.chgDevAddr === 0 ? '2' : '1';
    } else {
      // 新增
      this.resetData();
    }
  }

  rules = {
    orgName: [
      { required: true, message: '请输入商户名称', trigger: 'blur' },
    ],
    rebootRule: [
      { required: true, message: '请选择时候切换' },
    ],
  }

  passwordRule = [
    {
      validator: this.checkPassword, trigger: 'blur',
    },
  ];

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
      validator: this.checkTypeValue,
    },
  ]

  netAddressRule = [
    { required: true, message: '请输入地址', trigger: 'blur' },
  ]

  netMainPortRule = [
    { required: true, message: '请输入端口', trigger: 'blur' },
    {
      validator: this.netMainPortValue,
    },
  ]

  netSecondPortRule = [
    { required: true, message: '请输入端口', trigger: 'blur' },
    {
      validator: this.netSecondPortValue,
    },
  ]

  /**
   * @method 端口校验规则
   */
  @Emit()
  netMainPortValue(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (this.modelForm.mainAddrPort) {
        if (!this.isNumber(this.modelForm.mainAddrPort)) {
          callback(new Error('端口输入错误，请重新输入'));
        } else {
          callback();
        }
      } else {
        callback(new Error('端口不能为空'));
      }
    }, 500);
  }

  /**
  * @method 端口校验规则
  */
  @Emit()
  netSecondPortValue(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (this.modelForm.secondaryAddrPort) {
        if (!this.isNumber(this.modelForm.secondaryAddrPort)) {
          callback(new Error('端口输入错误，请重新输入'));
        } else {
          callback();
        }
      } else {
        callback(new Error('端口不能为空'));
      }
    }, 500);
  }

  /**
   * @method 密码校验规则
   */
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

  /**
   * @method 中文校验规则
   */
  isChineseChar(str: any) {
    const reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return reg.test(str);
  }

  /**
  * @method 数字校验规则
  */
  isNumber(str: any) {
    const reg = /^[0-9]{1,20}$/;
    return reg.test(str);
  }

  /**
   * @method 商户验证规则
   */
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

  /**
   * @method 设备类型规则
   */
  checkTypeValue(rule: any, value: string, callback: Function) {
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

  /**
   * @method 登录账号规则
   */
  @Emit()
  checkUsername(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        if (!this.isChineseChar(value)) {
          userCheck(value).then((res) => {
            if (res.result.resultCode === '0') {
              callback();
            } else {
              callback(new Error('登录账号已存在，请重新输入'));
            }
          });
        } else {
          callback(new Error('登录账号不能为中文，请重新输入'));
        }
      } else {
        callback(new Error('登录账号不能为空'));
      }
    }, 500);
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
      orgName: '', // 添加的商户名
      manageUser: '', // 管理账号、登录账号
      password: '', // 密码
      nameAndLev: [], // 关联门店
      deviceType: [], // 设备类型
      mainAddr: '', // 主地址
      secondaryAddr: '', // 副地址
      mainAddrPort: '', // 主地址端口
      secondaryAddrPort: '', // 副地址端口
    };
    this.reBootStatus = '2';
    this.nameAndLev = [];
    this.deviceType = [];
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
      this.resetData();
    }, 200);
    this.loading = false;
  }

  // 分别获取旧系统中的商户名称以及对应levelcode
  getOldInfo() {
    let oldNames: any = [];
    let oldLevelCodes: any = [];
    this.nameAndLev.forEach((item: any) => {
      oldNames.push(
        item.split('***')[1]
      );
      oldLevelCodes.push(
        item.split('***')[0]
      );
    })
    oldNames = oldNames.join(',');
    oldLevelCodes = oldLevelCodes.join(',');
    return { oldNames, oldLevelCodes };
  }

  onSubmit() {
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    this.loading = true;
    if (this.nameAndLev === []) {
      this.$message.error('请选择商户');
      return false;
    }
    if (this.deviceType.length === 0) {
      this.$message.error('请选择设备类型');
      return false;
    }
    obj = {
      orgName: this.modelForm.orgName, // 添加的商户名
      manageUser: this.modelForm.manageUser, // 账号
      password: this.modelForm.password, // 密码
      // oldLevelCode: this.getOldInfo().oldLevelCodes, // 旧系统中商户的levelcode
      deviceType: this.deviceType.indexOf('1026') > -1 ? '3,22,23,16,17' : this.deviceType.join(','), // 设备类型
      chgAddrAble: this.reBootStatus, // 是否切换服务地址
      mainAddr: `${this.modelForm.mainAddr}:${this.modelForm.mainAddrPort}`, // 主地址
      secondaryAddr: `${this.modelForm.secondaryAddr}:${this.modelForm.secondaryAddrPort}`, // 副地址端口
    };
    From.validate((valid: any) => {
      if (valid) {
        if (this.title === '新增商户') {
          if (obj.chgAddrAble === '2') {
            delete obj.mainAddr;
            delete obj.secondaryAddr;
          }
          obj.oldLevelCode = this.getOldInfo().oldLevelCodes;
          // 新增
          customerAdd(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.nameAndLev = '';
                this.deviceType = [];
                this.$emit('refresh');
              }, 1500);
            } else {
              setTimeout(() => {
                this.loading = false;
                this.$message.error(res.result.resultMessage);
              }, 1000);
            }
          });
        } else {
          obj.id = this.data.id;
          if (obj.password === '********') {
            delete obj.password;
          }
          if (obj.chgAddrAble === '2') {
            delete obj.mainAddr;
            delete obj.secondaryAddr;
          }
          obj.orgName = this.data.orgName;
          obj.oldLevelCode = this.data.oldLevelCode;
          console.log(obj);
          customerUpdate(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
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

  // 搜索商户
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

  // 名字加levelCode 多个门店
  nameAndLev: any = [];

  shopChecked(val: any) {
    this.nameAndLev = val;
  }

  // 切换地址
  reBootStatus: string = '2';

  rebootChange(data: any) {
    this.reBootStatus = data;
  }

  // 设备类型设置
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
        <el-form model={this.modelForm} rules={this.rules} ref="modelForm" label-width="80px" class="merchants-model">
          <el-row >
            <el-col span={12}>
              <el-form-item label="登录账号" prop="manageUser" rules={this.title === '新增商户' ? this.manageUserRule : null}>
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
            <el-col>
              <el-form-item label="商户名称" prop="orgName">
                <el-input
                  id="orgName"
                  v-model={this.modelForm.orgName}
                  placeholder="请输入商户名称"
                ></el-input>
              </el-form-item>
            </el-col>
            {
              this.title === '编辑商户'
                ? <el-col>
                  <el-form-item label="关联门店" prop="oldLevelCode">
                    <el-input
                      id="oldLevelCode"
                      v-model={this.oldShopName}
                      disabled={true}
                      placeholder="请输入商户名称"
                    ></el-input>
                  </el-form-item>
                </el-col> :
                <el-col class="shopName">
                  <el-form-item label="关联门店" prop="oldLevelCode" rules={this.title === '新增商户' ? this.oldLevelCodeRule : null}>
                    <el-select
                      id="oldLevelCode"
                      v-model={this.nameAndLev}
                      filterable={true}
                      remote={true}
                      disabled={this.title !== '新增商户'}
                      placeholder="请选择商户"
                      multiple={true}
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
            }
            <el-col class="typeName">
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
            <el-col span={24}>
              <el-form-item label="切换地址" prop="reboot" class="isStart">
                <div class="radioGroup">
                  <el-radio-group v-model={this.reBootStatus} on-change={this.rebootChange}>
                    <el-radio id="availableY" label="2">不切换</el-radio>
                    <el-radio id="availableN" label="1">切换</el-radio>
                  </el-radio-group>
                </div>
                <span class="star2">*</span>
                <p class="reStart">( 验收合格的设备是否支持服务器地址切换功能 )</p>
              </el-form-item>
            </el-col>
            {
              this.reBootStatus === '1'
                ? <div>
                  <el-col span={12}>
                    <el-form-item
                      label="主地址"
                      prop="mainAddr"
                      rules={this.netAddressRule}>
                      <el-input
                        id="mainAddr"
                        v-model={this.modelForm.mainAddr}
                        placeholder="请输入地址"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col span={12}>
                    <el-form-item
                      label="端口"
                      prop="mainAddrPort"
                      rules={this.netMainPortRule}>
                      <el-input
                        id="mainAddrPort"
                        v-model={this.modelForm.mainAddrPort}
                        placeholder="请输入端口"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col span={12}>
                    <el-form-item
                      label="副地址"
                      prop="secondaryAddr"
                      rules={this.netAddressRule}>
                      <el-input
                        id="secondaryAddr"
                        v-model={this.modelForm.secondaryAddr}
                        placeholder="请输入地址"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col span={12}>
                    <el-form-item
                      label="端口"
                      prop="secondaryAddrPort"
                      rules={this.netSecondPortRule}>
                      <el-input
                        id="secondaryAddrPort"
                        v-model={this.modelForm.secondaryAddrPort}
                        placeholder="请输入端口"
                      ></el-input>
                    </el-form-item>
                  </el-col>
                </div> : null
            }
          </el-row>
        </el-form>
        <div style={{ textAlign: 'center' }}>
          <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>提交</el-button>
          <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
        </div>
      </el-dialog>
    );
  }
}
