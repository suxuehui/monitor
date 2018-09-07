import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Button } from 'element-ui';
import { roleAdd, roleUpdate } from '@/api/permission';
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
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
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

  @Watch('data')
  onDataChange() {
    if (this.data) {
      this.modelForm = JSON.parse(JSON.stringify(this.data));
    } else {
      this.resetData();
    }
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
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    obj = {
      roleName: this.modelForm.roleName,
      remark: this.modelForm.remark,
      roleType: 2,
    };
    if (this.title === '新增角色') {
      From.validate((valid: any) => {
        if (valid) {
          this.loading = true;
          roleAdd(obj).then((res) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.$emit('refresh');
              }, 1500);
            } else {
              setTimeout(() => {
                this.loading = false;
                this.$message.error(res.result.resultMessage);
              }, 1500);
            }
          });
        } else {
          this.loading = false;
          return false;
        }
        return false;
      });
    } else {
      obj.id = this.data.roleId;
      From.validate((valid: any) => {
        if (valid) {
          this.loading = true;
          roleUpdate(obj).then((res) => {
            if (res.result.resultCode) {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                this.$emit('refresh');
              }, 1500);
            } else {
              setTimeout(() => {
                this.loading = false;
                this.$message.error(res.result.resultMessage);
              }, 1500);
            }
          });
        } else {
          this.loading = false;
          return false;
        }
        return false;
      });
    }
  }

  render() {
    return (
      <el-dialog
        width="600px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="model">
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
            <el-col span={24}>
              <el-form-item label="职能描述" prop="remark">
                <el-input
                  id="remark"
                  v-model={this.modelForm.remark}
                  type="textarea"
                  rows="4"
                  placeholder="请输入职能描述"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-row>
          <el-col offset={7} span={12}>
            <el-button size="small" id="submit" type="primary" loading={this.loading} on-click={this.onSubmit}>提交</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
