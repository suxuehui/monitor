import { Component, Vue } from 'vue-property-decorator';
import qs from 'qs';
import { Tag, Tooltip } from 'element-ui';
import { FilterFormList, tableList, Opreat } from '@/interface';
import exportExcel from '@/api/export';
import { workerDetail, workerLock, workerUnlock } from '@/api/permission';
import utils from '@/utils';
import AddModal from '@/views/permission/installer/components/AddModal';

interface ActiveType { key: any, value: any, label: string }

@Component({
  components: {
    'el-tag': Tag,
    'add-modal': AddModal,
    'el-tooltip': Tooltip,
  },
  name: 'Installer',
})
export default class Installer extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'active',
      type: 'select',
      label: '成员状态',
      placeholder: '状态(全部)',
      options: [],
    },
    {
      key: 'keyWord',
      type: 'input',
      label: '成员姓名',
      placeholder: '专员姓名或登录账号',
    },
  ];

  // 高级筛选
  filterGrade: FilterFormList[] = [];

  // 筛选参数
  filterParams: any = {
    active: null,
    keyWord: '',
  };

  outParams: any = {};

  // 请求地址
  url: string = '/worker/list';

  activeTypes: ActiveType[] = [
    { key: null, value: null, label: '全部' },
    { key: 1, value: 1, label: '正常' },
    { key: 2, value: 2, label: '冻结' },
  ]

  mounted() {
    this.filterList[0].options = this.activeTypes;
  }

  operat: Opreat[] = [
    {
      key: 'edit',
      rowKey: 'userName',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'freeze',
      rowKey: 'userName',
      color: 'red',
      text: '冻结',
      roles: true,
      disabled: (row: any) => (row.userName === 'admin' || row.activeStatus !== 1),
    },
    {
      key: 'unfreeze',
      rowKey: 'userName',
      color: 'green',
      text: '解冻',
      roles: true,
      disabled: (row: any) => (row.userName === 'admin' || row.activeStatus === 1),
    },
  ];

  // 表格参数
  tableList: tableList[] = [
    { label: '专员姓名', prop: 'realName' },
    { label: '登录账号', prop: 'userName' },
    { label: '专员描述', prop: 'remark' },
    { label: '添加人', prop: 'crtUserName' },
    {
      label: '添加时间',
      prop: 'crtTime',
      sortable: true,
      sortBy: ['crtTime'],
    },
    {
      label: '最后登录',
      prop: 'lastLoginTime',
      sortable: true,
      sortBy: ['lastLoginTime'],
    },
    { label: '状态', prop: 'activeStatus', formatter: this.statusDom },
  ];

  statusDom(row: any) {
    const type = row.activeStatus === 1 ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.activeStatus === 1 ? '正常' : '冻结'}</el-tag>;
  }

  created() {
    const getNowRoles: string[] = [
      // 操作
      '/worker/add', // 新增
      '/worker/edit', // 编辑
      '/worker/lock', // 冻结
      '/worker/unlock', // 解冻
      '/worker/exportExcel', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.showAddBtn = !!(res[0]); // 新增
      this.operat[0].roles = !!(res[1]); // 编辑
      this.operat[1].roles = !!(res[2]); // 冻结
      this.operat[2].roles = !!(res[3]); // 解冻
      this.showExportBtn = !!(res[4]); // 导出
    });
  }

  // 新增、编辑
  modelVisible: boolean = false;

  modelTitle: string = '';

  itemData: any = {}; // 单条数据

  // 导出按钮展示
  showExportBtn: boolean = true;

  // 新增按钮展示
  showAddBtn: boolean = true;

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      // 编辑
      workerDetail({ userAppId: row.userAppId }).then((res) => {
        if (res.result.resultCode === '0') {
          this.modelVisible = true;
          this.modelTitle = '编辑专员';
          this.itemData = res.entity;
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'freeze') {
      // 冻结
      workerLock({ userId: row.userId }).then((res) => {
        if (res.result.resultCode === '0') {
          this.$message.success(res.result.resultMessage);
          FromTable.reloadTable();
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'unfreeze') {
      // 解冻
      workerUnlock({ userId: row.userId }).then((res) => {
        if (res.result.resultCode === '0') {
          this.$message.success(res.result.resultMessage);
          FromTable.reloadTable();
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    }
  }

  addModel() {
    this.modelVisible = true;
    this.modelTitle = '新增专员';
  }

  // 关闭弹窗
  closeModal(): void {
    this.modelVisible = false;
    this.itemData = {};
  }

  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
    this.itemData = {};
  }

  downLoad(data: any) {
    // const data1 = qs.stringify(data);
    // exportExcel(data1, `安装专员${utils.returnNowTime()}`, '/sys/user/exportExcel');
  }

  render(h: any) {
    return (
      <div class="member-wrap">
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          on-addBack={this.addModel}
          add-btn={this.showAddBtn}
          export-btn={this.showExportBtn}
          opreatWidth={'150px'}
          operat={this.operat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          localName={'installers'}
          on-downBack={this.downLoad}
          on-menuClick={this.menuClick}
        />
        <add-modal
          ref="addTable"
          data={this.itemData}
          title={this.modelTitle}
          visible={this.modelVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
      </div>
    );
  }
}
