import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import { roleUpdateStatus } from '@/api/permission';
import { getListByUser, menuSelect } from '@/api/menu';
import AddModal from '@/views/permission/role/components/AddModal';
import SetModal from '@/views/permission/role/components/setModal';

interface ActiveType { key: any, value: any, label: string }
@Component({
  components: {
  'el-tag': Tag,
  'add-modal': AddModal,
  'set-modal': SetModal,
  }
  })
export default class Role extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'active',
      type: 'select',
      label: '状态',
      placeholder: '请选择状态',
      options: [],
    },
    {
      key: 'roleName',
      type: 'input',
      label: '角色名称',
      placeholder: '请输入角色名称',
    },
  ];
  // 高级筛选
  filterGrade: FilterFormList[] = [];
  // 筛选参数
  filterParams: any = {
    active: 0,
    roleName: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/sys/role/list';

  opreat: Opreat[] = [
    {
      key: 'edit',
      rowKey: 'userName',
      color: 'blue',
      text: '编辑',
      roles: true,
      disabled: (row: any) => (row.roleType !== 2),
    },
    {
      key: 'freeze',
      rowKey: 'userName',
      color: (row: any) => (row.activeStatus === 1 ? 'red' : 'green'),
      text: (row: any) => (row.activeStatus === 1 ? '禁用' : '启用'),
      msg: (row: any) => (row.activeStatus === 1 ? '是否要禁用？' : '是否要启用？'),
      roles: true,
      // disabled: (row: any) => (row.roleType !== 2),
    },
    {
      key: 'setAuth',
      rowKey: 'userName',
      color: 'blue',
      text: '设置权限',
      roles: true,
      disabled: (row: any) => (row.roleType !== 2),
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '角色名称', prop: 'roleName' },
    { label: '职能描述', prop: 'remark' },
    {
      label: '成员数量',
      prop: 'countUser',
      sortable: true,
      sortBy: 'countUser',
      formatter: (row: any) => (row.countUser ? row.countUser : '--'),
    },
    {
      label: '添加时间',
      prop: 'crtTime',
      sortable: true,
      sortBy: 'crtTime',
    },
    { label: '状态', prop: 'activeStatus', formatter: this.statusDom },
  ];

  statusDom(row: any) {
    const type = row.activeStatus === 1 ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.activeStatus === 1 ? '已启用' : '未启用'}</el-tag>;
  }

  mounted() {
    this.filterList[0].options = this.activeTypes;
  }

  // 激活状态:1-启用；2-禁用
  activeTypes: ActiveType[] = [
    { key: null, value: 0, label: '全部' },
    { key: 1, value: 1, label: '已启用' },
    { key: 2, value: 2, label: '未启用' },
  ]

  // 新增、编辑
  addVisible: boolean = false;
  addTitle: string = '';
  // 权限设置
  setVisible: boolean = false;
  setTitle: string = '';

  modelForm: any = {
    roleName: '',
    remark: '',
  };
  setAuthData: any = {}

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      this.addTitle = '编辑角色';
      this.addVisible = true;
      this.modelForm = row;
    } else if (key === 'freeze') {
      roleUpdateStatus({ roleId: row.roleId }).then((res) => {
        if (res.result.resultCode === '0') {
          FromTable.reloadTable();
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'setAuth') {
      this.setVisible = true;
      this.setAuthData = row;
      this.setTitle = `权限设置-${row.roleName}`;
    }
  }
  addModel() {
    this.addVisible = true;
    this.modelForm = null;
    this.addTitle = '新增角色';
  }
  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    this.setVisible = false;
    const addBlock: any = this.$refs.addTable;
    setTimeout(() => {
      addBlock.resetData();
    }, 200);
  }

  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
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
          opreatWidth={'180px'}
          on-addBack={this.addModel}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          localName={'role'}
          export-btn={true}
          on-menuClick={this.menuClick}
        />
        <add-modal
          ref="addTable"
          title={this.addTitle}
          visible={this.addVisible}
          data={this.modelForm}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></add-modal>
        <set-modal
          title={this.setTitle}
          visible={this.setVisible}
          data={this.setAuthData}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></set-modal>
      </div>
    );
  }
}
