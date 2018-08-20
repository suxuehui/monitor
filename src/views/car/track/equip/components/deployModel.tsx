import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Dialog, Row, Col, Form, FormItem, Input, Button } from 'element-ui';
@Component({
  components: {
  'el-dialog': Dialog,
  'el-row': Row,
  'el-col': Col,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-input': Input,
  'el-button': Button,
  }
  })
export default class DeployModel extends Vue {
  @Prop({ default: false }) private visible !: boolean;
  @Prop() private data: any;
  modelForm: any = {
    roleName: '',
    remark: '',
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

  // 重置数据
  resetData() {
    this.modelForm = {
      roleName: '',
      remark: '',
    };
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
    }, 200);
  }

  onSubmit() {

  }

  render() {
    return (
      <el-dialog
        width="600px"
        title="配置"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} rules={this.rules} ref="modelForm" label-width="80px" class="model">
          <el-row>
            <el-col span={24}>
              <el-form-item label="角色名称" prop="roleName">
                <el-input
                  id="roleName"
                  v-model={this.modelForm.roleName}
                  placeholder="请输入角色名称"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-form-item label="职能描述" prop="remark">
                <el-input
                  id="remark"
                  v-model={this.modelForm.remark}
                  placeholder="请输入职能描述"
                ></el-input>
              </el-form-item>
              <el-form-item label="职能描述" prop="remark">
                <el-input
                  id="remark"
                  v-model={this.modelForm.remark}
                  placeholder="请输入职能描述"
                ></el-input>
              </el-form-item>
          </el-row>
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
