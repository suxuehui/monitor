import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
import { Col, Row, Dialog, Form, FormItem, Input, Button, TimeSelect } from 'element-ui';
import { vehicleCalvalid, vehicleDeviceRev } from '@/api/monitor';
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
export default class ReverseModel extends Vue {
  @Prop({ default: false }) private visible !: boolean;
  @Prop() private data: any;

  @Watch('data')
  onDataChange(data: any) {
    if (data.id > 0) {
      const obj: any = JSON.parse(JSON.stringify(data));
      this.modelForm = {
        startTime: obj.trackDate,
        frequency: obj.trackFrequency,
        duration: obj.trackDuration,
        valdate: obj.effectiveDate,
      };
    } else {
      this.resetData();
    }
  }

  modelForm: any = {
    startTime: '',
    frequency: '',
    duration: '',
    valdate: '',
  };
  loading: boolean = false;

  rules = {
    startTime: [
      { required: true, message: '请选择启动时间', trigger: 'blur' },
    ],
    valdate: [
      { required: true, message: '请选择启动时间' },
    ],
    frequency: [
      { required: true, message: '请输入追踪频率' },
      {
        validator: this.checkFrequency, trigger: 'blur',
      },
    ],
    duration: [
      { required: true, message: '请输入追踪时长' },
      {
        validator: this.checkFrequency, trigger: 'blur',
      },
    ],
  }

  // 验证追踪频率
  @Emit()
  checkFrequency(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const exp: any = /^[0-9]*$/;
        if (exp.test(value)) {
          callback();
        } else {
          callback(new Error('追踪频率输入错误，请重新输入'));
        }
      } else {
        callback(new Error('追踪频率不能为空！'));
      }
    }, 500);
  }
  // 验证追踪时长
  @Emit()
  checkDuration(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const exp: any = /^[0-9]*$/;
        if (exp.test(value)) {
          callback();
        } else {
          callback(new Error('追踪时长输入错误，请重新输入'));
        }
      } else {
        callback(new Error('追踪时长不能为空！'));
      }
    }, 500);
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
      valdate: '',
    };
  }
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
        this.modelForm.valdate = entity.valdate;
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
      cfgName: 'wirelessDeviceReserve',
      // 启动时间$生效时间$启动时长$频率
      cfgVal: `${this.modelForm.startTime}$${this.modelForm.valdate}$${this.modelForm.duration}$${this.modelForm.frequency}`,
    };
    From.validate((valid: any) => {
      if (valid) {
        vehicleDeviceRev(obj).then((res) => {
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
        title="预约"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="model">
          <el-form-item label="追踪时间" prop="startTime">
            <el-time-select
              v-model={this.modelForm.startTime}
              id="startTime"
              picker-options={this.timeSet}
              onChange={this.timeChange}
              style="width:100%"
              placeholder="请选择追踪时间">
            </el-time-select>
          </el-form-item>
          <el-form-item label="生效时间" prop="valdate">
            <el-input
              id="valdate"
              v-model={this.modelForm.valdate}
              readOnly={true}
              placeholder="计算中..."
            ></el-input>
          </el-form-item>
          <el-form-item label="追踪时长" prop="duration">
            <el-input
              id="duration"
              v-model={this.modelForm.duration}
              placeholder="请输入追踪时长"
            >
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
          <el-form-item label="追踪频率" prop="frequency">
            <el-input
              id="frequency"
              v-model={this.modelForm.frequency}
              placeholder="请输入追踪频率"
            >
              <template slot="append">分钟/次</template>
            </el-input>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col offset={9} span={12}>
            <el-button size="small" id="submit" type="primary" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
