import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option, Radio } from 'element-ui';
import { configAdd, configDelete, configUpdate } from '@/api/config';

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
  }
  })
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  modelForm: any = {
    cfgName: '',
    reboot: 'true',
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
    cfgParam: [
      { required: true, message: '请输入配置参数', trigger: 'blur' },
    ],
    reboot: [
      { required: false },
    ],
    remark: [
      { required: false },
    ],
    productCode: [
      { required: true, message: '请输入产品编码', trigger: 'blur' },
    ],
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      cfgName: '',
      reboot: '',
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
    }, 200);
  }

  onSubmit() {
    this.loading = true;
    const From: any = this.$refs.modelForm;
    // 配置参数
    const cfgParamArr: any = [];
    cfgParamArr.push(this.modelForm.cfgParam);
    this.modelForm.cfgParamAdd.map((item: any, key: number) =>
      cfgParamArr.push(item.value));
    let cfgParamString: any = '';
    cfgParamString = `[${cfgParamArr.join(',')}]`;
    // 是否重启
    const isReBoot = this.modelForm.reboot === 'true' ? 1 : 0;

    const obj = {
      cfgName: this.modelForm.cfgName,
      reboot: isReBoot,
      remark: this.modelForm.remark,
      productCode: this.modelForm.productCode,
      cfgParam: cfgParamString,
    };
    if (this.title === '新增配置') {
      configAdd(obj).then((res) => {
        if (res.result.resultCode === '0') {
          setTimeout(() => {
            this.loading = false;
            this.$message.success(res.result.resultMessage);
            From.resetFields();
            this.modelForm.cfgParamAdd=[];
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
        <el-form model={this.modelForm} ref="modelForm" label-width="80px" class="model">
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
              <el-form-item label="配置参数" prop="cfgParam">
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
                  prop={this.modelForm.cfgParamAdd[index].value}
                >
                  <el-input
                    id="cfgParam"
                    v-model={this.modelForm.cfgParamAdd[index].value}
                    placeholder="请输入配置参数"
                  >
                    <el-button slot="append" icon="iconfont-delete icon-close" on-click={() => this.deleteCfgParam(index)}></el-button>
                  </el-input>
                </el-form-item>)
              }
            </el-col>
            <el-col span={24}>
              <el-form-item label="是否启用" prop="reboot" class="isStart">
                <div class="radioGroup">
                  <el-radio v-model={this.modelForm.reboot} id="availableY" label="true">是</el-radio>
                  <el-radio v-model={this.modelForm.reboot} id="availableN" label="false">否</el-radio>
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
