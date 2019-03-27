import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button, RadioGroup, Radio,
} from 'element-ui';
import { cmdControl } from '@/api/monitor';
import './ControlModel.less';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
    'el-radio-group': RadioGroup,
    'el-radio': Radio,
  },
})
export default class ControlModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private title: any;

  @Prop() private time: any;

  loading: boolean = false;

  modelForm: any = {
    cmd: '',
  };

  @Watch('time')
  dataChange() {
    this.modelForm = {
      cmd: '',
    };
  }

  closeModal() {
    this.$emit('close');
    this.modelForm = {
      cmd: '',
    };
    setTimeout(() => {
      this.loading = false;
    }, 200);
  }

  onSubmit() {
    const cmd = this.modelForm.cmd ? this.modelForm.cmd : this.data.cmd;
    console.log(cmd);
    console.log(this.data);
    // this.loading = true;
    // controlCar({ imei: this.data.imei, cmd: this.data.cmd }).then((res: any) => {
    //   if (res.result.resultCode === '0') {
    //     setTimeout(() => {
    //       this.loading = false;
    //       this.$message.success(res.result.resultMessage);
    //       this.$emit('refresh');
    //     }, 1500);
    //   } else {
    //     setTimeout(() => {
    //       this.loading = false;
    //       this.$message.error(res.result.resultMessage);
    //     }, 1500);
    //   }
    // });
  }

  renderContent() {
    if (this.data.num === '05') {
      return (
        <el-radio-group v-model={this.modelForm.cmd} style={{ margin: '15px 0 30px' }}>
          <el-radio label="1">上锁断油</el-radio>
          <el-radio label="2">熄火断油</el-radio>
          <el-radio label="3">立即断油</el-radio>
        </el-radio-group>
      );
    } if (this.data.num === '06') {
      return (
        <el-radio-group v-model={this.modelForm.cmd} style={{ margin: '15px 0 30px' }}>
          <el-radio label="1">开锁通油</el-radio>
          <el-radio label="2">立即通油</el-radio>
        </el-radio-group>
      );
    } if (this.data.num === '07') {
      return (
        <el-radio-group v-model={this.modelForm.cmd} style={{ margin: '15px 0 30px' }}>
          <el-radio label="1">熄火断油</el-radio>
          <el-radio label="2">立即断油</el-radio>
        </el-radio-group>
      );
    }
    return <div class="controlModel">
      <p>确定对该车辆进行<span class="info">{this.data.operateStr}</span>操作？</p>
    </div>;
  }

  render() {
    return (
      <el-dialog
        width="415px"
        top="23vh"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        {
          this.renderContent()
        }
        <el-row>
          <el-col offset={6} span={12}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
