import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator';
import { Dialog, Row, Col, Form, FormItem, Input, Button, Upload, Select, Option, Cascader } from 'element-ui';
import { modelAdd, modelEdit, brandAll, seriesAll } from '@/api/model';
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
  'el-cascader': Cascader
  }
  })
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  modelForm: any = {
    name: '',
    energyType: '',
    fuelTankCap: '',
    brandSeries: [],
  };
  loading: boolean = false;

  // 图片上传
  dialogImageUrl: string = '';
  dialogVisible: boolean = false;


  rules = {
    brandSeries: [
      { required: true, message: '请选择品牌车系' },
    ],
    energyType: [
      { required: true, message: '请选择能源类型' },
    ],
    // fuelTankCap: [
    //   { required: true, message: '请输入油箱容量' },
    // ],
    name: [
      { required: true, message: '请输入车型名称', trigger: 'blur' },
    ],
  }
  fuelTankCapRule = [
    { required: true, message: '请输入油箱容量' },
    {
      validator: this.checkTank, trigger: 'blur',
    },
  ]

  brandList: any = [];

  props: any = {
    value: 'value',
    children: 'name',
  }

  energyOptions: ActiveType[] = [
    { key: 1, value: 1, label: '燃油' },
    { key: 2, value: 2, label: '电动' },
    { key: 3, value: 3, label: '混动' },
  ]

  selectStatus: boolean = false;
  oilInput: boolean = true;

  // 验证油箱容量
  @Emit()
  checkTank(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const exp: any = /^[1-9]\d*$/;
        if (exp.test(value)) {
          callback();
        } else {
          callback(new Error('油箱容量只能为数字，请重新输入'));
        }
      } else {
        callback(new Error('油箱容量不能为空'));
      }
    }, 500);
  }

  mounted() {
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
  }

  handleItemChange(val: any) {
    const obj = {
      brandId: val[0],
    };
    this.getSeries(obj, val[0]);
  }
  getSeries(obj: any, val: number) {
    seriesAll(obj).then((res) => {
      if (res.result.resultCode === '0') {
        this.brandList.map((item: any, index: number) => {
          this.brandList[index].name = [];
          if (val === item.value) {
            setTimeout(() => {
              if (res.entity.length > 0) {
                res.entity.map((items: any) => {
                  this.brandList[index].name.push({
                    label: items.name,
                    value: items.id,
                  });
                  return true;
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
          return true;
        });
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  @Watch('data')
  onDataChange(data: any) {
    if (data.id > 0) {
      const obj = { brandId: data.brandId };
      this.modelForm = {
        name: data.name,
        energyType: data.energyType,
        fuelTankCap: data.fuelTankCap,
        brandSeries: [data.brandId, data.seriesId],
      };
      this.oilInput = data.energyType !== 2;
      this.getSeries(obj, this.data.brandId);
      this.selectStatus = true;
    } else {
      this.resetData();
    }
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      name: '',
      energyType: '',
      fuelTankCap: 1,
      brandSeries: [],
    };
    this.selectStatus = false;
  }

  energyChange(val: any) {
    if (val === 2) {
      this.oilInput = false;
    } else {
      this.oilInput = true;
    }
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      this.resetData();
      From.resetFields();
    }, 400);
    this.loading = false;
  }

  onSubmit() {
    this.loading = true;
    const From: any = this.$refs.modelForm;
    const obj = {
      id: this.data.id > 0 ? this.data.id : null,
      brandId: this.modelForm.brandSeries[0],
      seriesId: this.modelForm.brandSeries[1],
      name: this.modelForm.name,
      energyType: this.modelForm.energyType,
      fuelTankCap: this.oilInput ? this.modelForm.fuelTankCap : '',
    };
    if (this.title === '新增车型') {
      From.validate((valid: any) => {
        if (valid) {
          modelAdd(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.selectStatus = false;
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
      From.validate((valid: any) => {
        if (valid) {
          modelEdit(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.selectStatus = false;
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
                  options={this.brandList}
                  disabled={this.selectStatus}
                  on-active-item-change={this.handleItemChange}
                  props={this.props}
                ></el-cascader>
              </el-form-item>
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
              <el-form-item label="能源类型" prop="energyType">
                <el-select
                  id="energyType"
                  v-model={this.modelForm.energyType}
                  placeholder="请选择能源类型"
                  filterable={true}
                  style="width:100%"
                  on-change={this.energyChange}
                >
                  {
                    this.energyOptions.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
              </el-form-item>
            </el-col>
            {
              this.oilInput ?
                <el-col span={24}>
                  <el-form-item label="油箱容量" prop="fuelTankCap" rules={!this.oilInput ? null : this.fuelTankCapRule}>
                    <el-input
                      id="fuelTankCap"
                      v-model={this.modelForm.fuelTankCap}
                      placeholder="请输入油箱容量"
                    >
                      <template slot="append">L</template>
                    </el-input>
                  </el-form-item>
                </el-col> : null
            }
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
