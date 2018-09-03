import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator';
import { Dialog, Row, Col, Form, FormItem, Input, Button, Upload } from 'element-ui';
import { uploadFile } from '@/api/app';
import { brandAdd, brandEdit } from '@/api/model';
import UploadBlock from '@/components/Upload/index.vue';

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
  'upload-Model': UploadBlock,
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
  headers: any = '';
  uploadUrl: string = '';

  rules = {
    name: [
      { required: true, message: '请输入品牌名称', trigger: 'blur' },
    ],
    description: [
      { required: false },
    ],
    logo: [
      { required: false },
    ],
  }

  logoUrl: any = [];
  @Watch('data')
  onDataChange() {
    if (this.data.id > 0) {
      this.modelForm = {
        name: this.data.name,
        description: this.data.description,
      };
      this.logoUrl = [];
      this.logoUrl.push({
        name: this.data.name,
        url: this.data.logo,
      });
    } else {
      this.resetData();
    }
  }

  mounted() {
    this.headers = {
      token: window.localStorage.getItem('token'),
    };
    this.uploadUrl = process.env.NODE_ENV === 'production' ? '/verify/file/upload' : '/rootApi/verify/file/upload';
  }

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

  removeBack(file: any, fileList: any) {
    this.modelForm.logo = '';
    this.$message.error('图片已删除，请重新上传');
  }

  successBack(response: any, file: any, fileList: any) {
    if (response.result.resultCode === '0') {
      this.$message.success('图片上传成功');
      this.modelForm.logo = response.entity;
    }
  }

  onSubmit() {
    this.loading = true;
    const upModel: any = this.$refs.uploadModel;
    const From: any = this.$refs.modelForm;
    const obj = {
      id: this.data.id ? this.data.id : null,
      name: this.modelForm.name,
      logo: this.modelForm.logo,
      description: this.modelForm.description,
    };
    if (this.title === '新增品牌') {
      From.validate((valid: any) => {
        if (valid) {
          brandAdd(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                upModel.$children[0].clearFiles();
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
      obj.id = this.data.id;
      From.validate((valid: any) => {
        if (valid) {
          if (this.modelForm.logo !== '') {
            brandEdit(obj).then((res) => {
              if (res.result.resultCode === '0') {
                setTimeout(() => {
                  this.loading = false;
                  this.$message.success(res.result.resultMessage);
                  From.resetFields();
                  upModel.$children[0].clearFiles();
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
            this.$message.error('图片已删除，请重新选择图片');
            this.loading = false;
            return false;
          }
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
                  <upload-Model
                    ref="uploadModel"
                    url={this.uploadUrl}
                    logoUrl={this.logoUrl}
                    headers={this.headers}
                    on-successBack={this.successBack}
                    on-removeBack={this.removeBack}
                  ></upload-Model>
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
  // renderUpload() {

  // }
}
