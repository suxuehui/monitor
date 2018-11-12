import { Component, Prop, Vue } from 'vue-property-decorator';
import { Col, Row, Dialog, Form, FormItem, Input, Button, TimeSelect } from 'element-ui';
import { vehicleCalvalid, vehicleDeviceSet } from '@/api/monitor';
import { terminalDict } from '@/api/app';
@Component({
  components: {
  'el-dialog': Dialog,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-input': Input,
  'el-button': Button,
  'el-time-select': TimeSelect,
  'el-col': Col,
  'el-row': Row
  }
  })
export default class DeployModel extends Vue {
  @Prop({ default: false }) private visible !: boolean;
  @Prop() private data: any;
  modelForm: any = {
    startTime: '',
    frequency: '',
    duration: '',
  };
  loading: boolean = false;

  rules = {
    startTime: [
      { required: true, message: '请输入启动时间', trigger: 'blur' },
    ],
    frequency: [
      { required: true },
    ],
    duration: [
      { required: true },
    ],
  }

  created() {
    terminalDict({ EnumType: 'wireless_config' }).then((res) => {
      if (res.result.resultCode === '0') {
        if (res.entity !== null) {
          res.entity.forEach((item: any) => {
            if (item.enumValue === 'frequency') {
              this.modelForm.frequency = `${item.name}分钟/次`;
            }
            if (item.enumValue === 'duration') {
              this.modelForm.duration = `${item.name}分钟`;
            }
          });
        }
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 时间范围
  timeSet: any = {
    start: '00:00',
    step: '00:01',
    end: '24:00',
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      startTime: '',
      frequency: '',
      duration: '',
    };
  }

  // 生效日期
  valdate: string = '';

  timeChange(val: any) {
    const obj = {
      id: this.data.id,
      imei: this.data.imei,
      date: val,
      duration: 5,
    };
    vehicleCalvalid(obj).then((res) => {
      const { result, entity } = res;
      if (result.resultCode === '0') {
        this.valdate = entity.valdate;
      } else {
        this.$message.error(result.resultMessage);
      }
    });
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
    }, 200);
    this.loading = false;
  }

  onSubmit() {
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    this.loading = true;
    obj = {
      id: this.data.id,
      imei: this.data.imei,
      cfgName: 'wirelessDeviceConfiguration',
      // 启动时间$生效时间$启动时长$频率
      cfgVal: `${this.modelForm.startTime}$${this.valdate}$${this.modelForm.duration.split('分')[0]}$${this.modelForm.frequency.split('分')[0]}`,
    };
    From.validate((valid: any) => {
      if (valid) {
        vehicleDeviceSet(obj).then((res) => {
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
      return true;
    });
  }

  render() {
    return (
      <el-dialog
        width="500px"
        title="配置"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="model">
          <el-form-item label="启动时间" prop="startTime">
            <el-time-select
              v-model={this.modelForm.startTime}
              id="startTime"
              picker-options={this.timeSet}
              onChange={this.timeChange}
              style="width:100%"
              placeholder="请选择启动时间">
            </el-time-select>
          </el-form-item>
          <el-form-item label="启动时长" prop="duration">
            <el-input
              id="duration"
              v-model={this.modelForm.duration}
              disabled={true}
            ></el-input>
          </el-form-item>
          <el-form-item label="上报频率" prop="frequency">
            <el-input
              id="frequency"
              v-model={this.modelForm.frequency}
              disabled={true}
            ></el-input>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col offset={9} >
            <el-button size="small" id="submit" type="primary" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
