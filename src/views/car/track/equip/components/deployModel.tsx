import {
  Component, Prop, Vue, Watch, Emit,
} from 'vue-property-decorator';
import {
  Col, Row, Dialog, Form, FormItem, Input, Button, TimeSelect, Select, Option,
} from 'element-ui';
import utils from '@/utils';
import { vehicleDeviceSet } from '@/api/monitor';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
    'el-time-select': TimeSelect,
    'el-select': Select,
    'el-col': Col,
    'el-option': Option,
    'el-row': Row,
  },
})
export default class DeployModel extends Vue {
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private time: any;

  modelForm: any = {
    startTime: '',
    frequency: '',
    duration: '',
  };

  loading: boolean = false;

  @Watch('time')
  onDataChange() {
    if (this.data.type === 'deploy') {
      this.modelForm.startTime = '';
      const obj: any = JSON.parse(JSON.stringify(this.data));
      this.modelForm.frequency = obj.frequency;
      this.modelForm.startTime = utils.removeMarks(obj.startDate);
      if (obj.type === 'deploy') {
        if (this.modelForm.startTime !== '') {
          this.timeChange(this.modelForm.startTime);
        }
      }
    }
  }

  rules = {
    // startTime: [
    //   { required: true, message: '请输入启动时间', trigger: 'blur' },
    // ],
    frequency: [
      { required: true },
    ],
  }

  starTimeRule = [
    { required: true, message: '请输入启动时间', trigger: 'blur' },
    {
      validator: this.starTimeValue,
    },
  ]

  /**
    * @method 启动时间校验
    */
  @Emit()
  starTimeValue(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        callback();
      } else {
        callback(new Error('启动时间不能为空'));
      }
    }, 500);
  }

  // 时间范围
  timeSet: any = {
    start: '00:00',
    step: '00:01',
    end: '24:00',
  }

  // 上报频率
  reportFrequencyOptions: any = [
    {
      value: '1',
      label: '1',
    },
    {
      value: '2',
      label: '2',
    },
    {
      value: '3',
      label: '3',
    },
    {
      value: '4',
      label: '4',
    },
    {
      value: '6',
      label: '6',
    },
    {
      value: '8',
      label: '8',
    },
    {
      value: '12',
      label: '12',
    },
    {
      value: '24',
      label: '24',
    },
  ]

  // 重置数据
  resetData() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
    }, 400);
    this.loading = false;
  }

  // 生效日期
  valdate: string = '';

  timeChange(val: any) {
    const obj = {
      id: this.data.id,
      imei: this.data.imei,
      date: val,
    };
  }


  selectChange(val: any) { }

  closeModal() {
    this.$emit('close');
    setTimeout(() => {
      this.modelForm.startTime = '';
    }, 200);
    this.loading = false;
  }

  onSubmit() {
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    this.loading = true;
    obj = {
      imei: this.data.imei,
      startTime: this.modelForm.startTime, // 启动时间
      frequency: this.modelForm.frequency, // 追踪频率
    };
    From.validate((valid: any) => {
      if (valid) {
        vehicleDeviceSet(obj).then((res) => {
          if (res.result.resultCode === '0') {
            setTimeout(() => {
              this.loading = false;
              this.$message.success(res.result.resultMessage);
              this.modelForm.startTime = '';
              this.$emit('refresh');
              From.resetFields();
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
          <el-form-item label="启动时间" prop="startTime" rules={this.starTimeRule}>
            <el-time-select
              v-model={this.modelForm.startTime}
              id="startTime"
              picker-options={this.timeSet}
              onChange={this.timeChange}
              style="width:100%"
              placeholder="请选择启动时间">
            </el-time-select>
          </el-form-item>
          <el-form-item label="上报频率" prop="frequency">
            <el-select
              id="frequency"
              v-model={this.modelForm.frequency}
              on-change={this.selectChange}
              style="width:100%"
            >
              {
                this.reportFrequencyOptions.map((item: any) => (
                  <el-option value={item.value} label={item.label} >{item.label}</el-option>
                ))
              }
            </el-select>
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
