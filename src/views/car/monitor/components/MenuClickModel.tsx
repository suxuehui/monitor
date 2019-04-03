import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button,
} from 'element-ui';
import { vehicleDelete } from '@/api/monitor';
import './MenuClickModel.less';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-button': Button,
  },
})
export default class DeleteModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop({ default: '' }) private menuStr !: string;

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
    this.loading = false;
  }

  newCfgVal: string = ''

  onSubmit() {
    this.loading = true;
    const obj: any = {
      id: this.data.id,
    };
    vehicleDelete(obj).then((res) => {
      if (res.result.resultCode === '0') {
        this.$emit('refresh');
        this.closeModal();
        this.$message.success(res.result.resultMessage);
      } else {
        setTimeout(() => {
          this.loading = false;
          this.$message.error(res.result.resultMessage);
        }, 1000);
      }
    });
  }

  render() {
    return (
      <el-dialog
        width="540px"
        title="操作确认"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="box">
          <p>确定执行<span class="info">  {this.menuStr}  </span>操作?</p>
        </div>
        <div class="unbindBtn">
          <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
          <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
        </div>
      </el-dialog>
    );
  }
}
