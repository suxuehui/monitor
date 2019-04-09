import {
  Component, Prop, Vue, Watch, Emit,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option, Upload, Cascader,
} from 'element-ui';
import { terminalBind } from '@/api/equipment';
import UploadBlock from '@/components/Upload/index.vue';
import './BindModel.less';

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
    'el-upload': Upload,
    'el-cascader': Cascader,
    'upload-Model': UploadBlock,
  },
})
export default class BindModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  modelForm: any = {
    url: '',
    vin: '',
    plateNum: '',
  };

  loading: boolean = false;

  // 图片上传
  dialogImageUrl: string = '';

  dialogVisible: boolean = false;

  headers: any = '';

  uploadUrl: string = '';

  typeList: any = []; // 设备类型

  showUpBtn: boolean = true; // 上传按钮展示

  // 车型列表
  modelList: any = []

  rules = {
    url: [
      { required: true, message: '请上传图片' },
    ],
    vin: [
      { required: true, message: '请输入车架号', trigger: 'blur' },
    ],
    plateNum: [
      { required: true, message: '请输入车牌号', trigger: 'blur' },
      {
        validator: this.checkPlateNum, trigger: 'blur',
      },
    ],
  }

  // 验证车牌号
  @Emit()
  checkPlateNum(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const exp: any = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4,5}[A-Z0-9挂学警港澳]{1}$/;
        if (exp.test(value)) {
          callback();
        } else {
          callback(new Error('车牌号输入不合法，请重新输入'));
        }
      } else {
        callback(new Error('请输入车牌号'));
      }
    }, 500);
  }

  created() {
    this.headers = {
      token: window.localStorage.getItem('token'),
    };
    this.uploadUrl = process.env.NODE_ENV === 'production' ? '/api/zuul/verify/file/upload' : '/rootApi/zuul/verify/file/upload';
  }

  @Watch('data')
  onDataChange() {
    this.showUpBtn = true;
  }

  logoUrl: any = [];

  // 重置数据
  resetData() {
    this.modelForm = {
      url: '',
      vin: '',
      plateNum: '',
    };
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    const upModel: any = this.$refs.uploadModel;
    this.showUpBtn = true;
    setTimeout(() => {
      From.resetFields();
      upModel.$children[0].clearFiles();
    }, 200);
    this.loading = false;
  }

  removeBack(file: any, fileList: any) {
    this.modelForm.url = '';
    this.$message.error('图片已删除，请重新上传');
    this.showUpBtn = true;
  }

  successBack(response: any, file: any, fileList: any) {
    if (response.result.resultCode === '0') {
      this.$message.success('图片上传成功');
      this.modelForm.url = response.entity;
      this.showUpBtn = false;
    } else {
      this.$message.error(response.result.resultMessage);
    }
  }

  // vin: KPTS0A1K87P080237
  // plate: 渝ABP418
  onSubmit() {
    this.loading = true;
    const From: any = this.$refs.modelForm;
    const upModel: any = this.$refs.uploadModel;
    const obj: any = {
      imei: this.data.imei,
      plateNum: this.modelForm.plateNum,
      url: this.modelForm.url,
      vin: this.modelForm.vin,
    };
    From.validate((valid: any) => {
      if (valid) {
        terminalBind(obj).then((res) => {
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
  }

  picSource = {
    system: 'fzkMonitor',
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
          <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="fzkBindModel">
            <el-row>
              <el-col span={24}>
                <el-form-item label="车架号" prop="vin">
                  <el-input
                    id="vin"
                    v-model={this.modelForm.vin}
                    placeholder="请输入车架号"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={24}>
                <el-form-item label="车牌号" prop="plateNum">
                  <el-input
                    id="plateNum"
                    v-model={this.modelForm.plateNum}
                    placeholder="请输入车牌号"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={24}>
                <el-form-item label="车架图片" class="upload">
                  <upload-Model
                    ref="uploadModel"
                    class="uploadBlock"
                    name="file"
                    listType="picture"
                    autoUpload={true}
                    systemSource={this.picSource}
                    showUpBtn={this.showUpBtn}
                    url={this.uploadUrl}
                    logoUrl={this.logoUrl}
                    headers={this.headers}
                    on-successBack={this.successBack}
                    on-removeBack={this.removeBack}
                  ></upload-Model>
                  <span class="star">*</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="bindBtn">
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </el-dialog>
      </div >
    );
  }
}
