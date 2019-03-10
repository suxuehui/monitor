import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Input, Button, Form, Tree,
} from 'element-ui';
import { roleSaveRoleMenu, roleInfo } from '@/api/permission';
import { menuSelect } from '@/api/menu';
import './setModal.less';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-tree': Tree,
    'el-input': Input,
    'el-button': Button,
    'el-form': Form,
  },
})
export default class SetModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  @Prop() private time: any;

  modelForm: any = {};

  menuList: any = []

  checkList: number[] = [] // 权限选中项

  loading: boolean = false;

  created() {
    menuSelect(null).then((res) => {
      if (res.result.resultCode === '0') {
        this.menuList = res.entity;
      } else {
        this.$message.error(res.result.resultMessage || '未知错误');
      }
    });
  }


  @Watch('time')
  onDataChange(data: any) {
    const trees: any = this.$refs.tree;
    if (trees) {
      trees.setCheckedKeys([]);
    }
    this.checkList = [];
    roleInfo({ roleId: this.data.roleId }).then((res) => {
      const { result: { resultCode, resultMessage }, entity } = res;
      if (resultCode === '0') {
        if (entity.menuIds) {
          this.checkList = entity.menuIds.split(',');
          if (trees) {
            trees.setCheckedKeys(this.checkList);
          }
        }
      } else {
        this.$message.error(resultMessage || '未知错误');
      }
    });
  }

  setList(list: any) {
    return (
      <el-tree
        data={list}
        ref="tree"
        show-checkbox
        node-key="id"
        default-checked-keys={this.checkList}
        props={
          {
            children: 'list',
            label: 'name',
          }
        }>
      </el-tree>
    );
  }

  getCheckedNodes() {
    const trees: any = this.$refs.tree;
    return trees.getCheckedNodes();
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    From.resetFields();
    this.loading = false;
  }

  onSubmit() {
    if (this.loading) return;
    this.loading = true;
    const selectTree = this.getCheckedNodes();
    const selectId: object[] = [];
    selectTree.forEach((item: any, index: number) => {
      selectId.push({
        menuCode: '0/',
        menuId: item.id,
      });
    });
    roleSaveRoleMenu({
      menuRoleAddDTOS: selectId,
      roleId: this.data.roleId,
    }).then((res) => {
      if (res.result.resultCode === '0') {
        setTimeout(() => {
          this.loading = false;
          this.$message.success(res.result.resultMessage);
          this.$emit('refresh');
        }, 1500);
      } else {
        setTimeout(() => {
          this.loading = false;
          this.$message.error(res.result.resultMessage || '未知错误');
        }, 1500);
      }
    });
  }

  render() {
    return (
      <el-dialog
        width="700px"
        class="setModal"
        top="10px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} ref="modelForm" label-width="80px" class="model">
          <div class="container" >
            {this.setList(this.menuList)}
          </div>
        </el-form>
        <div class="btn" slot="footer">
          <el-button size="small" id="submit" type="primary" loading={this.loading} on-click={this.onSubmit}>提交</el-button>
          <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
        </div>
      </el-dialog>
    );
  }
}
