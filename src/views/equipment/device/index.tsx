import { Component, Vue } from 'vue-property-decorator';
import { Tag, Button, Popover } from 'element-ui';
import qs from 'qs';

import { FilterFormList, tableList, Opreat } from '@/interface';
import { terminalType, getBluetooth, resetTime, terminalExport } from '@/api/equipment';
import { orgTree } from '@/api/app';

import AddModal from '@/views/equipment/device/components/AddModal';
import BindModal from '@/views/equipment/device/components/BindModal';
import AcceptModal from '@/views/equipment/device/components/AcceptModal';

import PopconfirmBlock from '@/components/Popconfirm/index';

import DownModel from './components/DownModel';
import ClearModel from './components/ClearModel';
import AuthModel from './components/AuthModel';
import UnbindModel from './components/UnbindModel';

import './index.less';

interface TerminalType { key: number, value: number, label: string, color: string }

@Component({
  components: {
  'el-tag': Tag,
  'el-button': Button,
  'add-modal': AddModal,
  'bind-modal': BindModal,
  'accept-modal': AcceptModal,
  'down-model': DownModel,
  'clear-model': ClearModel,
  'auth-model': AuthModel,
  'unbind-model': UnbindModel,
  'el-popover': Popover,
  'popconfirm-block': PopconfirmBlock,
  }
  })
export default class Device extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'levelCode',
      type: 'levelcode',
      label: '所属商户',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
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
      key: 'keyword',
      type: 'input',
      label: '模糊查询',
      placeholder: 'imei、车牌、配置名称、产品编码',
    },
  ];
  // 高级筛选
  filterGrade: FilterFormList[] = [
    {
      key: 'levelCode',
      type: 'levelcode',
      label: '所属商户',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
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
      key: 'status',
      type: 'select',
      label: '设备状态',
      placeholder: '请选择设备状态',
      options: [],
    },
    {
      key: 'online',
      type: 'select',
      label: '网络状态',
      placeholder: '请选择网络状态',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '模糊查询',
      placeholder: 'imei、车牌、配置名称、产品编码',
    },
  ];
  // 筛选参数
  filterParams: any = {
    levelCode: '',
    terminalType: 0,
    status: 0,
    online: -1,
    keyword: '',
    // active: 1,
  };
  outParams: any = {};
  // 请求地址
  url: string = '/device/terminal/list';
  // 设备状态status 1-待安绑，2-待验收，3-已合格，4-未合格，5-已返厂 ,
  // 网络状态online 1-在线，0-离线
  opreat: Opreat[] = [
    {
      key: 'bind',
      rowKey: 'imei',
      color: 'green',
      text: '绑定',
      msg: '是否要绑定？',
      disabled: this.bindDisable,
      roles: true,
    },
    {
      key: 'unbind',
      rowKey: 'imei',
      color: 'red',
      text: '解绑',
      msg: '是否要解绑？',
      roles: true,
      disabled: this.unBindDisable,
    },
    {
      key: 'accept',
      rowKey: 'imei',
      color: 'blue',
      text: '验收',
      disabled: this.acceptDisable,
      roles: true,
    },
    {
      key: 'authCode',
      rowKey: 'imei',
      color: 'blue',
      text: '鉴权码',
      roles: true,
    },
    {
      key: 'downConfig',
      rowKey: 'imei',
      color: 'blue',
      text: '下发配置',
      disabled: (row: any) => (row.online !== 1),
      roles: true,
    },
    {
      key: 'clearConfig',
      rowKey: 'imei',
      color: 'blue',
      text: '清除配置',
      disabled: (row: any) => (row.online !== 1),
      roles: true,
    },
  ];
  acceptDisable(row: any) {
    // 是否在线
    if (row.online === 1) {
      if (row.status === 1 || row.status === 3 || row.status === 5) {
        return true;
      }
      return false;
    }
    return true;
  }

  bindDisable(row: any) {
    // 是否在线
    if (row.online === 1) {
      // 待安绑
      if (row.status === 1) {
        return false;
      }
      return true;
    }
    return true;
  }

  unBindDisable(row: any) {
    if (row.status === 2 || row.status === 3 || row.status === 4) {
      return false;
    }
    return true;
  }
  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName' },
    { label: '设备类型', prop: 'terminalTypeName', formatter: (row: any) => (row.terminalTypeName ? row.terminalTypeName : '--') },
    { label: 'imei号', prop: 'imei' },
    { label: '配置名称', prop: 'cfgName' },
    { label: '产品编码', prop: 'productCode' },
    { label: '当前车辆', prop: 'plateNum' },
    { label: '安绑记录', prop: 'plateNum1', formatter: this.bindLog },
    { label: '设备到期', prop: 'serviceEndDay', formatter: this.endDay },
    { label: '设备状态', prop: 'status', formatter: this.terSelect },
    { label: '网络状态', prop: 'online', formatter: this.onlineSelect },
  ];

  // 设备状态 1-待安绑，2-待验收，3-已合格，4-未合格，5-已返厂 ,
  terminalStatus: TerminalType[] = [
    {
      key: 0, value: 0, label: '全部', color: '',
    },
    {
      key: 1, value: 1, label: '待安绑', color: '',
    },
    {
      key: 2, value: 2, label: '待验收', color: 'info',
    },
    {
      key: 3, value: 3, label: '已合格', color: 'success',
    },
    {
      key: 4, value: 4, label: '未合格', color: 'warning',
    },
    {
      key: 5, value: 5, label: '已返厂', color: 'danger',
    },
  ]
  // 网络状态 1-在线，0-离线 ,
  onlineStatus: any = [
    { key: -1, value: -1, label: '全部' },
    { key: 1, value: 1, label: '在线' },
    { key: 0, value: 0, label: '离线' },
  ]

  // 新增
  addVisible: boolean = false;
  addTitle: string = '';
  updateData: any = {}

  // 绑定
  bindVisible: boolean = false;
  bindTitle: string = '';
  // 解绑
  unbindVisible: boolean = false;
  unbindData: any = {}

  // 鉴权码
  authVisible: boolean = false;
  authData: any = {}

  // 验收
  acceptVisible: boolean = false;
  acceptTitle: string = '';
  acceptData: any = {}

  // 下发配置
  downVisible: boolean = false;
  downTitle: string = '下发配置';
  downData: any = {}

  // 清除配置
  clearVisible: boolean = false;
  clearTitle: string = '';
  clearData: any = {}

  modelForm: any = {
    imei: '',
  };

  // 设备类型
  typeList: any = [];
  // 门店列表
  shopList: any = [];

  loading: boolean = false;

  // 新增、导出、重置、查看安绑记录按钮展示 更新鉴权码
  addBtn: boolean = true;
  exportBtn: boolean = true;
  resetBtn: boolean = true;
  opsBtn: boolean = true;
  authBtn: boolean = true;

  created() {
    const getNowRoles: string[] = [
      // 操作
      '/device/terminal/save',
      '/device/terminal/bind',
      '/device/terminal/unbind/{imei}',
      '/device/terminal/confirm',
      '/device/terminal/getBluetoothAuthCode',
      '/device/terminal/createBluetoothAuthCode',
      '/device/terminal/deliveryCfg',
      '/device/terminal/clearCfg',
      '/device/terminal/reset/{id}',
      '/terminal/ops/list',
      '/device/terminal/exportExcel',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.opreat[0].roles = !!(res[1]); // 绑定
      this.opreat[1].roles = !!(res[2]); // 解绑
      this.opreat[2].roles = !!(res[3]); // 验收
      this.opreat[3].roles = !!(res[4]); // 鉴权码
      this.authBtn = !!(res[5]);
      this.opreat[4].roles = !!(res[6]);
      this.opreat[5].roles = !!(res[7]);
      this.addBtn = !!(res[0]);
      this.resetBtn = !!(res[8]);
      this.opsBtn = !!(res[9]);
      this.exportBtn = !!(res[10]);
    });
    // 门店
    orgTree(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.unshift({
          id: Math.random(),
          levelCode: '',
          orgName: '全部',
        });
        this.filterList[0].options = res.entity;
        this.filterGrade[0].options = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    // 设备类型
    terminalType(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.map((item: any) => this.typeList.push({
          key: Math.random(),
          value: parseInt(item.enumValue, 10),
          label: item.name,
        }));
      } else {
        this.$message.error(res.result.resultMessage);
      }
      // 设备类型(全部)
      this.typeList.unshift({
        key: Math.random(),
        value: 0,
        label: '设备类型(全部)',
      });
      this.filterList[1].options = this.typeList;
      this.filterGrade[1].options = this.typeList;
    });
    // 设备状态
    this.filterGrade[2].options = this.terminalStatus;
    // 网络状态
    this.filterGrade[3].options = this.onlineStatus;
  }

  bindLog(row: any) {
    return <el-button type="text" disabled={!this.opsBtn} on-click={() => this.checkLog(row)}>查看</el-button>;
  }

  endDay(row: any) {
    return <div>
      <span style="marginLeft:-6px">{row.serviceEndDay !== null ? `${row.serviceEndDay}天` : '--'}</span>
      {
        this.resetBtn ?
          <popconfirm-block
            ref={`popBlock${row.id}`}
            title="确定要对此设备进行续期1年？"
            width="225"
            loading={this.loading}
            on-confirm={() => this.onResetTime(row)}
            on-cancel={this.closePop}
          >
            <el-button style="marginLeft:10px" disabled={row.status !== 3} type="text" size="small" >续期</el-button>
          </popconfirm-block> : null
      }
    </div>;
  }
  closePop() {
    this.loading = false;
  }
  onResetTime(data: any) {
    const popModel: any = this.$refs[`popBlock${data.id}`];
    const formTable: any = this.$refs.table;
    this.loading = true;
    resetTime(data.id).then((res) => {
      if (res.result.resultCode === '0') {
        setTimeout(() => {
          this.loading = false;
          popModel.closeModel();
          setTimeout(() => {
            formTable.reloadTable();
            this.$message.success(res.result.resultMessage);
          }, 200);
        }, 1500);
      } else {
        setTimeout(() => {
          this.loading = false;
          this.$message.error(res.result.resultMessage ? res.result.resultMessage : '未知错误');
        }, 1500);
      }
    });
  }

  checkLog(row: any) {
    this.$router.push({ name: '安绑记录', query: { imei: row.imei, id: row.id } });
  }

  onlineSelect(row: any) {
    const type = row.online === 1 ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.online ? '在线' : '离线'}</el-tag>;
  }
  terSelect(row: any) {
    let type;
    // 1-待安绑，2-待验收，3-已合格，4-未合格,5-已返厂 ,
    switch (row.status) {
      case 1:
        type = <el-tag size="medium" type="blue" style="marginRight:5px">待安绑</el-tag>;
        break;
      case 2:
        type = <el-tag size="medium" type="info" style="marginRight:5px">待验收</el-tag>;
        break;
      case 3:
        type = <el-tag size="medium" type="success" style="marginRight:5px">已合格</el-tag>;
        break;
      case 4:
        type = <el-tag size="medium" type="warning" style="marginRight:5px">未合格</el-tag>;
        break;
      case 5:
        type = <el-tag size="medium" type="danger" style="marginRight:5px">已返厂</el-tag>;
        break;
      default:
        type = <el-tag size="medium" type="info" style="marginRight:5px">未知</el-tag>;
    }
    return type;
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


  // 操作
  menuClick(key: string, row: any) {
    const formTable: any = this.$refs.table;
    switch (key) {
      // 绑定、解绑
      case 'bind':
        this.modelForm = row;
        this.bindVisible = true;
        this.bindTitle = '绑定车辆';
        break;
      case 'unbind':
        this.unbindVisible = true;
        this.unbindData = row;
        break;
      case 'accept':
        this.acceptData = row;
        this.acceptTitle = '安装验收';
        this.acceptVisible = true;
        break;
      case 'authCode':
        this.authVisible = true;
        this.getAuthCode(row);
        break;
      case 'downConfig':
        this.downData = row;
        this.downTitle = '下发配置';
        this.downVisible = true;
        break;
      case 'clearConfig':
        this.clearData = row;
        this.clearTitle = '清除配置';
        this.clearVisible = true;
        break;
      default:
        break;
    }
  }

  getAuthCode(data: any) {
    const obj: any = {
      cfgName: 'bluetoothAuthCode',
      id: data.id,
      imei: data.imei,
    };
    getBluetooth(obj).then((res) => {
      if (res.result.resultCode === '0') {
        this.authData = {
          id: data.id,
          imei: data.imei,
          cfgVal: res.entity.length > 0 ? res.entity[0].cfgVal : '暂无蓝牙鉴权码',
        };
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  addModel() {
    this.addVisible = true;
    this.modelForm = null;
    this.addTitle = '添加设备';
  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    terminalExport(data1, '设备管理列表');
  }
  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    this.bindVisible = false;
    this.acceptVisible = false;
    this.downVisible = false;
    this.clearVisible = false;
    this.authVisible = false;
    this.unbindVisible = false;
    const addBlock: any = this.$refs.addTable;
    setTimeout(() => {
      addBlock.resetData();
    }, 200);
    this.loading = false;
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
          add-btn={this.addBtn}
          data-type={'JSON'}
          localName={'device'}
          on-addBack={this.addModel}
          on-downBack={this.downLoad}
          opreat={this.opreat}
          opreatWidth={'150px'}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          export-btn={this.exportBtn}
          on-menuClick={this.menuClick}
        />
        <add-modal
          ref="addTable"
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
        <auth-model
          updateAble={this.authBtn}
          data={this.authData}
          visible={this.authVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></auth-model>
        <unbind-model
          data={this.unbindData}
          visible={this.unbindVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></unbind-model>
        <down-model
          data={this.downData}
          title={this.downTitle}
          visible={this.downVisible}
          on-refresh={this.refresh}
          on-close={this.closeModal}
        ></down-model>
        <clear-model
          data={this.clearData}
          title={this.clearTitle}
          visible={this.clearVisible}
          on-refresh={this.refresh}
          on-close={this.closeModal}
        >
        </clear-model>
      </div>
    );
  }
}
