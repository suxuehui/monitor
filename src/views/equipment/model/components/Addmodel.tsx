import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option, Radio, RadioGroup } from 'element-ui';
import { configAdd, configUpdate } from '@/api/config';

import './Addmodel.less';
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
  'el-radio': Radio,
  'el-radio-group': RadioGroup,
  }
  })
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  modelForm: any = {
    cfgName: '',
    reboot: '1',
    cfgParam: '',
    cfgParamAdd: [],
    remark: '',
    productCode: '',
  };
  loading: boolean = false;

  rules = {
    cfgName: [
      { required: true, message: '请输入配置名称', trigger: 'blur' },
    ],
    // cfgParam: [
    //   { required: true, message: '请输入配置参数', trigger: 'blur' },
    // ],
    reboot: [
      { required: false, message: '请确认是否重启' },
    ],
    remark: [
      { required: false },
    ],
    productCode: [
      { required: true, message: '请输入产品编码', trigger: 'blur' },
    ],
  }
  cfgParamRule = [
    { required: true, message: '请输入配置参数', trigger: 'blur' },
    {
      validator: this.checkCfgParam, trigger: 'blur', message: '配置参数格式错误，请重新输入',
    },
  ]

  // 验证配置参数
  checkCfgParam(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const exp: any = /^[1357]{1}\|{1}[0-9a-zA-Z]+,{1}[^\u4e00-\u9fa5，！、·‘；】【、。，’]+$/;
        if (exp.test(value)) {
          callback();
        } else {
          callback(new Error());
        }
      } else {
        callback(new Error('不能为空'));
      }
    }, 500);
  }


  @Watch('data')
  onDataChange(data: any) {
    if (this.data.id > 0) {
      const obj = JSON.parse(JSON.stringify(this.data));
      // 配置参数
      const cfgParamStr = obj.cfgParam.replace(/\["|"]/g, '');
      const cfgParamArr = cfgParamStr.split('","');
      const cfgParamAddArr = cfgParamStr.split('","').slice(1);
      const cfgParamAddArrEnd: any = [];
      cfgParamAddArr.map((item: any, key: number) => cfgParamAddArrEnd.push({
        value: item,
        key,
      }));
      this.modelForm = {
        cfgName: obj.cfgName,
        remark: obj.remark,
        productCode: obj.productCode,
        cfgParam: cfgParamArr[0],
        cfgParamAdd: cfgParamAddArrEnd,
      };
      this.reBootStatus = `${this.data.reboot}`;
    } else {
      this.resetData();
    }
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      cfgName: '',
      reboot: '1',
      remark: '',
      productCode: '',
      cfgParam: '',
      cfgParamAdd: [],
    };
  }

  addCfgParam() {
    this.modelForm.cfgParamAdd.push({
      value: '',
      key: Date.now(),
    });
  }

  deleteCfgParam(key: any) {
    this.modelForm.cfgParamAdd.splice(key, 1);
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
      this.modelForm.cfgName = '';
      this.modelForm.remark = '';
      this.modelForm.productCode = '';
      this.modelForm.cfgParam = '';
      this.modelForm.cfgParamAdd = [];
      this.reBootStatus = '1';
    }, 200);
  }
  reBootStatus: string = '1';

  rebootChange(data: any) {
    this.reBootStatus = data;
  }

  onSubmit() {
    this.loading = true;
    const From: any = this.$refs.modelForm;
    // 配置参数
    const cfgParamArr: any = [];
    cfgParamArr.push(`"${this.modelForm.cfgParam}"`);
    this.modelForm.cfgParamAdd.map((item: any, key: number) => {
      if (item.value !== '') {
        cfgParamArr.push(`"${item.value}"`);
      }
      return cfgParamArr;
    });
    let cfgParamStr: any = '';
    cfgParamStr = `[${cfgParamArr.join(',')}]`;

    const obj = {
      cfgName: this.modelForm.cfgName,
      reboot: this.reBootStatus,
      remark: this.modelForm.remark,
      productCode: this.modelForm.productCode,
      cfgParam: cfgParamStr,
      id: this.data.id ? this.data.id : null,
    };
    if (this.title === '新增配置') {
      From.validate((valid: any) => {
        if (valid) {
          delete obj.id;
          configAdd(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.modelForm.cfgParamAdd = [];
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
    } else {
      From.validate((valid: any) => {
        if (valid) {
          configUpdate(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.modelForm.cfgParamAdd = [];
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
  }

  render() {
    return (
      <el-dialog
        width="560px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="90px" class="model">
          <el-row>
            <el-col span={24}>
              <el-form-item label="配置名称" prop="cfgName">
                <el-input
                  id="cfgName"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="产品编码" prop="productCode">
                <el-input
                  id="productCode"
                  v-model={this.modelForm.productCode}
                  placeholder="用于设备识别下发配置文件的唯一标识"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="配置描述" prop="remark">
                <el-input
                  id="remark"
                  type="textarea"
                  rows={3}
                  v-model={this.modelForm.remark}
                  placeholder="请输入配置描述"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="配置参数" prop="cfgParam" rules={this.cfgParamRule}>
                <el-input
                  id="cfgParam"
                  v-model={this.modelForm.cfgParam}
                  placeholder="请输入配置参数"
                >
                  <el-button slot="append" icon="iconfont-plus icon-plus" on-click={this.addCfgParam}></el-button>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              {
                this.modelForm.cfgParamAdd.map((item: any, index: number) => <el-form-item
                  label={`配置参数${index + 1}`}
                  key={item.key}
                  // prop={this.modelForm.cfgParamAdd[index].value}
                  prop={`cfgParamAdd.${index}.value`}
                  rules={this.cfgParamRule}
                >
                  <el-input
                    id="cfgParam"
                    v-model={item.value}
                    placeholder="请输入配置参数"
                  >
                    <el-button slot="append" icon="iconfont-delete icon-close" on-click={() => this.deleteCfgParam(index)}></el-button>
                  </el-input>
                </el-form-item>)
              }
            </el-col>
            <el-col span={24}>
              <el-form-item label="是否重启" prop="reboot" class="isStart">
                <div class="radioGroup">
                  <el-radio-group v-model={this.reBootStatus} on-change={this.rebootChange}>
                    <el-radio id="availableY" label="1">是</el-radio>
                    <el-radio id="availableN" label="2">否</el-radio>
                  </el-radio-group>
                </div>
                <p class="reStart">( 设备下发配置成功后是否重启设备 )</p>
              </el-form-item>
            </el-col>
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
