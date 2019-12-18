import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button, Form, FormItem, Input,
} from 'element-ui';
import {
  changeAddress,
} from '@/api/equipment';
import './ChangelocModel.less';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-input': Input,
    'el-form-item': FormItem,
    'el-button': Button,
  },
})
export default class ChangelocModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  loading: boolean = false;

  // 设备备用地址
  deviceUrl: any = {};

  closeModal() {
    this.$emit('close');
  }

  onSubmit() {
    this.loading = true;
    changeAddress(this.data.imei).then((res: any) => {
      const { entity, result } = res;
      if (result.resultCode === '0') {
        setTimeout(() => {
          this.loading = false;
          this.$message.success(result.resultMessage);
          this.$emit('refresh');
        }, 500);
      } else {
        setTimeout(() => {
          this.loading = false;
          this.$message.error(result.resultMessage);
        }, 500);
      }
    });
  }

  render() {
    return (
      <el-dialog
        width="500px"
        title="切换地址"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="content">
          <p>确定切换设备地址</p>
          <ul class="locs">
            <li class="item">
              <span class="tit">主地址：</span>
              <span class="loc">{this.data.masterUrl ? this.data.masterUrl : '--'}</span>
            </li>
            <li class="item">
              <span class="tit">副地址：</span>
              <span class="loc">{this.data.slaveUrl ? this.data.slaveUrl : '--'}</span>
            </li>
          </ul>
          <p class="alert">(请谨慎操作，切换后设备将改变上线地址)</p>
        </div>
        <div class="changelocBtn">
          <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
          <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
        </div>
      </el-dialog>
    );
  }
}
