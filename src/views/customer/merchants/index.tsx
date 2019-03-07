import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import {
  Tag, Dialog, Form, FormItem, Select, Input, Button, Row, Col,
} from 'element-ui';
import { exportExcel } from '@/api/export';
import { customerLock, customerUnlock, customerInfo } from '@/api/customer';
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
  },
  name: 'Merchants',
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
      key: 'activeStatus',
      type: 'select',
      label: '切换地址',
      placeholder: '请选择地址',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '角色名称',
      placeholder: '商户名称、关联门店名称、登录账号',
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

  // 表格参数
  tableList: tableList[] = [
    { label: '商户名称', prop: 'orgName' },
    { label: '关联门店', prop: 'orgName' },
    { label: '同步设备', prop: 'orgName' },
    { label: '登录账号', prop: 'manageUser' },
    { label: '切换地址', prop: 'manageUser' },
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
    },
    { label: '状态', prop: 'activeStatus', formatter: this.statusDom },
  ];

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
      key: 'lock',
      rowKey: 'manageUser',
      color: 'red',
      text: '冻结',
      disabled: (row: any) => (row.activeStatus === 2),
      roles: true,
    },
    {
      key: 'unlock',
      rowKey: 'manageUser',
      color: 'green',
      text: '解冻',
      disabled: (row: any) => (row.activeStatus !== 2),
      roles: true,
    },
  ];

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/customer/org/save',
      '/customer/org/detail/{orgId}',
      '/customer/org/update',
      '/customer/org/lock/{orgId}',
      '/customer/org/unlock/{orgId}',
      '/customer/org/exportExcel',
    ];
    // this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
    //   this.opreat[0].roles = !!(res[1] && res[2]);
    //   this.opreat[1].roles = !!(res[3] && res[4]);
    //   this.addBtn = !!(res[0]);
    //   this.exportBtn = !!(res[5]);
    // });
  }

  // 新增按钮展示
  addBtn: boolean = true;

  // 导出按钮展示
  exportBtn: boolean = true;

  // 新增、编辑
  modelVisible: boolean = false;

  modelTitle: string = '';

  modelForm: any = {
    orgName: '',
    contactUser: '',
    manageUser: '',
    password: '',
    contactPhone: '',
    contactAddress: '',
  }

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

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      // 编辑
      this.modelForm = row;
      this.addVisible = true;
      this.addTitle = '编辑商户';
      customerInfo(row.id).then((res) => {
        if (res.result.resultCode === '0') {
          this.modelForm = res.entity;
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'lock') {
      // 冻结
      customerLock(row.id).then((res) => {
        if (res.result.resultCode === '0') {
          FromTable.reloadTable();
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'unlock') {
      // 解冻
      customerUnlock(row.id).then((res) => {
        if (res.result.resultCode === '0') {
          FromTable.reloadTable();
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
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
    exportExcel(data1, '商户列表', '/customer/org/exportExcel');
  }

  render(h: any) {
    return (
      <div class="member-wrap">
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          add-btn={this.addBtn}
          on-addBack={this.addModel}
          opreat={this.opreat}
          opreatWidth={'150px'}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          localName={'merchants'}
          export-btn={this.exportBtn}
          on-downBack={this.downLoad}
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
