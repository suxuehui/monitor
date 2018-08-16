import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option, Upload } from 'element-ui';
import './BindModal.less';

interface ActiveType { key: number, value: string, label: string }

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
  'el-upload': Upload
  }
  })
export default class BindModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  modelForm: any = {
    levelCode: '',
    terminalType: '',
    imei: '',
  };

  roleTypeList: ActiveType[] = [
    { key: 0, value: '0', label: '经理0' },
    { key: 1, value: '1', label: '经理1' },
    { key: 2, value: '2', label: '经理2' },
  ]

  terminalList: ActiveType[] = [
    { key: 0, value: '0', label: 'GL500' },
    { key: 1, value: '1', label: 'OTU' },
  ]
  // 图片上传
  dialogImageUrl: string = '';
  dialogVisible: boolean = false;

  // 重置数据
  resetData() {
    this.modelForm = {
      modelCfgId: '',
      plateNum: '',
      url: '',
      vin: '',
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
    const obj: any = {};
    console.log(this.data);
  }

  // 删除
  handleRemove(file: any, fileList: any) {
    console.log(file, fileList);
  }

  // 预览
  handlePictureCardPreview(file: any) {
    this.dialogImageUrl = file.url;
    this.dialogVisible = true;
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
          <el-form model={this.modelForm} ref="modelForm" label-width="80px" class="model">
            <el-row>
              <el-col span={24}>
                <el-form-item label="品牌车型" prop="modelCfgId">
                  <el-select
                    id="modelCfgId"
                    v-model={this.modelForm.modelCfgId}
                    filterable={true}
                    placeholder="请选择品牌车型"
                    style="width:100%"
                  >
                    {
                      this.roleTypeList.map((item: any) => (
                        <el-option value={item.value} label={item.label} >{item.label}</el-option>
                      ))
                    }
                  </el-select>
                </el-form-item>
              </el-col>
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
                <el-form-item label="车架图片" >
                  <el-upload
                    id="dialogImageUrl"
                    action="https://jsonplaceholder.typicode.com/posts/"
                    list-type="picture"
                    on-preview={this.handlePictureCardPreview}
                    on-remove={this.handleRemove}
                    class="uploadPic"
                  >
                    <i class="el-icon-plus"></i>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <el-row>
            <el-col offset={7} span={12}>
              <el-button size="small" type="primary" id="submit" on-click={this.onSubmit}>保存</el-button>
              <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
            </el-col>
          </el-row>
        </el-dialog>
        <el-dialog >
          <img width="100%" src={this.dialogImageUrl} alt="" />
        </el-dialog>
      </div >
    );
  }
}
