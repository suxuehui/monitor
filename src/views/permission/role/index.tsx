import { Component, Vue } from 'vue-property-decorator';
import qs from 'qs';
import { FilterFormList, tableList, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import exportExcel from '@/api/export';
import { roleUpdateStatus } from '@/api/permission';
import utils from '@/utils';
import AddModal from '@/views/permission/role/components/AddModal';
import SetModal from '@/views/permission/role/components/setModal';

interface ActiveType { key: any, value: any, label: string }
@Component({
  components: {
    'el-tag': Tag,
    'add-modal': AddModal,
    'set-modal': SetModal,
  },
  name: 'Role',
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

  operat: Opreat[] = [
    {
      key: 'edit',
      rowKey: 'roleName',
      color: 'blue',
      text: '编辑',
      roles: true,
      disabled: (row: any) => (row.roleType !== 2),
    },
    {
      key: 'forbid',
      rowKey: 'roleName',
      color: (row: any) => (row.activeStatus === 1 ? 'red' : 'green'),
      text: (row: any) => (row.activeStatus === 1 ? '禁用' : '启用'),
      msg: (row: any) => (row.activeStatus === 1 ? '是否要禁用？' : '是否要启用？'),
      roles: true,
      disabled: (row: any) => (row.roleType !== 2),
    },
    {
      key: 'setAuth',
      rowKey: 'roleName',
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
    { label: '添加人', prop: 'crtUserName' },
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

  created() {
    const getNowRoles: string[] = [
      // 操作
      '/sys/role/save', // 新增
      '/sys/role/edit', // 编辑
      '/sys/role/updateStatus', // 冻结解冻
      '/sys/role/saveRoleMenu', // 设置权限
      '/sys/role/exportExcel', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.showAddBtn = !!(res[0]); // 新增
      this.operat[0].roles = !!(res[1]); // 编辑
      this.operat[1].roles = !!(res[2]); // 冻结解冻
      this.operat[2].roles = !!(res[3]); // 设置权限
      this.showExportBtn = !!(res[4]); // 导出
    });
  }

  // 导出按钮展示
  showExportBtn: boolean = true;

  // 新增按钮展示
  showAddBtn: boolean = true;

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

  setTime: string = ''

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      this.addTitle = '编辑角色';
      this.addVisible = true;
      this.modelForm = {
        roleId: row.roleId,
        roleName: row.roleName,
        remark: row.remark,
      };
    } else if (key === 'forbid') {
      // 禁用、启用
      roleUpdateStatus({ roleId: row.roleId }).then((res) => {
        if (res.result.resultCode === '0') {
          FromTable.reloadTable();
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'setAuth') {
      // 设置权限
      this.setVisible = true;
      this.setAuthData = row;
      this.setTime = `${utils.getNowTime()}`;
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

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, `角色列表${utils.returnNowTime()}`, '/sys/role/exportExcel');
  }

  render(h: any) {
    return (
      <div>
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          add-btn={this.showAddBtn}
          export-btn={this.showExportBtn}
          opreatWidth={'180px'}
          on-addBack={this.addModel}
          operat={this.operat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          localName={'role'}
          on-downBack={this.downLoad}
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
          time={this.setTime}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></set-modal>
      </div>
    );
  }
}
