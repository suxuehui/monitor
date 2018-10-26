import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option, Upload, Cascader } from 'element-ui';
import { brandAll, seriesAll, modelAll } from '@/api/model';
import { terminalBind } from '@/api/equipment';
import UploadBlock from '@/components/Upload/index.vue';
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
  'el-upload': Upload,
  'el-cascader': Cascader,
  'upload-Model': UploadBlock,
  }
  })
export default class BindModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  modelForm: any = {
    carInfo: [],
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

  brandList: any = [];
  props: any = {
    value: 'value',
    children: 'name',
  }

  // 设备类型
  typeList: any = [];
  // 门店列表
  shopList: any = [];

  // 品牌、车系、车型
  brandId: number = 1;
  seriesId: number = 1;
  modelId: number = 1;
  brandName: string = '';
  seriesName: string = '';
  modelName: string = '';

  showUpBtn: boolean = true;

  // 车型列表
  modelList: any = []

  rules = {
    carInfo: [
      { required: true, message: '请选择品牌、车系、车型' },
    ],
    url: [
      { required: true, message: '请上传图片' },
    ],
    vin: [
      { required: true, message: '请输入车架号', trigger: 'blur' },
    ],
    plateNum: [
      { required: true, message: '请输入车牌号', trigger: 'blur' },
    ],
  }
  logoUrl: any = [];

  created() {
    brandAll(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.map((item: any, index: number) => {
          this.brandList.push({
            label: item.name,
            name: [],
            value: item.id,
          });
          return true;
        });
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    this.headers = {
      token: window.localStorage.getItem('token'),
    };
    this.uploadUrl = process.env.NODE_ENV === 'production' ? '/monitorFzkApi/zuul/verify/file/upload' : '/rootApi/zuul/verify/file/upload';
  }

  @Watch('data')
  onDataChange() {
    // this.resetData();
    this.showUpBtn = true;
  }

  handleItemChange(val: any) {
    const obj: any = {
      brandId: val[0],
    };
    if (val.length === 1) {
      this.getSeries(obj, val[0]);
    } else if (val.length === 2) {
      const obj1: any = {
        brandId: val[0],
        seriesId: val[1],
      };
      this.getModel(obj1, val);
    }
  }

  // 品牌查车系
  getSeries(obj: any, val: number) {
    seriesAll(obj).then((res) => {
      if (res.result.resultCode === '0') {
        this.brandList.forEach((item: any, index: number) => {
          this.brandList[index].name = [];
          if (val === item.value) {
            this.brandName = item.label;
            setTimeout(() => {
              if (res.entity !== null && res.entity.length > 0) {
                res.entity.forEach((items: any) => {
                  this.brandList[index].name.push({
                    label: items.name,
                    value: items.id,
                    name: [],
                  });
                });
              } else {
                this.brandList[index].name.push({
                  label: '暂无车系可供选择',
                  value: Math.random(),
                  disabled: true,
                });
              }
            }, 100);
          }
        });
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 车系查车型
  getModel(data: any, val: any) {
    modelAll(data).then((res) => {
      if (res.result.resultCode === '0') {
        this.brandList.map((item: any, index: number) => {
          item.name.map((items: any, key: number) => {
            if (val[1] === items.value) {
              this.seriesName = items.label;
              if (res.entity !== null && res.entity.length > 0) {
                res.entity.forEach((it: any) => {
                  this.brandList[index].name[key].name.push({
                    label: it.name,
                    value: it.id,
                  });
                });
              } else {
                this.brandList[index].name[key].name.push({
                  label: '暂无车型可供选择',
                  value: Math.random(),
                  disabled: true,
                });
                return false;
              }
            }
            return true;
          });
          return true;
        });
        this.modelList = res.entity;
      }
    });
  }

  handleChangeModel(val: any) {
    this.brandId = parseInt(val[0], 10);
    this.seriesId = parseInt(val[1], 10);
    this.modelId = parseInt(val[2], 10);
    this.modelList.map((item: any) => {
      if (item.id === this.modelId) {
        this.modelName = item.name;
      }
      return true;
    });
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      carInfo: [],
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
    this.modelForm.seriesName = `${this.brandName}/${this.seriesName}/${this.modelName}`;
    this.modelForm.seriesId = `${this.brandId}/${this.seriesId}/${this.modelId}`;
    const obj: any = {
      imei: this.data.imei,
      plateNum: this.modelForm.plateNum,
      seriesId: this.modelForm.seriesId,
      seriesName: this.modelForm.seriesName,
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
          <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="model">
            <el-row>
              <el-col span={24}>
                <el-form-item label="车辆车型" prop="carInfo">
                  <el-cascader
                    id="carInfo"
                    v-model={this.modelForm.carInfo}
                    style="width:100%"
                    placeholder="请选择品牌车系车型"
                    options={this.brandList}
                    on-active-item-change={this.handleItemChange}
                    on-change={this.handleChangeModel}
                    props={this.props}
                  ></el-cascader>
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
                  <upload-Model
                    ref="uploadModel"
                    class="uploadBlock"
                    name="file"
                    listType="picture"
                    autoUpload={true}
                    showUpBtn={this.showUpBtn}
                    url={this.uploadUrl}
                    logoUrl={this.logoUrl}
                    headers={this.headers}
                    on-successBack={this.successBack}
                    on-removeBack={this.removeBack}
                  ></upload-Model>
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
      </div >
    );
  }
}
