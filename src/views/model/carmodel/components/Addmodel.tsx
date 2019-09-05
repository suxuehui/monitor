import {
  Component, Prop, Vue, Watch, Emit,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Form, FormItem, Input, Button, Upload, Select, Option, Cascader,
} from 'element-ui';
import { modelAdd, modelEdit, seriesAll } from '@/api/model';
import './Addmodel.less';

interface ActiveType { key: number, value: number, label: string }
@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
    'el-upload': Upload,
    'el-select': Select,
    'el-option': Option,
    'el-cascader': Cascader,
  },
})
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  @Prop() private carModelTime: any;

  @Prop() private brandAddList: any; // 品牌列表

  modelForm: any = {
    name: '',
    brandSeries: [],
    description: '',
  };

  loading: boolean = false;

  rules = {
    name: [
      { required: true, message: '请输入车型名称', trigger: 'blur' },
    ],
  }

  props: any = {
    value: 'value',
    children: 'name',
    checkStrictly: true,
  }

  selectedList: any = [];

  @Watch('carModelTime')
  onDataChange() {
    if (this.data.id > 0) {
      this.modelForm = {
        name: this.data.name,
        description: this.data.description,
        brandSeries: [this.data.brandId, this.data.seriesId],
      };
    } else {
      this.resetData();
    }
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      name: '',
      brandSeries: [],
      description: '',
    };
    this.selectedList = [];
  }

  closeModal() {
    this.$emit('close');
    setTimeout(() => {
      this.resetData();
    }, 400);
    this.loading = false;
  }

  handleItemChange() {

  }

  onSubmit() {
    this.loading = true;
    const From: any = this.$refs.modelForm;
    if (this.modelForm.brandSeries.length !== 2) {
      this.$message.error('请选择品牌车系');
      this.loading = false;
      return false;
    }
    const obj = {
      id: this.data.id > 0 ? this.data.id : null,
      brandId: this.modelForm.brandSeries[0],
      seriesId: this.modelForm.brandSeries[1],
      name: this.modelForm.name,
      description: this.modelForm.description,
    };
    From.validate((valid: any) => {
      if (valid) {
        if (this.title === '新增车型') {
          delete obj.id;
          modelAdd(obj).then((res) => {
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
        } else {
          modelEdit(obj).then((res) => {
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
        <el-form model={this.modelForm} rules={this.rules} ref="modelForm" label-width="80px" class="model">
          <el-row>
            <el-col span={24}>
              <el-form-item label="品牌车系" prop="brandSeries">
                <el-cascader
                  id="brandSeries"
                  v-model={this.modelForm.brandSeries}
                  style="width:100%"
                  placeholder="请选择品牌车系"
                  options={this.brandAddList}
                  on-change={this.handleItemChange}
                  props={this.props}
                ></el-cascader>
              </el-form-item>
              <span class="star">*</span>
            </el-col>
            <el-col span={24}>
              <el-form-item label="车型名称" prop="name">
                <el-input
                  id="name"
                  v-model={this.modelForm.name}
                  placeholder="请输入车型名称"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="车系描述" prop="description">
                <el-input
                  id="description"
                  type="textarea"
                  rows={3}
                  v-model={this.modelForm.description}
                  placeholder="请输入车系描述"
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
