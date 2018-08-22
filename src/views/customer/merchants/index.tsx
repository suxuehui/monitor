import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag, Opreat } from '@/interface';
import { Tag, Dialog, Form, FormItem, Select, Input, Button, Row, Col } from 'element-ui';
import { customerLock, customerUnlock } from '@/api/customer';
import AddModal from '@/views/customer/merchants/components/AddModal';


interface ActiveType { key: any, value: any, label: string }

@Component({
  components: {
  'el-tag': Tag,
  'el-dialog': Dialog,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-select': Select,
  'el-input': Input,
  'el-button': Button,
  'el-row': Row,
  'el-col': Col,
  'add-modal': AddModal,
  }
  })
export default class Merchants extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'activeStatus',
      type: 'select',
      label: '状态',
      placeholder: '请选择状态',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '角色名称',
      placeholder: '商户名称或登录账号',
    },
  ];
  // 高级筛选
  filterGrade: FilterFormList[] = [];
  // 筛选参数
  filterParams: any = {
    activeStatus: '',
    keyword: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/sys/org/list';
  // 地址
  opreat: Opreat[] = [
    {
      key: 'edit',
      rowKey: 'manageUser',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'freeze',
      rowKey: 'manageUser',
      color: (row: any) => (row.activeStatus ? 'green' : 'red'),
      text: (row: any) => (row.activeStatus ? '解冻' : '冻结'),
      msg: (row: any) => (row.activeStatus ? '是否要解冻？' : '是否要冻结？'),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '商户名称', prop: 'orgName' },
    { label: '登录账号', prop: 'manageUser' },
    { label: '联系人', prop: 'contactUser' },
    { label: '联系电话', prop: 'contactPhone' },
    { label: '联系地址', prop: 'contactAddress' },
    {
      label: '车辆数',
      prop: 'carNum',
      sortable: true,
      sortBy: 'carNum',
    },
    {
      label: '设备数',
      prop: 'terminalNum',
      sortable: true,
      sortBy: 'terminalNum',
    },
    {
      label: '添加时间',
      prop: 'crtTime',
      sortable: true,
      sortBy: 'crtTime',
    },
    { label: '状态', prop: 'activeStatus', formatter: this.statusDom },
  ];

  // 新增、编辑
  modelVisible: boolean = false;
  modelTitle: string = '';
  modelForm: any = {
    orgName: '',
    contacts: '',
    mgrUsername: '',
    password: '',
    phone: '',
    address: '',
  }
  freezeData: any = {}

  statusDom(row: any) {
    const type = row.activeStatus ? 'danger' : 'success';
    return <el-tag size="medium" type={type}>{row.activeStatus ? '冻结' : '正常'}</el-tag>;
  }

  activeTypes: ActiveType[] = [
    { key: null, value: null, label: '状态(全部)' },
    { key: true, value: true, label: '正常' },
    { key: false, value: false, label: '冻结' },
  ]

  mounted() {
    this.filterList[0].options = this.activeTypes;
  }

  // 新增、编辑
  addVisible: boolean = false;
  addTitle: string = '';
  // 冻结、解冻
  freezeVisible: boolean = false;
  // 权限设置
  setVisible: boolean = false;
  setTitle: string = '';

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      this.modelForm = row;
      this.addVisible = true;
      this.addTitle = '编辑';
    } else if (key === 'freeze') {
      if (row.activeStatus) {
        // 解冻
        customerUnlock(row.id).then((res) => {
          if (res.result.resultCode) {
            FromTable.reloadTable();
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      } else {
        // 冻结
        customerLock(row.id).then((res) => {
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
    this.freezeVisible = false;
    this.setVisible = false;
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
