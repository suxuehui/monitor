import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button, Form, FormItem, Input,
} from 'element-ui';

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
export default class A1Threshold extends Vue {
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
        width="520px"
        title="阈值设置"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        bsj wk
      </el-dialog>
    );
  }
}
