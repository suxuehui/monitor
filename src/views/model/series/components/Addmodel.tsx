import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Dialog, Row, Col, Form, FormItem, Input, Button, Upload, Select, Option } from 'element-ui';
import { seriesAdd, seriesEdit, brandAll } from '@/api/model';
import './Addmodel.less';
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
  'el-option': Option
  }
  })
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  modelForm: any = {
    name: '',
    description: '',
    brandId: '',
  };
  loading: boolean = false;

  // 图片上传
  dialogImageUrl: string = '';
  dialogVisible: boolean = false;


  rules = {
    name: [
      { required: true, message: '请输入配置名称', trigger: 'blur' },
    ],
    description: [
      { required: false },
    ],
    brandId: [
      { required: true, message: '请选择车辆品牌', trigger: 'blur' },
    ],
  }

  // 品牌列表
  brandList: any = [];

  // @Watch('data')
  // onDataChange() {
  //   if (this.data.id > 0) {

  //   } else {
  //     this.resetData();
  //   }
  // }

  created() {
    brandAll(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.map((item: any) => this.brandList.push({
          key: item.id,
          value: item.id,
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
      name: '',
      description: '',
      brandId: '',
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
    this.loading = true;
    const From: any = this.$refs.modelForm;
    const obj = {
      id: this.data.id ? this.data.id : null,
      brandId: this.modelForm.brandId,
      name: this.modelForm.name,
      description: this.modelForm.description,
    };
    if (this.title === '新增车系') {
      From.validate((valid: any) => {
        if (valid) {
          seriesAdd(obj).then((res) => {
            console.log(res);
            // if (res.result.resultCode === '0') {
            //   setTimeout(() => {
            //     this.loading = false;
            //     this.$message.success(res.result.resultMessage);
            //     From.resetFields();
            //     this.modelForm.cfgParamAdd = [];
            //     this.$emit('refresh');
            //   }, 1500);
            // } else {
            //   setTimeout(() => {
            //     this.loading = false;
            //     this.$message.error(res.result.resultMessage);
            //   }, 1500);
            // }
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
          console.log('编辑');
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
        width="540px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} rules={this.rules} ref="modelForm" label-width="80px" class="model">
          <el-row>
            <el-col span={24}>
              <el-form-item label="选择品牌" prop="brandId">
                <el-select
                  id="brandId"
                  v-model={this.modelForm.brandId}
                  filterable={true}
                  placeholder="请选择品牌"
                  style="width:100%"
                >
                  {
                    this.brandList.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="车系名称" prop="name">
                <el-input
                  id="name"
                  v-model={this.modelForm.name}
                  placeholder="请输入车系名称"
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
