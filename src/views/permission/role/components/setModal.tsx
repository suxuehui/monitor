import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Dialog, Input, Button, Checkbox, Form, CheckboxGroup } from 'element-ui';
import { roleSaveRoleMenu } from '@/api/permission';
import { getListByUser, menuSelect } from '@/api/menu';
import './setModal.less';

@Component({
  components: {
  'el-dialog': Dialog,
  'el-checkbox': Checkbox,
  'el-checkbox-group': CheckboxGroup,
  'el-input': Input,
  'el-button': Button,
  'el-form': Form,
  }
  })
export default class SetModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;
  modelForm: any = {};

  menuList: any = []
  checkList: number[] = [] // 权限选中项

  loading: boolean = false;

  mounted() {
    menuSelect(null).then((res) => {
      if (res.result.resultCode === '0') {
        this.menuList = res.entity;
        this.setList(this.menuList);
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // @Watch('data')
  // onDataChange() {
  //   this.checkList = this.data.menuIdList;
  // }

  setList(list: any) {
    return (
      <el-checkbox-group v-model={this.checkList}>
        <table cellspacing="0" cellpadding="0">
          <thead>
            <tr>
              <th>一级菜单</th>
              <th>二级菜单</th>
              <th>权限列表</th>
            </tr>
          </thead>
          <tbody>
            {
              list.map((item: any, index: number) =>
              (item.list.length > 0 ?'1':'2'))

                  // item.list.map((items: any, indexs: number) => (
                  //   <tr>
                  //     {
                  //       !indexs ?
                  //       <td
                  //         rowspan={item.list.length}>
                  //         <el-checkbox label={item.id}>
                  //           {item.name}
                  //         </el-checkbox>
                  //       </td> : null
                  //     }
                  //     <td><el-checkbox label={items.id}>{items.name}</el-checkbox></td>
                  //     <td>
                  //       {
                  //         items.list.map((three: any, ind: number) => <el-checkbox
                  //           label={three.id}>
                  //           {three.name}
                  //         </el-checkbox>)
                  //       }
                  //     </td>
                  //   </tr>
                  // ))
            }
          </tbody>
        </table>
      </el-checkbox-group>
    );
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    From.resetFields();
  }

  onSubmit() {
    let obj: any = {};
    obj = {
      roleName: this.data.roleName,
      remark: this.data.remark,
      menuIdList: this.checkList,
      roleId: this.data.roleId,
    };
    this.loading = true;
    // roleUpdate(obj).then((res) => {
    //   if (res.result.resultCode) {
    //     setTimeout(() => {
    //       this.loading = false;
    //       this.$message.success(res.result.resultMessage);
    //       this.$emit('refresh');
    //     }, 1500);
    //   } else {
    //     setTimeout(() => {
    //       this.loading = false;
    //       this.$message.error(res.result.resultMessage);
    //     }, 1500);
    //   }
    // });
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
        <el-form model={this.modelForm} ref="modelForm" label-width="80px" class="model">
          <div class="container" >
            {this.setList(this.menuList)}
          </div>
        </el-form>
        <div class="btn">
          <el-button size="small" id="submit" type="primary" loading={this.loading} on-click={this.onSubmit}>提交</el-button>
          <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
        </div>
      </el-dialog>
    );
  }
}
