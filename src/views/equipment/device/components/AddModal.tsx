import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option } from 'element-ui';
import { terminalAdd, terminalType } from '@/api/equipment';
import { orgTree } from '@/api/app';

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

  modelForm: any = {
    levelCode: '',
    terminalType: '',
    imei: '',
  };
  loading: boolean = false;

  rules = {
    levelCode: [
      { required: true, message: '请选择所属商户' },
    ],
    terminalType: [
      { required: true, message: '请选择设备类型' },
    ],
    imei: [
      { required: true, message: '请输入设备IMEI', trigger: 'blur' },
    ],
  }

  // 设备类型
  typeList: any = [];
  // 门店列表
  shopList: any = [];

  created() {
    // 门店
    orgTree(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.map((item: any) => this.shopList.push({
          key: item.id,
          value: item.levelCode,
          label: item.orgName,
        }));
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    // 设备类型
    terminalType(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.map((item: any) => this.typeList.push({
          key: Math.random(),
          value: parseInt(item.enumValue, 10),
          label: item.name,
        }));
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      levelCode: '',
      terminalType: '',
      imei: '',
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
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    obj = {
      levelCode: this.modelForm.levelCode,
      terminalType: this.modelForm.terminalType,
      imei: this.modelForm.imei,
    };
    From.validate((valid: any) => {
      if (valid) {
        this.loading = true;
        terminalAdd(obj).then((res) => {
          if (res.result.resultCode === '0') {
            setTimeout(() => {
              this.loading = false;
              this.$message.success(res.result.resultMessage);
              From.resetFields();
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
          <el-row>
            <el-col span={24}>
              <el-form-item label="所属商户" prop="levelCode">
                <el-select
                  id="levelCode"
                  v-model={this.modelForm.levelCode}
                  filterable={true}
                  placeholder="请选择商户"
                  style="width:100%"
                >
                  {
                  this.shopList.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="设备类型" prop="terminalType">
                <el-select
                  id="terminalType"
                  v-model={this.modelForm.terminalType}
                  filterable={true}
                  placeholder="请选择设备类型"
                  style="width:100%"
                >
                  {
                    this.typeList.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="imei号" prop="imei">
                <el-input
                  id="imei"
                  v-model={this.modelForm.imei}
                  placeholder="请输入imei号"
                ></el-input>
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
