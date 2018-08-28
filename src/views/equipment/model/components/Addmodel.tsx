import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option, Radio } from 'element-ui';

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
    reboot: '',
    cfgParam: '',
    remark: '',
    productCode: '',
  };
  loading: boolean = false;

  rules = {
    cfgName: [
      { required: true, message: '请选择所属商户', trigger: 'blur' },
    ],
    cfgParam: [
      { required: true, message: '请选择设备类型', trigger: 'blur' },
    ],
    reboot: [
      { required: true, message: '请输入设备IMEI' },
    ],
    remark: [
      { required: false, message: '请输入设备IMEI', trigger: 'blur' },
    ],
    productCode: [
      { required: true, message: '请输入设备IMEI', trigger: 'blur' },
    ],
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      cfgName: '',
      reboot: '',
      cfgParam: '',
      remark: '',
      productCode: '',
    };
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
    }, 200);
  }

  onSubmit() {
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
        <el-form model={this.modelForm} ref="modelForm" rules={this.rules} label-width="80px" class="model">
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
                ></el-input>
              </el-form-item>
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
