import { Component, Vue, Emit } from 'vue-property-decorator';
import { Tag, Loading, Button } from 'element-ui';
import { FilterFormList, tableList, Opreat } from '@/interface';
import { getCustomerList } from '@/api/customer';
import { terminalUnbind } from '@/api/equipment';
import AddModal from '@/views/equipment/device/components/AddModal';
import BindModal from '@/views/equipment/device/components/BindModal';
import AcceptModal from '@/views/equipment/device/components/AcceptModal';
import UpdateModal from '@/views/equipment/device/components/UpdateModal';
import './index.less';

interface TerminalType { key: number, value: string, label: string, color: string }

@Component({
  components: {
  'el-tag': Tag,
  'el-button': Button,
  'add-modal': AddModal,
  'bind-modal': BindModal,
  'accept-modal': AcceptModal,
  'update-modal': UpdateModal,
  }
  })
export default class Device extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'active',
      type: 'select',
      label: '所属商户',
      placeholder: '请选择所属商户',
      options: [],
    },
    {
      key: 'active',
      type: 'select',
      label: '设备类型',
      placeholder: '请选择设备类型',
      options: [],
    },
    {
      key: 'active',
      type: 'select',
      label: '配置更新',
      placeholder: '请选择配置状态',
      options: [],
    },
  ];
  // 高级筛选
  filterGrade: FilterFormList[] = [
    {
      key: 'orgId',
      type: 'select',
      label: '所属商户',
      placeholder: '请选择所属商户',
      options: [],
    },
    {
      key: 'terminalType',
      type: 'select',
      label: '设备类型',
      placeholder: '请选择设备类型',
      options: [],
    },
    {
      key: 'active',
      type: 'select',
      label: '配置更新',
      placeholder: '请选择配置状态',
      options: [],
    },
    {
      key: 'active',
      type: 'select',
      label: '设备状态',
      placeholder: '请选择设备状态',
      options: [],
    },
    {
      key: 'active',
      type: 'select',
      label: '网络状态',
      placeholder: '请选择网络状态',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '模糊查询',
      placeholder: '请输入imei号或车牌号',
    },
  ];
  // 筛选参数
  filterParams: any = {
    roleId: '',
    active: '',
    keyword: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/device/terminal/list';

  opreat: Opreat[] = [
    {
      key: 'bind',
      rowKey: 'imei',
      color: (row: any) => (row.status === 1 ? 'green' : 'red'),
      text: (row: any) => (row.status === 1 ? '绑定' : '解绑'),
      msg: (row: any) => (row.status === 1 ? '是否要绑定？' : '是否要解绑？'),
      disabled: (row: any) => (row.status === 5),
      roles: true,
    },
    {
      key: 'accept',
      rowKey: 'imei',
      color: 'blue',
      text: '验收',
      disabled: (row: any) => (row.status === 1 || row.status === 4 || row.status === 5),
      roles: true,
    },
    {
      key: 'update',
      rowKey: 'imei',
      color: 'green',
      text: '更新',
      disabled: (row: any) => !((row.cfgVer !== row.upCfgVer) && (row.online)),
      roles: true,
    },
    {
      key: 'authCode',
      rowKey: 'imei',
      color: 'blue',
      text: '鉴权码',
      disabled: (row: any) => (!row.online),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName' },
    { label: '设备类型', prop: 'terminalTypeName' },
    { label: 'imei号', prop: 'imei' },
    { label: '配置版本', prop: 'cfgVer' },
    { label: '硬件版本', prop: 'hardVer' },
    { label: '主机版本', prop: 'hostVer' },
    { label: '当前车辆', prop: 'plateNum' },
    { label: '安绑记录', prop: 'plateNum', formatter: this.bindLog },
    { label: '设备到期', prop: 'serviceEndTime' },
    { label: '配置更新', prop: 'upCfgVer', formatter: this.cfgConfirm },
    { label: '设备状态', prop: 'status', formatter: this.terSelect },
    { label: '网络状态', prop: 'online', formatter: this.onlineSelect },
  ];

  bindLog(row: any) {
    return <a class="check-link" on-click={() => this.checklog(row)}>查看</a>;
  }

  checklog(row: any) {
    this.$router.push({ name: '安绑记录', query: { imei: row.imei }, params: { orgName: row.orgName, plateNum: row.plateNum, vin: row.vin } });
  }

  cfgConfirm(row: any) {
    const type = row.cfgVer === row.upCfgVer ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.active ? '已最新' : '可更新'}</el-tag>;
  }

  onlineSelect(row: any) {
    const type = row.online ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.online ? '在线' : '离线'}</el-tag>;
  }
  terSelect(row: any) {
    const arr = this.terConfirm(row.status);
    return arr.map(item => <el-tag size="medium" type={item.color} style="marginRight:5px">{item.label}</el-tag>);
  }

  terConfirm(data: any) {
    const arr: TerminalType[] = [];
    this.terminalStatus.forEach((item) => {
      if (item.key === data) {
        arr.push(item);
      }
    });
    return arr;
  }

  // 1-待安绑，2-待验收，3-未合格，4-已合格,5-已返厂 ,
  terminalStatus: TerminalType[] = [
    {
      key: 1, value: '1', label: '待安绑', color: '',
    },
    {
      key: 2, value: '2', label: '待验收', color: 'info',
    },
    {
      key: 3, value: '3', label: '未合格', color: 'warning',
    },
    {
      key: 4, value: '4', label: '已合格', color: 'success',
    },
    {
      key: 5, value: '5', label: '已返厂', color: 'danger',
    },
  ]

  // 新增
  addVisible: boolean = false;
  addTitle: string = '';

  // 绑定
  bindVisible: boolean = false;
  bindTitle: string = '';

  // 验收
  acceptVisible: boolean = false;
  acceptTitle: string = '';

  // 更新
  updateVisible: boolean = false;
  updateTitle: string = '';

  modelForm: any = {
    imei: '',
  };
  updateData: any = {}
  acceptData: any = {}

  // 操作
  menuClick(key: string, row: any) {
    const formTable: any = this.$refs.table;
    // 绑定、解绑
    if (key === 'bind') {
      if (row.status === 1) {
        this.modelForm = row;
        this.bindVisible = true;
        this.bindTitle = '绑定车辆';
      } else {
        terminalUnbind({ imei: row.imei }).then((res) => {
          if (res.result.resultCode) {
            formTable.reloadTable();
            this.$message.success(res.result.resultMessage);
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      }
    } else if (key === 'accept') {
      this.acceptData = row;
      this.acceptTitle = '安装验收';
      this.acceptVisible = true;
    } else if (key === 'update') {
      this.updateData = row;
      this.updateTitle = '配置更新';
      this.updateVisible = true;
    } else if (key === 'authCode') {
      console.log('鉴权码');
    }
  }

  addModel() {
    this.addVisible = true;
    this.modelForm = null;
    this.addTitle = '添加设备';
  }
  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    this.bindVisible = false;
    this.acceptVisible = false;
    this.updateVisible = false;
  }
  // 关闭弹窗时刷新
  refresh(): void {
    this.addVisible = false;
    this.bindVisible = false;
    this.acceptVisible = false;
    this.updateVisible = false;
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
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
          opreatWidth={'180px'}
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
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></add-modal>
        <bind-modal
          data={this.modelForm}
          title={this.bindTitle}
          visible={this.bindVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></bind-modal>
        <accept-modal
          data={this.acceptData}
          title={this.acceptTitle}
          visible={this.acceptVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></accept-modal>
        <update-modal
          data={this.updateData}
          title={this.updateTitle}
          visible={this.updateVisible}
          on-refresh={this.refresh}
          on-close={this.closeModal}
        ></update-modal>
      </div>
    );
  }
}
