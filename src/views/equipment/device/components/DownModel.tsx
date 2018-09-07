import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option, Popover } from 'element-ui';
import { deliveryCfg } from '@/api/equipment';
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
  'el-popover': Popover
  }
  })
export default class DownModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  modelForm: any = {
    productCode: '',
  };
  loading: boolean = false;

  rules = {
    productCode: [
      { required: true, message: '请输入产品编码', trigger: 'blur' },
    ],
  }

  popVisible: boolean = false;

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
    }, 200);
  }

  closePop() {
    this.popVisible = false;
  }

  onSubmit() {
    this.loading = true;
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    obj = {
      productCode: this.modelForm.productCode,
      imei: this.data.imei,
    };
    From.validate((valid: any) => {
      if (valid) {
        deliveryCfg(obj).then((res) => {
          if (res.result.resultCode === '0') {
            setTimeout(() => {
              this.loading = false;
              this.popVisible = false;
              this.$message.success(res.result.resultMessage);
              From.resetFields();
              this.$emit('refresh');
            }, 1500);
          } else {
            setTimeout(() => {
              this.loading = false;
              this.popVisible = false;
              this.$message.error(res.result.resultMessage);
            }, 1500);
          }
        });
      } else {
        this.loading = false;
        this.popVisible = false;
        return false;
      }
      return false;
    });
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
        <el-form model={this.modelForm} status-icon ref="modelForm" rules={this.rules} label-width="80px" class="model">
          <el-form-item label="产品编码" prop="productCode">
            <el-input
              id="productCode"
              v-model={this.modelForm.productCode}
              placeholder="请输入产品编码"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col offset={7} span={12}>
            <el-popover
              placement="top"
              width="224"
              v-model={this.popVisible}
            >
              <p style="marginBottom:20px">确定要下发此设备配置参数吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" id="cancelPop" on-click={this.closePop}>取消</el-button>
                <el-button type="primary" size="mini" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
              </div>
              <el-button type="primary" size="small" id="downConfig" slot="reference">下发配置</el-button>
            </el-popover>
            <el-button style="marginLeft:20px" size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
