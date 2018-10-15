import { Component, Prop, Vue } from 'vue-property-decorator';
import { Col, Row, Dialog, Form, FormItem, Input, Button, TimeSelect } from 'element-ui';
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
  modelForm: any = {
    startTime: '',
    trackDuration: '',
  };
  loading: boolean = false;

  rules = {
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
    ],
    remark: [
      { required: true, message: '请输入职能描述', trigger: 'blur' },
    ],
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
    };
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
        <el-form model={this.modelForm} ref="modelForm" label-width="80px" class="model">
          <el-form-item label="追踪时间" prop="roleName">
            <el-time-select
              v-model={this.modelForm.startTime}
              id="roleName"
              picker-options={this.timeSet}
              style="width:100%"
              placeholder="请选择启动时间">
            </el-time-select>
          </el-form-item>
          <el-form-item label="生效时间" prop="remark1">
            <el-input
              id="remark1"
              disabled={true}
            ></el-input>
          </el-form-item>
          <el-form-item label="追踪时长" prop="remark2">
            <el-input
              id="remark2"
              placeholder="请输入追踪时长"
            >
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
          <el-form-item label="追踪频率" prop="remark3">
            <el-input
              id="remark3"
              placeholder="请输入追踪频率"
            >
              <template slot="append">分钟/次</template>
            </el-input>
          </el-form-item>
        </el-form>
        <el-row>
          <el-col offset={7} span={12}>
            <el-button size="small" id="submit" type="primary" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
