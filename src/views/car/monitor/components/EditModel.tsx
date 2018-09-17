import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option, Upload, Cascader } from 'element-ui';
import { allList } from '@/api/model';
import { vehicleUpdate } from '@/api/monitor';
import UploadBlock from '@/components/Upload/index.vue';
import './EditModel.less';

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
export default class EditModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  modelForm: any = {
    carInfo: [],
    vin: '',
    plateNum: '',
  };
  loading: boolean = false;

  brandList: any = [];
  props: any = {
    value: 'id',
    children: 'children',
    label: 'name',
  }

  // 设备类型
  typeList: any = [];
  // 门店列表
  shopList: any = [];

  // 品牌、车系、车型
  brandId: any = null;
  seriesId: any = null;
  modelId: any = null;
  oldBrandId: any = null;
  oldSeriesId: any = null;
  oldModelId: any = null;

  // 车型列表
  modelList: any = []

  rules = {
    carInfo: [
      { required: true, message: '请选择品牌、车系、车型', trigger: 'change' },
    ],
    vin: [
      { required: true, message: '请输入车架号', trigger: 'blur' },
    ],
    plateNum: [
      { required: true, message: '请输入车牌号', trigger: 'blur' },
    ],
  }

  created() {
    allList(null).then((res) => {
      if (res.result.resultCode === '0') {
        this.brandList = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  @Watch('data')
  onDataChange() {
    this.modelForm = {
      vin: this.data.vin,
      plateNum: this.data.plateNum,
      carInfo: [],
    };
    const arr = this.data.carCode;
    arr.map((item: any) => this.modelForm.carInfo.push(parseInt(item, 10)));
    this.oldBrandId = parseInt(arr[0], 10);
    this.oldSeriesId = parseInt(arr[1], 10);
    this.oldModelId = parseInt(arr[2], 10);
  }

  handleChangeModel(val: any) {
    this.brandId = val[0] ? parseInt(val[0], 10) : null;
    this.seriesId = val[1] ? parseInt(val[1], 10) : null;
    this.modelId = val[2] ? parseInt(val[2], 10) : null;
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      carInfo: [],
      vin: '',
      plateNum: '',
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
    const obj: any = {
      plateNum: this.modelForm.plateNum,
      vin: this.modelForm.vin,
      id: this.data.id,
    };
    if (this.data.carCode.join('/') === this.modelForm.carInfo.join('/')) {
      obj.brandId = this.oldBrandId;
      obj.seriesId = this.oldSeriesId;
      obj.modelId = this.oldBrandId;
    } else {
      obj.brandId = this.brandId;
      obj.seriesId = this.seriesId;
      obj.modelId = this.modelId;
    }
    From.validate((valid: any) => {
      if (valid) {
        vehicleUpdate(obj).then((res) => {
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
      <div>
        <el-dialog
          width="540px"
          title="编辑车辆"
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
                    placeholder="请选择车辆车型"
                    options={this.brandList}
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
            </el-row>
          </el-form>
          <el-row>
            <el-col offset={9} span={12}>
              <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
              <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
            </el-col>
          </el-row>
        </el-dialog>
      </div >
    );
  }
}
