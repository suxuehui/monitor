import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Input, Button, Form, Tree,
} from 'element-ui';
import lodash from 'lodash';
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

  menuList: any = [];

  checkedList: number[] = []; // 权限选中项

  checkBoxMainArr: any = []; // 权限第一级数组集合

  loading: boolean = false;

  @Watch('time')
  onDataChange(data: any) {
    this.checkBoxMainArr = [];
    const arr: any = [];
    menuSelect({ roleId: this.data.roleId }).then((res) => {
      const { result: { resultCode, resultMessage }, entity } = res;
      if (resultCode === '0') {
        this.menuList = entity.sort(this.compare('orderNum'));
        this.menuList.forEach((item: any) => {
          arr.push(`${item.id}`);
          if (item.list !== null && item.list.length > 0) {
            item.list.forEach((it: any) => {
              if (it.list !== null && it.list.length > 0) {
                arr.push(`${it.id}`);
              }
            });
          }
          this.checkBoxMainArr = this.arrUnique(arr);
        });
        // 查询到权限选项后再查角色信息
        this.getRoleInfo();
      } else {
        this.$message.error(resultMessage);
      }
    });
  }

  // 数组去重
  arrUnique(arr: any) {
    return Array.from(new Set(arr));
  }

  // 按照指定字符排序
  compare(prop: any) {
    return function compareInner(obj1: any, obj2: any) {
      const val1 = obj1[prop];
      const val2 = obj2[prop];
      let num: number = 0;
      if (val1 < val2) {
        num = -1;
      } else if (val1 > val2) {
        num = 1;
      } else {
        num = 0;
      }
      return num;
    };
  }

  // 获取角色权限信息
  getRoleInfo() {
    const trees: any = this.$refs.tree;
    if (trees) {
      trees.setCheckedKeys([]);
    }
    this.checkedList = [];
    let arr: any = [];
    roleInfo({ roleId: this.data.roleId }).then((res) => {
      const { result: { resultCode, resultMessage }, entity } = res;
      if (resultCode === '0') {
        if (entity.menuIds) {
          arr = lodash.cloneDeep(entity.menuIds.split(','));
          arr.forEach((item: any, index: number) => {
            // 设置>0：取消对首页的验证
            if (this.checkBoxMainArr.indexOf(item) === -1) {
              this.checkedList.push(item);
            }
          });
          if (trees) {
            trees.setCheckedKeys(this.checkedList);
          }
        }
      } else {
        this.$message.error(resultMessage);
      }
    });
  }

  ListIdGroup: any = [
    // 车辆监控列表
    {
      priKey: 26,
      keys: [25, 26, 27, 28, 29, 154, 155, 156, 157, 158],
    },
    // 轨迹列表
    {
      priKey: 31,
      keys: [31, 32],
    },
    // 追踪记录列表
    {
      priKey: 33,
      keys: [33, 35],
    },
    // 追踪设备列表
    {
      priKey: 34,
      keys: [34, 36, 37, 38],
    },
    // 电子围栏
    {
      priKey: 39,
      keys: [39, 40, 41],
    },
    // 设备管理
    {
      priKey: 66,
      keys: [66, 67, 68, 69, 71, 72, 73, 78, 150, 151, 152, 153],
    },
    // 设备配置
    {
      priKey: 131,
      keys: [131, 132, 133, 134, 135, 136, 137, 138, 139, 140],
    },
    // 商户管理
    {
      priKey: 79,
      keys: [79, 80, 81, 82, 83, 84],
    },
    // 通知公告
    {
      priKey: 86,
      keys: [86, 87, 88, 89],
    },
    // 告警消息
    {
      priKey: 90,
      keys: [90, 91, 92, 93],
    },
    // 行驶统计
    {
      priKey: 94,
      keys: [94, 95],
    },
    // 成员管理
    {
      priKey: 96,
      keys: [96, 97, 98, 99, 100, 101],
    },
    // 角色
    {
      priKey: 103,
      keys: [103, 104, 105, 106, 107, 109],
    },
    // 系统配置
    {
      priKey: 111,
      keys: [110, 111],
    },
    // 配置文件
    {
      priKey: 114,
      keys: [114, 115, 116, 117, 118],
    },
  ]

  boxCheck(data: any, node: any) {
    const trees: any = this.$refs.tree;
    const checkedArr: any = node.checkedKeys;
    let targetId: any = 0;
    // 判断是否在上述约束条件中：
    this.ListIdGroup.forEach((item: any) => {
      if (item.keys.indexOf(data.id) > -1) {
        targetId = item.priKey;
        this.contactList(checkedArr, data.id, targetId);
      } else {
        trees.setCheckedKeys(checkedArr);
      }
    });
  }

  contactList(checkedArr: any, clickId: number, targetId: number) {
    const trees: any = this.$refs.tree;
    if (checkedArr.indexOf(clickId) <= -1) {
      // 删除
      this.ListIdGroup.forEach((item: any) => {
        if (item.priKey === clickId) {
          if (this.getArrEqual(item.keys, checkedArr).length > 0) {
            const arr = lodash.cloneDeep(checkedArr);
            arr.push(targetId);
            setTimeout(() => {
              trees.setCheckedKeys(arr);
            }, 10);
          } else {
            setTimeout(() => {
              trees.setCheckedKeys(checkedArr);
            }, 10);
          }
        } else {
          trees.setCheckedKeys(checkedArr);
        }
      });
    } else {
      // 新增
      const arr = lodash.cloneDeep(checkedArr);
      arr.push(targetId);
      setTimeout(() => {
        trees.setCheckedKeys(arr);
      }, 10);
    }
  }

  // 找出两个数组相同元素并返回
  getArrEqual(arr1: any, arr2: any) {
    const newArr = [];
    for (let i = 0; i < arr2.length; i+=1) {
      for (let j = 0; j < arr1.length; j+=1) {
        if (arr1[j] === arr2[i]) {
          newArr.push(arr1[j]);
        }
      }
    }
    return newArr;
  }


  // 设置权限列表
  setList(list: any) {
    return (
      <el-tree
        data={list}
        ref="tree"
        show-checkbox
        node-key="id"
        default-checked-keys={this.checkedList}
        on-check={this.boxCheck}
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
    const arr = trees.getCheckedKeys().concat(trees.getHalfCheckedKeys());
    return arr;
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    From.resetFields();
    this.loading = false;
    this.checkBoxMainArr = [];
    this.checkedList = [];
  }

  onSubmit() {
    this.loading = true;
    const selectTree = this.getCheckedNodes();
    const selectId: object[] = [];
    selectTree.forEach((item: any, index: number) => {
      selectId.push({
        menuCode: '0/',
        menuId: item,
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
        <el-form model={this.modelForm} ref="modelForm" label-width="80px" class="fzkSetModel">
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
