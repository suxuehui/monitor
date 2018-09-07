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
    activeStatus: 0,
    keyword: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/customer/org/list';
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
      color: (row: any) => (row.activeStatus === 2 ? 'green' : 'red'),
      text: (row: any) => (row.activeStatus === 2 ? '解冻' : '冻结'),
      msg: (row: any) => (row.activeStatus === 2 ? '是否要解冻？' : '是否要冻结？'),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '商户名称', prop: 'orgName', formatter: (row: any) => (row.orgName ? row.orgName : '--') },
    { label: '登录账号', prop: 'manageUser', formatter: (row: any) => (row.manageUser ? row.manageUser : '--') },
    { label: '联系人', prop: 'contactUser', formatter: (row: any) => (row.contactUser ? row.contactUser : '--') },
    { label: '联系电话', prop: 'contactPhone', formatter: (row: any) => (row.contactPhone ? row.contactPhone : '--') },
    { label: '联系地址', prop: 'contactAddress', formatter: (row: any) => (row.contactAddress ? row.contactAddress : '--') },
    {
      label: '车辆数',
      prop: 'carNum',
      sortable: true,
      sortBy: 'carNum',
      formatter: (row: any) => (row.carNum ? `${row.carNum} 辆` : '--'),
    },
    {
      label: '设备数',
      prop: 'terminalNum',
      sortable: true,
      sortBy: 'terminalNum',
      formatter: (row: any) => (row.terminalNum ? `${row.terminalNum} 个` : '--'),
    },
    {
      label: '添加时间',
      prop: 'crtTime',
      sortable: true,
      sortBy: 'crtTime',
      formatter: (row: any) => (row.crtTime ? row.crtTime : '--'),
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

  // 是否激活:1，正常、激活，2,冻结
  statusDom(row: any) {
    const type = row.activeStatus === 2 ? 'danger' : 'success';
    return <el-tag size="medium" type={type}>{row.activeStatus === 2 ? '冻结' : '正常'}</el-tag>;
  }

  activeTypes: ActiveType[] = [
    { key: 0, value: 0, label: '状态(全部)' },
    { key: 1, value: 1, label: '正常' },
    { key: 2, value: 2, label: '冻结' },
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
      this.addTitle = '编辑商户';
    } else if (key === 'freeze') {
      if (row.activeStatus === 2) {
        // 解冻
        customerUnlock(row.id).then((res) => {
          if (res.result.resultCode === '0') {
            FromTable.reloadTable();
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      } else {
        // 冻结
        customerLock(row.id).then((res) => {
          if (res.result.resultCode === '0') {
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
    this.addTitle = '新增商户';
  }
  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    this.freezeVisible = false;
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
          on-addBack={this.addModel}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          export-btn={true}
          fetch-type={'get'}
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
      </div>
    );
  }
}
