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

  @Prop() private time: any;

  loading: boolean = false;

  modelForm: any = {
    mainAddress: '',
    secondAddress: '',
  };

  @Watch('time')
  onTimeChange(data:any) {
    console.log(this.data);
    this.modelForm = {
      mainAddress: this.data.imei,
      secondAddress: this.data.orgName,
    };
  }

  closeModal() {
    this.$emit('close');
    setTimeout(() => {
      this.modelForm = {
        mainAddress: '',
        secondAddress: '',
      };
    }, 200);
  }

  render() {
    return (
      <el-dialog
        width="520px"
        title="上线地址"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} label-width="80px" class="model">
          <el-row>
            <el-col span={24}>
              <el-form-item label="主地址" prop="mainAddress">
                <el-input
                  id="mainAddress"
                  disabled={true}
                  v-model={this.modelForm.mainAddress}
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="副地址" prop="secondAddress">
                <el-input
                  id="secondAddress"
                  disabled={true}
                  type="textarea"
                  v-model={this.modelForm.secondAddress}
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-dialog>
    );
  }
}
