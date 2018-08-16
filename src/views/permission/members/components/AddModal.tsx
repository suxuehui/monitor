import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option } from 'element-ui';
import { getRolesList, userUpdate, userAdd } from '@/api/permission';

interface RoleType { key: number, value: string, label: string }

@Component({
  components: {
  'el-dialog': Dialog,
  'el-tag': Tag,
  'el-row': Row,
  'el-col': Col,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-input': Input,
  'el-select': Select,
  'el-button': Button,
  'el-option': Option
  }
  })
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;

  created() {
    this.modelForm = JSON.parse(JSON.stringify(this.data));
  }
  modelForm: any = {
    realName: '',
    userName: '',
    roles: {},
    remark: '',
    password: '',
  };

  loading: boolean = false;
  rules = {
    realName: [
      { required: true, message: '请输入成员姓名', trigger: 'blur' },
    ],
    userName: [
      { required: true, message: '请输入登录账号', trigger: 'blur' },
    ],
    roleIdList: [
      { required: true, message: '请选择角色类型', trigger: 'change' },
    ],
    password: [
      { required: false },
    ],
    remark: [
      { required: false },
    ],
  }

  mounted() {
    getRolesList(null).then((res) => {
      res.entity.forEach((item: any) => {
        item.key = parseInt(item.roleId, 10);
        item.value = item.roleId;
        item.label = item.roleName;
      });
      this.roleTypeList = res.entity;
    });
  }

  roleTypeList: RoleType[] = []

  @Watch('data')
  onDataChange() {
    if (this.data) {
      this.modelForm = JSON.parse(JSON.stringify(this.data));
      this.modelForm.roleIdList = this.modelForm.roleIdList.split(',');
    } else {
      this.resetData();
    }
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      realName: '',
      userName: '',
      roleIdList: [],
      remark: '',
      password: '',
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
      realName: this.modelForm.realName,
      userName: this.modelForm.userName,
      roleIdList: this.modelForm.roleIdList.join(','),
      remark: this.modelForm.remark,
      password: this.modelForm.password,
    };
    if (this.title === '新增') {
      // 新增
      From.validate((valid: any) => {
        if (valid) {
          this.loading = true;
          userAdd(obj).then((res) => {
            if (res.result.resultCode) {
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
          return false;
        }
        return false;
      });
    } else {
      // 修改
      From.validate((valid: any) => {
        if (valid) {
          obj.userId = this.data.userId;
          this.loading = true;
          userUpdate(obj).then((res) => {
            if (res.result.resultCode) {
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
          return false;
        }
        return false;
      });
    }
  }

  render() {
    return (
      <el-dialog
        width="630px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} ref="modelForm" rules={this.rules} label-width="80px" class="model">
          <el-row>
            <el-col span={12}>
              <el-form-item label="成员姓名" prop="realName">
                <el-input
                  id="realName"
                  v-model={this.modelForm.realName}
                  placeholder="请输入成员姓名"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="角色类型" prop="roleIdList">
                <el-select
                  id="roleIdList"
                  v-model={this.modelForm.roleIdList}
                  multiple={true}
                  filterable={true}
                  disabled={this.title === '编辑'}
                  placeholder="请选择角色类型"
                  style="width:100%"
                >
                  {
                    this.roleTypeList.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="登录账号" prop="userName">
                <el-input
                  id="userName"
                  v-model={this.modelForm.userName}
                  disabled={this.title === '编辑'}
                  placeholder="请输入登录账号"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={12}>
              <el-form-item label="登录密码" prop="password">
                <el-input
                  id="password"
                  v-model={this.modelForm.password}
                  type="password"
                  placeholder="请输入登录密码"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item label="备注" prop="remark">
                <el-input
                  id="remark"
                  v-model={this.modelForm.remark}
                  type="textarea"
                  rows="2"
                  placeholder="请输入备注"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <el-row>
          <el-col offset={7} span={12}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>提交</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    );
  }
}
