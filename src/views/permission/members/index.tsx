import { Component, Vue, Emit } from 'vue-property-decorator';
import { Tag, Loading } from 'element-ui';
import { FilterFormList, tableList, Opreat } from '@/interface';
import { getRolesList, userLock, userUnlock } from '@/api/permission';

import AddModal from '@/views/permission/members/components/AddModal';
import './index.less';

interface RoleType { key: number, value: string, label: string }
interface ActiveType { key: any, value: any, label: string }

@Component({
  components: {
  'el-tag': Tag,
  'add-modal': AddModal,
  }
  })
export default class Member extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'roleId',
      type: 'select',
      label: '角色类型',
      placeholder: '请选择角色类型',
      options: [],
    },
    {
      key: 'active',
      type: 'select',
      label: '成员状态',
      placeholder: '请选择成员状态',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '成员姓名',
      placeholder: '成员姓名或登录账号',
    },
  ];
  // 高级筛选
  filterGrade: FilterFormList[] = [];
  // 筛选参数
  filterParams: any = {
    roleId: '',
    active: '',
    keyword: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/monitor/sys/user/list';

  activeTypes: ActiveType[] = [
    { key: null, value: null, label: '全部' },
    { key: true, value: true, label: '正常' },
    { key: false, value: false, label: '冻结' },
  ]

  mounted() {
    this.filterList[1].options = this.activeTypes;
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

  opreat: Opreat[] = [
    {
      key: 'edit',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'freeze',
      color: (row: any) => (row.active ? 'red' : 'green'),
      text: (row: any) => (row.active ? '冻结' : '解冻'),
      msg: (row: any) => (row.active ? '是否要冻结？' : '是否要解冻？'),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '成员姓名', prop: 'realName' },
    { label: '登录账号', prop: 'userName' },
    { label: '角色类型', prop: 'roleIdList', formatter: this.roleChange },
    { label: '备注', prop: 'remark' },
    {
      label: '添加时间',
      prop: 'createTime',
      sortable: true,
      sortBy: 'createTime',
    },
    {
      label: '最后登录',
      prop: 'lastTime',
      sortable: true,
      sortBy: 'lastTime',
    },
    { label: '状态', prop: 'active', formatter: this.statusDom },
  ];

  // 角色
  roleChange(row: any) {
    const roleTypeOptions: string[] = row.roleIdList.split(',');
    const arr = this.roleConfirm(roleTypeOptions);
    return arr.map(item => <el-tag size="medium" type='success' style="marginRight:5px">{item.label}</el-tag>);
  }

  statusDom(row: any) {
    const type = row.active ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.active ? '正常' : '冻结'}</el-tag>;
  }

  roleConfirm(roleTypeOptions: any) {
    const arr: RoleType[] = [];
    this.roleTypeList.forEach((item) => {
      if (roleTypeOptions.indexOf(item.value) > -1) {
        arr.push(item);
      }
    });
    return arr;
  }

  // 新增、编辑
  addVisible: boolean = false;
  addTitle: string = '';

  modelForm: any = {
    name: '',
    account: '',
    roles: {},
    remark: '',
    password: '',
  };

  freezeData: any = {
    userId: '',
  }

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      this.modelForm = row;
      this.addVisible = true;
      this.addTitle = '编辑';
    } else if (key === 'freeze') {
      if (row.active) {
        // 冻结
        userLock({ userIds: row.userId }).then((res) => {
          if (res.result.resultCode) {
            FromTable.reloadTable();
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      } else {
        // 解冻
        userUnlock({ userIds: row.userId }).then((res) => {
          if (res.result.resultCode) {
            FromTable.reloadTable();
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      }
    }
  }
  addModel() {
    this.addVisible = true;
    this.modelForm = null;
    this.addTitle = '新增';
  }
  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
  }
  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.addVisible = false;
  }
  render(h: any) {
    return (
      <div class="member-wrap">
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          add-btn={true}
          data-type={'JSON'}
          on-addBack={this.addModel}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          export-btn={true}
          on-menuClick={this.menuClick}
        />
        <add-modal
          title={this.addTitle}
          visible={this.addVisible}
          data={this.modelForm}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></add-modal>
      </div>
    );
  }
}
