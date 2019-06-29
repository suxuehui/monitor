import {
  Component, Prop, Vue, Watch,
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
export default class UploadModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private title: any;

  @Prop() private time: any;

  loading: boolean = false;

  closeModal() {
    this.$emit('close');
  }

  render() {
    return (
      <el-dialog
        width="520px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form label-width="80px" class="fzkUploadModel">
          <el-row>
            <el-col>
              <el-form-item label="主地址" prop="mainAddress">
                <el-input
                  id="mainAddress"
                  disabled={true}
                  v-model={this.data.masterUrl}
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="副地址" prop="secondAddress">
                <el-input
                  id="secondAddress"
                  disabled={true}
                  v-model={this.data.slaveUrl}
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-dialog>
    );
  }
}
