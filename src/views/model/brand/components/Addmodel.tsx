import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Dialog, Row, Col, Form, FormItem, Input, Button, Upload } from 'element-ui';
import { uploadFile } from '@/api/app';
import { brandAdd, brandEdit } from '@/api/model';
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
    logo: '',
  };
  loading: boolean = false;

  // 图片上传
  dialogImageUrl: string = '';
  dialogVisible: boolean = false;


  rules = {
    name: [
      { required: true, message: '请输入品牌名称', trigger: 'blur' },
    ],
    description: [
      { required: false },
    ],
    logo: [
      { required: true },
    ],
  }

  // @Watch('data')
  // onDataChange() {
  //   if (this.data.id > 0) {

  //   } else {
  //     this.resetData();
  //   }
  // }

  // 重置数据
  resetData() {
    this.modelForm = {
      name: '',
      description: '',
      logo: '',
    };
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
    }, 200);
  }

  handleRemove(file:any, fileList:any) {
    console.log(file, fileList);
  }

  handlePictureCardPreview(file:any) {
    this.dialogImageUrl = file.url;
    this.dialogVisible = true;
  }

  onSubmit() {
    this.loading = true;
    const From: any = this.$refs.modelForm;
    if (this.title === '新增配置') {
      From.validate((valid: any) => {
        if (valid) {
          console.log('新增');
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
      <div>
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
                <el-form-item label="品牌名称" prop="name">
                  <el-input
                    id="name"
                    v-model={this.modelForm.name}
                    placeholder="请输入配置名称"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={24}>
                <el-form-item label="品牌图标" prop="logo">
                  <el-upload
                  id="logo"
                  action="http://192.168.6.160:5555/verify/file/upload"
                  list-type="picture-card"
                  on-preview={this.handlePictureCardPreview}
                  on-remove={this.handleRemove}
                  >
                    <i class="el-icon-plus"></i>
                  </el-upload>
                </el-form-item>
              </el-col>
              <el-col span={24}>
                <el-form-item label="品牌描述" prop="description">
                  <el-input
                    id="description"
                    type="textarea"
                    rows={3}
                    v-model={this.modelForm.description}
                    placeholder="请输入品牌描述"
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
        <el-dialog visible={this.dialogVisible}>
          <img width="100%" src="dialogImageUrl" alt="" />
        </el-dialog>
      </div >
    );
  }
}
