import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import AddModal from '@/views/permission/role/components/AddModal';
import SetModal from '@/views/permission/role/components/setModal';
import { roleLock, roleUnlock } from '@/api/permission';


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
    active: '',
    roleName: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/sys/role/list';

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
      text: (row: any) => (row.active ? '禁用' : '启用'),
      msg: (row: any) => (row.active ? '是否要禁用？' : '是否要启用？'),
      roles: true,
    },
    {
      key: 'setAuth',
      color: 'blue',
      text: '设置权限',
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '角色名称', prop: 'roleName' },
    { label: '职能描述', prop: 'remark' },
    { label: '成员数量', prop: 'countUser' },
    {
      label: '添加时间',
      prop: 'createTime',
      sortable: true,
      sortBy: 'createTime',
    },
    { label: '状态', prop: 'active', formatter: this.statusDom },
  ];

  statusDom(row: any) {
    const type = row.active ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.active ? '已启用' : '未启用'}</el-tag>;
  }

  activeTypes: ActiveType[] = [
    { key: null, value: null, label: '全部' },
    { key: true, value: true, label: '已启用' },
    { key: false, value: false, label: '未启用' },
  ]

  mounted() {
    this.filterList[0].options = this.activeTypes;
  }

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
      this.addVisible = true;
      this.modelForm = row;
      this.addTitle = '编辑';
    } else if (key === 'freeze') {
      if (row.active) {
        // 禁用
        roleLock({ userIds: row.userId }).then((res) => {
          if (res.result.resultCode) {
            FromTable.reloadTable();
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      } else {
        // 启用
        roleUnlock({ userIds: row.userId }).then((res) => {
          if (res.result.resultCode) {
            FromTable.reloadTable();
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      }
    } else if (key === 'setAuth') {
      this.setVisible = true;
      this.setAuthData = row;
      this.setTitle = `权限设置-${row.roleName}`;
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
    this.setVisible = false;
  }

  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.addVisible = false;
    this.setVisible = false;
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
          dataType={'JSON'}
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
