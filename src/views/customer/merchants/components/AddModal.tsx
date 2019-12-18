import {
  Component, Prop, Vue, Watch, Emit,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Form, FormItem, Input, Button, Select, Option, Radio, RadioGroup, Cascader,
} from 'element-ui';
import {
  customerAdd, customerUpdate, checkOrgName, customerSaveSub,
} from '@/api/customer';
import { terminalType, deviceModel } from '@/api/equipment';
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
    'el-cascader': Cascader,
  },
})
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  @Prop() private oldLevAndName: any;

  @Prop() private defaultDeviceType: any;

  modelForm: any = {
    orgName: '', // 添加的商户名
    manageUser: '', // 管理账号、登录账号
    password: '', // 密码
    mainAddr: '', // 主地址
    secondaryAddr: '', // 副地址
    mainAddrPort: '', // 主地址端口
    secondaryAddrPort: '', // 副地址端口
  };

  address: any = []; // 地址集合

  shopFilteredList: any = []; // 商户列表

  deviceTypeOptions: any = []; // 设备类型型号列表

  deviceTypeList: any = []; // 设备类型列表

  originDeviceTypeList: any = []; // 原始设备类型列表

  deviceProps: any = {
    multiple: true,
  };

  loading: boolean = false;

  selectLoading: boolean = true; // 筛选关联门店时的loading状态

  mounted() {
    this.setAddress();
    // 获取所有设备类型、型号
    deviceModel('ALL').then((res) => {
      const { entity, result } = res;
      if (result.resultCode === '0') {
        const list: any = [];
        entity.forEach((item: any, index: number) => {
          this.deviceTypeList.push({
            value: `${item.dictionary.enumValue}`,
            arr: [],
          });
          this.originDeviceTypeList = JSON.parse(JSON.stringify(this.deviceTypeList));
          if (item.terminalModelList.length > 0) {
            item.terminalModelList.forEach((it: any, ind: number) => {
              it.label = it.name;
              it.value = `${it.id}`;
            });
            list.push({
              value: item.dictionary.enumValue,
              label: item.dictionary.name,
              children: item.terminalModelList,
            });
          } else {
            list.push({
              value: item.dictionary.enumValue,
              label: item.dictionary.name,
            });
          }
        });
        this.deviceTypeOptions = JSON.parse(JSON.stringify(list));
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 设置address
  setAddress() {
    const deviceTypes = [{ name: 'OTU', value: '3' }, { name: 'BSJ', value: '23' }, { name: 'DTU', value: '20' }];
    deviceTypes.forEach((item: any) => {
      this.address.push({
        clientType: item.value,
        mainAddr: '', // 主地址
        secondaryAddr: '', // 副地址
        mainAddrPort: '', // 主地址端口
        secondaryAddrPort: '', // 副地址端口
      });
    });
  }

  @Watch('data')
  onDataChange(data: any) {
    if (data.id > 0) {
      if (this.title === '编辑商户') {
        // 编辑
        this.modelForm.orgName = data.orgName;
        this.modelForm.contactUser = data.contactUser;
        this.modelForm.manageUser = data.manageUser;
        this.nameAndLev = this.setFormat(this.oldLevAndName);
        this.reBootStatus = data.chgAddrAble === 2 ? '2' : '1';
        if (data.deviceType) {
          this.deviceStatus = '1';
          this.setShowDeviceType(data.deviceType);
        } else {
          this.deviceStatus = '2';
        }
        if (data.chgAddrAble === 1) {
          data.address.forEach((item: any) => {
            this.address.forEach((it: any) => {
              if (`${item.clientType}` === it.clientType) {
                it.mainAddr = item.mainAddr.split(':')[0];
                it.mainAddrPort = item.mainAddr.split(':')[1];
                it.secondaryAddr = item.secondaryAddr.split(':')[0];
                it.secondaryAddrPort = item.secondaryAddr.split(':')[1];
              }
            });
          });
        }
      }
    } else {
      // 新增
      this.resetData();
    }
  }

  setFormat(names: any) {
    const arr: any = names && names.indexOf(',') > -1 ? names.split(',') : [names];
    const nameArr: any = [];
    arr.forEach((item: any) => {
      if (item) {
        nameArr.push(item.split('****')[1]);
      }
    });
    return nameArr;
  }

  rules = {
    orgName: [
      { required: true, message: '请输入商户名称', trigger: 'blur' },
      {
        validator: this.checkOrgName, trigger: 'blur',
      },
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

  netMainPortRule = [
    // { required: true, message: '请输入端口', trigger: 'blur' },
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
   * @method 商户名称校验规则
   */
  @Emit()
  checkOrgName(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const obj: any = {
          orgName: value,
        };
        if (this.title !== '新增商户') {
          obj.orgId = this.data.id;
        }
        checkOrgName(obj).then((res) => {
          if (res.result.resultCode === '0') {
            callback();
          } else {
            callback(new Error('商户已存在，请重新输入'));
          }
        });
      } else {
        callback(new Error('商户名称不能为空'));
      }
    }, 500);
  }

  /**
   * @method 端口校验规则
   */
  @Emit()
  netMainPortValue(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      // console.log(value);
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
        callback(new Error('端口不能为空1'));
      }
    }, 500);
  }

  /**
   * @method 密码校验规则
   */
  @Emit()
  checkPassword(rule: any, value: string, callback: Function) {
    if (this.title === '编辑商户') {
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
    setTimeout(() => {
      if (this.nameAndLev.length > 0) {
        setTimeout(() => {
          callback();
        }, 100);
      } else {
        setTimeout(() => {
          callback(new Error('请选择商户'));
        }, 100);
      }
    }, 200);
  }

  /**
   * @method 设备类型规则
   */
  checkTypeValue(rule: any, value: string, callback: Function) {
    if (this.syncDeviceType) {
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
        const obj = {
          userName: value,
          appId: 2,
        };
        userCheck(obj).then((res) => {
          if (res.result.resultCode === '0') {
            if (res.entity) {
              callback(new Error('登录账号已存在，请重新输入'));
            } else {
              callback();
            }
          } else {
            callback(new Error('登录账号已存在，请重新输入'));
          }
        });
      } else {
        callback(new Error('登录账号不能为空'));
      }
    }, 500);
  }

  typeEdit(str: string) {
    return str.split(',');
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      orgName: '', // 添加的商户名
      manageUser: '', // 管理账号、登录账号
      password: '', // 密码
      mainAddr: '', // 主地址
      secondaryAddr: '', // 副地址
      mainAddrPort: '', // 主地址端口
      secondaryAddrPort: '', // 副地址端口
    };
    this.reBootStatus = '2';
    this.deviceStatus = '2';
    this.nameAndLev = []; // 关联门店
    this.syncDeviceType = [];
    this.address = [];
    this.setAddress();
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
      this.resetData();
      this.shopFilteredList = [];
    }, 200);
    this.loading = false;
  }

  // 分别获取旧系统中的商户名称以及对应levelcode
  getOldInfo() {
    let oldNames: any = [];
    let oldLevelCodes: any = [];
    this.nameAndLev.forEach((item: any) => {
      oldNames.push(
        item.split('***')[1],
      );
      oldLevelCodes.push(
        item.split('***')[0],
      );
    });
    oldNames = oldNames.join(',');
    oldLevelCodes = oldLevelCodes.join(',');
    return { oldNames, oldLevelCodes };
  }

  // 编辑时用于获取oldLevelCodes
  editGetOldInfo() {
    const oldShopNameArr: any = []; // 原本 4S商户名称
    const oldShopLevelCodeArr: any = []; // 原本 4S商户levelCode
    const arr: any = this.oldLevAndName && this.oldLevAndName.indexOf(',') > -1 ? this.oldLevAndName.split(',') : [this.oldLevAndName];
    arr.forEach((item: any) => {
      if (item) {
        oldShopLevelCodeArr.push(item.split('****')[0]);
        oldShopNameArr.push(item.split('****')[1]);
      }
    });
    const nameAndLevs: any = JSON.parse(JSON.stringify(this.nameAndLev)); // 编辑后关联商户数据
    const editOld: any = []; // 编辑后 原本 4S商户名称
    const editNew: any = []; // 编辑后 新加入 4S商户名称
    const editNewCodes: any = []; // 编辑后 新加入 4S商户名称
    nameAndLevs.forEach((item: any) => {
      if (item.indexOf('***') > -1) {
        editNew.push(item);
      }
      editOld.push(item);
    });
    // 得到新加入4s商户的levelcode值
    editNew.forEach((item: any) => {
      editNewCodes.push(
        item.split('***')[0],
      );
    });
    // 判断编辑前后原本设置的4S门店有无变化
    const changeArr = this.getArrDifference(oldShopNameArr, editOld); // 编辑前后改变的4S门店
    changeArr.forEach((item: any) => {
      if (oldShopNameArr.indexOf(item) > -1) {
        oldShopLevelCodeArr.splice(oldShopNameArr.indexOf(item), 1); // 去除已经被删除掉4S商户的levelcode值
      }
    });
    const endArr = oldShopLevelCodeArr.concat(editNewCodes);
    return endArr.join(',');
  }

  // 找出两个数组不同之处
  getArrDifference(arr1: any, arr2: any) {
    return arr1.concat(arr2).filter(
      (v: any, i: any, arr: any) => arr.indexOf(v) === arr.lastIndexOf(v),
    );
  }

  // 去除地址前后空格
  removeBlank(main: any, port: any) {
    const str1 = main.replace(/^\s*|\s*$/g, '');
    const str2 = port.replace(/^\s*|\s*$/g, '');
    return `${str1}:${str2}`;
  }

  addressChange() {
    const arr: any = []; // 填写正确的地址端口
    const numArr: any = []; // 每个地址端口相加的集合
    const portArr: any = []; // 保存各个地址端口情况
    let portStatus: boolean = true;
    this.address.forEach((item: any) => {
      if (item.mainAddr || item.mainAddrPort || item.secondaryAddr || item.secondaryAddrPort) {
        numArr.push(
          item.mainAddr + item.mainAddrPort + item.secondaryAddr + item.secondaryAddrPort,
        );
      }
      if (item.mainAddr && item.mainAddrPort && item.secondaryAddr && item.secondaryAddrPort) {
        arr.push({
          clientType: item.clientType,
          mainAddr: this.removeBlank(item.mainAddr, item.mainAddrPort),
          secondaryAddr: this.removeBlank(item.secondaryAddr, item.secondaryAddrPort),
        });
        portArr.push(item.mainAddrPort, item.secondaryAddrPort);
      }
    });
    portArr.forEach((it: any) => {
      if (!this.isNumber(it)) {
        portStatus = false;
      }
    });
    return {
      arr, numArr, portArr, portStatus,
    };
  }

  onSubmit() {
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    this.loading = true;
    if (this.nameAndLev === []) {
      this.$message.error('请选择商户');
      this.loading = false;
      return false;
    }
    // 如果选择了切换地址，必须填写一个完整的地址端口
    if (this.reBootStatus === '1' && this.addressChange().arr.length === 0) {
      this.$message.error('至少填写一个完整的切换地址！');
      this.loading = false;
      return false;
    }
    // 完整地址端口数量和填写了数据的地址端口数量不一致，表明存在数据不全情况
    if (this.addressChange().arr.length !== this.addressChange().numArr.length) {
      this.$message.error('地址端口填写不完整，请修改');
      this.loading = false;
      return false;
    }
    let flag = true;
    const arr = JSON.parse(JSON.stringify(this.addressChange().arr));
    arr.forEach((item: any) => {
      if (/[\u4E00-\u9FA5]/g.test(item.mainAddr) || /[\u4E00-\u9FA5]/g.test(item.secondaryAddr)) {
        this.$message.error('地址不能填写中文，请修改');
        this.loading = false;
        flag = false;
        return false;
      }
    });
    if (!this.addressChange().portStatus) {
      this.$message.error('端口填写不正确，请确认');
      this.loading = false;
      return false;
    }
    if (!flag) {
      this.loading = false;
      return false;
    }
    const addressObj = this.addressChange().arr;
    obj = {
      orgName: this.modelForm.orgName, // 添加的商户名
      manageUser: this.modelForm.manageUser, // 账号
      password: this.modelForm.password, // 密码
      chgAddrAble: this.reBootStatus, // 是否切换服务地址
      address: addressObj,
    };
    if (this.deviceStatus === '1') {
      const strArr: any = [];
      this.deviceTypeList = JSON.parse(JSON.stringify(this.originDeviceTypeList));
      this.deviceTypeList.forEach((item: any) => {
        this.syncDeviceType.forEach((it: any) => {
          if (item.value === it[0]) {
            item.arr.push(it[1]);
          }
        });
        if (item.arr.length > 0) {
          strArr.push(`${item.value}:${item.arr.join(',')}`);
        }
      });
      obj.deviceType = `${strArr.join(';')};`;
    } else {
      obj.deviceType = '';
    }
    if (obj.deviceType === ';') {
      this.$message.error('同步设备类型不能为空');
      this.loading = false;
      return false;
    }
    From.validate((valid: any) => {
      if (valid) {
        if (this.title === '新增商户') {
          if (obj.chgAddrAble === '2') {
            delete obj.address;
          }
          obj.oldLevelCode = this.getOldInfo().oldLevelCodes;
          console.log(obj);
          customerAdd(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.nameAndLev = '';
                this.syncDeviceType = [];
                this.shopFilteredList = [];
                this.$emit('refresh');
              }, 500);
            } else {
              setTimeout(() => {
                this.loading = false;
                this.$message.error(res.result.resultMessage);
              }, 1000);
            }
          });
        } else if (this.title === '新增部门') {
          if (obj.chgAddrAble === '2') {
            delete obj.address;
          }
          obj.oldLevelCode = this.getOldInfo().oldLevelCodes;
          obj.orgId = this.data.id;
          console.log(obj);
          customerSaveSub(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.nameAndLev = '';
                this.syncDeviceType = [];
                this.shopFilteredList = [];
                this.$emit('refresh');
              }, 500);
            } else {
              setTimeout(() => {
                this.loading = false;
                this.$message.error(res.result.resultMessage);
              }, 1000);
            }
          });
        } else {
          obj.id = this.data.id;
          if (obj.password === '') {
            delete obj.password;
          }
          if (obj.chgAddrAble === '2') {
            delete obj.address;
          }
          obj.oldLevelCode = this.editGetOldInfo();
          if (obj.oldLevelCode === '') {
            this.$message.error('请选择商户');
            this.loading = false;
            return false;
          }
          console.log(obj);
          customerUpdate(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.resetData();
                this.shopFilteredList = [];
                this.$emit('refresh');
              }, 500);
            } else {
              setTimeout(() => {
                this.loading = false;
                this.$message.error(res.result.resultMessage);
              }, 500);
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
      this.shopFilteredList = [];
      this.selectLoading = true;
      getAllShopNameMoni({ name: query }).then((res) => {
        if (res.result.resultCode === '0') {
          this.selectLoading = false;
          const shopArr: any = [];
          res.entity.forEach((item: any) => {
            shopArr.push({
              label: item.name,
              value: `${item.levelCode}***${item.name}`,
            });
          });
          this.shopFilteredList = shopArr.concat(this.shopFilteredList);
          this.nameAndLev = this.nameAndLev;
        } else {
          this.selectLoading = false;
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

  shopNameInput(val: any) {
    // console.log(val);
  }

  reBootStatus: string = '2'; // 切换地址

  rebootChange(data: any) {
    this.reBootStatus = data;
  }

  deviceStatus: string = '2'; // 同步设备类型型号

  // 切换设备同步类型选项 1自定义 2默认
  deviceChange(data: any) {
    this.deviceStatus = data;
    if (data === '1') {
      this.setShowDeviceType(this.defaultDeviceType);
    }
  }

  // 设置默认展示设备类型
  setShowDeviceType(data: any) {
    const arr: any = data.split(';');
    const arr1: any = [];
    arr.forEach((item: any) => {
      if (item) {
        const arr2 = item.split(':');
        if (arr2[1] && arr2[1].indexOf(',') > -1) {
          const arr3 = arr2[1].split(',');
          arr3.forEach((it: any) => {
            arr1.push([
              `${arr2[0]}`, it,
            ]);
          });
        } else {
          arr1.push([
            `${arr2[0]}`, arr2[1],
          ]);
        }
      }
    });
    this.syncDeviceType = JSON.parse(JSON.stringify(arr1));
  }

  // 设备类型设置
  syncDeviceType: any = [];

  typeChecked(val: any) { }

  deviceTypeChange(val: any) {
    // console.log(val);
  }

  // 数组去重
  arrUnique(arr: any) {
    return Array.from(new Set(arr));
  }

  renderDeviceAddress() {
    const deviceTypes = [{ name: 'OTU', value: '3' }, { name: 'BSJ', value: '23' }, { name: 'DTU', value: '20' }];
    const obj: any = [];
    deviceTypes.forEach((item: any, index: number) => {
      obj.push(
        <el-col span={24}>
          <el-col span={2}>
            <div class="deviceTypeName">{item.name}</div>
          </el-col>
          <el-col span={7} style="marginLeft:-20px">
            <el-form-item
              label="主地址"
              prop="mainAddr"
            >
              <el-input
                id={`mainAddr${index}`}
                v-model={this.address[index].mainAddr}
                placeholder="请输入地址"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col span={4}>
            <el-form-item
              label="端口"
              prop="mainAddrPort"
              label-width={'60px'}
            >
              <el-input
                id={`mainAddrPort${index}`}
                v-model={this.address[index].mainAddrPort}
                placeholder="请输入端口"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col span={7}>
            <el-form-item
              label="副地址"
              prop="secondaryAddr"
            >
              <el-input
                id={`secondaryAddr${index}`}
                v-model={this.address[index].secondaryAddr}
                placeholder="请输入地址"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col span={4}>
            <el-form-item
              label="端口"
              prop="secondaryAddrPort"
              label-width={'60px'}
            >
              <el-input
                id={`secondaryAddrPort${index}`}
                v-model={this.address[index].secondaryAddrPort}
                placeholder="请输入端口"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-col>,
      );
    });
    return obj;
  }

  render() {
    return (
      <el-dialog
        width="850px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} rules={this.rules} ref="modelForm" label-width="80px" class="merchants-model">
          <el-row >
            <el-col span={12}>
              <el-form-item
                label="登录账号"
                prop="manageUser"
                rules={this.title === '新增商户' || this.title === '新增部门' ? this.manageUserRule : null}
              >
                <el-input
                  id="manageUser"
                  v-model={this.modelForm.manageUser}
                  disabled={this.title !== '新增商户' && this.title !== '新增部门'}
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
            <el-col class="shopName">
              <el-form-item
                label="关联门店"
                prop="oldLevelCode"
                rules={this.title === '新增商户' ? this.oldLevelCodeRule : null}
              >
                <el-select
                  id="oldLevelCode"
                  v-model={this.nameAndLev}
                  filterable={true}
                  remote={true}
                  placeholder="请输入门店名称进行查询"
                  multiple={true}
                  remote-method={this.remoteMethod}
                  on-change={this.shopChecked}
                  on-blur={this.shopNameInput}
                  loading-text={'查询中...'}
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
                <span class="star1">*</span>
              </el-form-item>
            </el-col>
            <el-col class="typeName">
              <el-form-item label="设备同步" prop="syncDeviceType" rules={this.typeRule}>
                <div class='deviceTypeGroup'>
                  <div class="deviceGroup">
                    <el-radio-group
                      v-model={this.deviceStatus}
                      on-change={this.deviceChange}
                    >
                      <el-radio id="availableY" label="2">默认</el-radio>
                      <el-radio id="availableN" label="1">自定义</el-radio>
                    </el-radio-group>
                  </div>
                  {
                    this.deviceStatus === '1' ? <el-cascader
                      style='flex: 3;height: 30px'
                      props={this.deviceProps}
                      collapse-tags
                      clearable
                      options={this.deviceTypeOptions}
                      v-model={this.syncDeviceType}
                      placeholder="请选择设备型号类型"
                      on-change={this.deviceTypeChange}>
                    </el-cascader> : <div style='flex:3;opacity:0;height:30px'></div>
                  }
                  <span class="star2">*</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="切换地址" prop="reboot" class="isStart">
                <div class="radioGroup">
                  <el-radio-group
                    v-model={this.reBootStatus}
                    on-change={this.rebootChange}
                  >
                    <el-radio id="availableY" label="2">不切换</el-radio>
                    <el-radio id="availableN" label="1">切换</el-radio>
                  </el-radio-group>
                </div>
                <span class="star2">*</span>
                <p class="reStart">( 验收合格的设备是否支持服务器地址切换功能 )</p>
              </el-form-item>
            </el-col>
            {
              this.reBootStatus === '1' ? this.renderDeviceAddress() : null
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
