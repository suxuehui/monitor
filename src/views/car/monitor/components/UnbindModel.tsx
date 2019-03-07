import {
  Component, Prop, Vue, Watch, Emit,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Row, Col, Form, FormItem, Input, Button,
} from 'element-ui';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-tag': Tag,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
  },
})
export default class UnbindModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  modelForm: any = {
    plateNum: '',
  };

  loading: boolean = false;

  rules = {}

  // 重置数据
  resetData() {
    this.modelForm = {
      imei: '',
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
    this.loading = true;
    const From: any = this.$refs.modelForm;
    const obj: any = {
      imei: this.data.imei,
    };
    From.validate((valid: any) => {
      if (valid) {
        console.log(222);
      } else {
        this.loading = false;
        return false;
      }
      return false;
    });
  }

  render() {
    return (
      <div>
        <el-dialog
          width="500px"
          title="解除绑定"
          visible={this.visible}
          before-close={this.closeModal}
          close-on-click-modal={false}
        >
          <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="carBindModel">
            <el-form-item label="imei号" prop="imei">
              111
            </el-form-item>
          </el-form>
          <div style={{ textAlign: 'center' }}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </el-dialog>
      </div >
    );
  }
}
