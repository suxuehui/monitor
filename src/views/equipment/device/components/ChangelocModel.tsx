import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button, Form, FormItem, Input,
} from 'element-ui';

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

  closeModal() {
    this.$emit('close');
  }

  onSubmit() {
    // this.loading = true;
    const obj: any = {
      imei: this.data.imei,
    };
    console.log(this.data.imei);
  }

  render() {
    return (
      <el-dialog
        width="450px"
        title="切换地址"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <p class="top">确定切换设备地址到</p>
        <p class="content">{this.data.imei}</p>
        <p class="alert">(请谨慎操作，切换后设备将改变上线地址)</p>
        <div class="btn">
          <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
          <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
        </div>
      </el-dialog>
    );
  }
}
