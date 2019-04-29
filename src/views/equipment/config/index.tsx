import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag, Button, Tooltip } from 'element-ui';
import exportExcel from '@/api/export';
import {
  deviceModel, queryCfg, getBtName, getBluetooth, SendClientTypeaAndVersion,
} from '@/api/equipment';
import { getInfoByLevelCode } from '@/api/customer';
import DownConfigModel from './components/DownConfigModel';
import ClearConfigModel from './components/ClearConfigModel';
import BtAuthModel from './components/BtAuthModel';
import BtNameModel from './components/BtNameModel';
import CheckConfigModel from './components/CheckConfigModel';
import CheckLogModel from './components/CheckLogModel';
import SearchConfigModel from './components/SearchConfigModel';
import utils from '@/utils';

interface OnlineType { key: any, value: any, label: string }

@Component({
  components: {
    'el-tag': Tag,
    'el-button': Button,
    'el-tooltip': Tooltip,
    'downconfig-model': DownConfigModel,
    'clearconfig-model': ClearConfigModel,
    'btauth-model': BtAuthModel,
    'btname-model': BtNameModel,
    'checkconfig-model': CheckConfigModel,
    'checkOpeLog-model': CheckLogModel,
    'searchconfig-model': SearchConfigModel,
  },
  name: 'ConfigModel',
})


export default class ConfigModel extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'levelCODE',
      type: 'cascader',
      label: '商户门店',
      filterable: true,
      props: {},
      placeholder: '商户门店（全部）',
      options: [],
      change: this.levelChange,
    },
    {
      key: 'online',
      type: 'select',
      label: '网络状态',
      placeholder: '请选择网络状态',
      options: [],
    },
    {
      key: 'terminalModel',
      type: 'select',
      label: '设备型号',
      placeholder: '请选择设备型号',
      options: [],
    },
  ];

  // 高级筛选
  filterGrade: FilterFormList[] = [
    {
      key: 'levelCODE',
      type: 'cascader',
      label: '商户门店',
      filterable: true,
      props: {},
      placeholder: '商户门店（全部）',
      options: [],
      change: this.levelChange,
    },
    {
      key: 'online',
      type: 'select',
      label: '网络状态',
      placeholder: '请选择网络状态',
      options: [],
    },
    {
      key: 'terminalModel',
      type: 'select',
      label: '设备型号',
      placeholder: '请选择设备型号',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '输入搜索',
      placeholder: 'imei号、主机编码、车牌号、配置名称、产品编码',
    },
  ];

  levelChange(val: any) {
    this.outParams = {
      levelCode: '',
      srLevelcode: '',
    };
    if (val.length === 0) {
      this.outParams.levelCode = '';
      this.outParams.srLevelcode = '';
    } else if (val.length === 1) {
      this.outParams.levelCode = val[val.length - 1];
      this.outParams.srLevelcode = '';
    } else if (val.length === 2) {
      this.outParams.levelCode = val[val.length - 2];
      this.outParams.srLevelcode = val[val.length - 1];
    }
  }

  // 筛选参数
  filterParams: any = {
    terminalModel: '',
    online: null,
    levelCODE: [''],
  };

  outParams: any = {
    levelCode: '', // 新监控levelcode
    srLevelCode: '', // 4s门户levelcode
  };

  // 请求地址
  url: string = '/device/terminal/configurationList';

  opreat: Opreat[] = [
    {
      key: 'downConfig',
      rowKey: 'id',
      color: 'blue',
      text: '下发配置',
      roles: true,
      disabled: this.statusSet,
    },
    {
      key: 'clearConfig',
      rowKey: 'id',
      color: 'blue',
      text: '清除配置',
      roles: true,
      disabled: this.statusSet,
    },
    {
      key: 'checkConfig',
      rowKey: 'id',
      color: 'blue',
      text: '查询配置',
      roles: true,
      disabled: this.statusSet,
    },
    {
      key: 'btAuth',
      rowKey: 'id',
      color: 'blue',
      text: '蓝牙鉴权',
      roles: true,
    },
    {
      key: 'btName',
      rowKey: 'id',
      color: 'blue',
      text: '蓝牙名称',
      roles: true,
    },
  ];

  // 只有在设备在线与软件版本以ovt开头的情况下，才可点击下发配置、清除配置、查询配置
  statusSet(row: any) {
    if (this.ableConfig.length > 1) {
      this.ableConfig.forEach(
        (item: any) => !(
          row.online === 1 && row.productName && row.productName.substr(0, 3) === item
        ),
      );
    }
    return true;
  }

  // // 表格参数
  tableList: tableList[] = [
    { label: '商户门店', prop: 'orgName' },
    { label: 'imei号', prop: 'imei' },
    { label: '主机编码', prop: 'barCode' },
    { label: '设备型号', prop: 'terminalModel' },
    { label: '软件版本', prop: 'softVersion' },
    { label: '配置名称', prop: 'cfgName' },
    { label: '产品编码', prop: 'productCode' },
    { label: '当前车辆', prop: 'platenum' },
    { label: '操作记录', prop: 'orgNam111e', formatter: this.opeList },
    { label: '网络状态', prop: 'onlineCN', formatter: this.onlineStatus },
  ];

  onlineStatus(row: any) {
    let str = null;
    let num = 0;
    if (row.onlineCN && row.onlineCN.indexOf('在线') > -1) {
      num = 1;
    } else if (row.onlineCN && row.onlineCN.indexOf('离线') > -1) {
      num = 2;
    } else if (row.onlineCN && row.onlineCN.indexOf('未知') > -1) {
      num = 3;
    } else {
      num = 3;
    }
    switch (num) {
      case 1:
        str = <el-tooltip class="item" effect="dark" content={row.onlineCN} placement="top">
          <span style={{ color: '#67C23A' }}>{row.onlineCN}</span>;
        </el-tooltip>;
        break;
      case 2:
        str = <el-tooltip class="item" effect="dark" content={row.onlineCN} placement="top">
          <span style={{ color: '#F56C6C' }}>{row.onlineCN}</span>;
      </el-tooltip>;
        break;
      case 3:
        str = <el-tooltip class="item" effect="dark" content={'未知'} placement="top">
          <span style={{ color: '#909399' }}>未知</span>;
      </el-tooltip>;
        break;
      default:
        break;
    }
    return str;
  }

  // 查看操作记录
  opeList(row: any) {
    return <el-button type="text" disabled={!this.showOprateBtn} on-click={() => this.checkLoc(row)}>查看</el-button>;
  }

  // 查看上线地址 按钮
  checkLoc(data: any) {
    this.clickTime = utils.getNowTime();
    this.checkLogTitle = `操作记录（${data.imei}）`;
    this.checkLogData = data;
    this.checkLogVisible = true;
  }

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      '/device/terminal/deliveryCfg', // 下发配置
      '/device/terminal/clearCfg', // 清除配置
      '/device/terminal/queryCfg/{imei}', // 查询配置
      '/device/terminal/createBluetoothAuthCode', // 蓝牙鉴权
      '/device/terminal/settingBluetoothName', // 蓝牙名称
      '/device/terminal/opsList', // 操作记录查看
      '/device/terminal/configurationExport', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.opreat[0].roles = !!(res[0]); // 下发配置
      this.opreat[1].roles = !!(res[1]); // 清除配置
      this.opreat[2].roles = !!(res[2]); // 查询配置
      this.opreat[3].roles = !!(res[3]); // 蓝牙鉴权
      this.opreat[4].roles = !!(res[4]); // 蓝牙名称
      this.showOprateBtn = !!(res[5]); // 操作记录查看
      this.showExportBtn = !!(res[6]); // 导出
    });
  }

  // 操作记录查看
  showOprateBtn: boolean = true;

  // 导出按钮展示
  showExportBtn: boolean = true;

  mounted() {
    // 设备型号
    deviceModel('WIRELESS').then((res) => {
      const otuList: any = [];
      res.entity.forEach((item: any, index: number) => {
        item.terminalModelList.forEach((it: any, ind: number) => {
          otuList.push({
            value: it.id,
            label: it.name,
          });
        });
      });
      otuList.unshift({
        value: '',
        label: '设备型号(全部)',
      });
      this.filterList[2].options = otuList;
      this.filterGrade[2].options = otuList;
    });
    // 网络状态
    this.filterList[1].options = this.onlineTypes;
    this.filterGrade[1].options = this.onlineTypes;
    // 获取商户-4s
    getInfoByLevelCode(null).then((res: any) => {
      const { entity, result } = res;
      if (result.resultCode === '0') {
        entity.forEach((item: any) => {
          item.label = item.orgName;
          item.value = item.levelCode;
          if (item.siruiOrgs.length > 0) {
            item.siruiOrgs.forEach((it: any) => {
              it.label = it.name;
              it.value = it.levelCode;
            });
          } else {
            delete item.siruiOrgs;
          }
        });
        entity.unshift({
          label: '商户门店（全部）',
          value: '',
        });
        this.filterList[0].options = entity;
        this.filterList[0].props = {
          value: 'value',
          children: 'siruiOrgs',
        };
        this.filterGrade[0].options = entity;
        this.filterGrade[0].props = {
          value: 'value',
          children: 'siruiOrgs',
        };
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    SendClientTypeaAndVersion(null).then((res: any) => {
      const { entity, result } = res;
      if (result.resultCode === '0') {
        entity.forEach((item: any) => {
          this.ableConfig.push(item.versionName);
        });
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 能够下发，清除，查询配置的
  ableConfig: any = [];

  onlineTypes: OnlineType[] = [
    { key: null, value: null, label: '网络状态(全部)' },
    { key: 1, value: 1, label: '在线' },
    { key: 0, value: 0, label: '离线' },
  ]

  downLoadTime: string = '';

  rowData: any = {};

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'downConfig') { // 下发配置
      this.downLoadTime = utils.getNowTime();
      this.downconfigVisibale = true;
      this.downconfigData = row;
      this.checkconfigData = row;
    } else if (key === 'clearConfig') { // 清除配置
      this.clearconfigVisible = true;
      this.clearconfigData = row;
    } else if (key === 'checkConfig') { // 查询配置
      this.searchconfigData = [];
      queryCfg(row.imei).then((res: any) => {
        if (res.result.resultCode === '0') {
          this.searchconfigVisible = true;
          this.searchconfigData = JSON.parse(JSON.stringify(res.entity));
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'btAuth') { // 蓝牙鉴权
      this.btAuthVisible = true;
      this.getAuthCode(row);
    } else if (key === 'btName') { // 蓝牙名称
      this.btNameVisible = true;
      this.btNameData = row;
    }
  }

  // 查询蓝牙鉴权码
  getAuthCode(data: any) {
    const obj: any = {
      cfgName: 'bluetoothAuthCode',
      id: data.id,
      imei: data.imei,
    };
    this.btAuthData = {};
    getBluetooth(obj).then((res) => {
      this.clickAuthTime = utils.getNowTime();
      if (res.result.resultCode === '0') {
        this.btAuthData = {
          id: data.id,
          imei: data.imei,
          cfgVal: res.entity.length > 0 ? res.entity[0].cfgVal : '暂无蓝牙鉴权码',
        };
      } else {
        this.btAuthData = {
          id: data.id,
          imei: data.imei,
        };
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 下发配置
  downconfigVisibale: boolean = false;

  downconfigData: any = {};

  // 清除配置
  clearconfigVisible: boolean = false;

  clearconfigData: any = {};

  // 蓝牙鉴权
  btAuthVisible: boolean = false;

  btAuthData: any = {};

  // 蓝牙名称
  btNameVisible: boolean = false;

  btNameData: any = {};

  // 配置参数校验
  checkconfigVisible: boolean = false;

  checkconfigData: any = {}

  // 查询配置
  searchconfigVisible: boolean = false;

  searchconfigData: any = {};

  // 操作记录
  checkLogTitle: string = '';

  checkLogData: any = {};

  checkLogVisible: boolean = false;

  // 点击时间
  clickTime: string = '';

  clickAuthTime: string = '';


  // 关闭弹窗
  closeModal(): void {
    this.downconfigVisibale = false; // 下发配置
    this.clearconfigVisible = false; // 清除配置
    this.btAuthVisible = false; // 蓝牙鉴权
    this.btNameVisible = false; // 蓝牙名称
    this.searchconfigVisible = false; // 查询配置
    this.checkLogVisible = false; // 查询操作记录
    this.checkconfigVisible = false; // 参数校验
  }

  // 打开配置参数校验
  openCheckModel() {
    this.checkconfigVisible = true;
  }

  // 打开查询配置
  openSearchModel() {
    this.searchconfigVisible = true;
    clearInterval(this.timer);
  }

  // 关闭配置参数校验
  closeCheckModel() {
    this.checkconfigVisible = false;
    clearInterval(this.timer);
  }

  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
  }

  // 倒计数量
  countDownNum: number = 3;

  // 倒计时时间
  timer: any = null;

  startCountDown() {
    this.timer = setInterval(() => {
      this.countDownNum -= 1;
      if (this.countDownNum === 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, `设备配置${utils.returnNowTime()}`, '/device/terminal/configurationExport');
  }

  clear() {
    this.outParams = {
      levelCode: '', // 新监控levelcode
      srLevelCode: '', // 4s门户levelcode
    };
  }

  render(h: any) {
    return (
      <div class="fzk-config-wrap">
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          add-btn={false}
          opreatWidth={'180px'}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          export-btn={this.showExportBtn}
          on-downBack={this.downLoad}
          on-menuClick={this.menuClick}
          on-clearOutParams={this.clear}
        />
        <downconfig-model
          downLoadTime={this.downLoadTime}
          data={this.downconfigData}
          visible={this.downconfigVisibale}
          checkVisible={this.checkconfigVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <clearconfig-model
          data={this.clearconfigData}
          visible={this.clearconfigVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <btauth-model
          time={this.clickAuthTime}
          data={this.btAuthData}
          visible={this.btAuthVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <btname-model
          data={this.btNameData}
          visible={this.btNameVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <checkconfig-model
          num={this.countDownNum}
          data={this.checkconfigData}
          visible={this.checkconfigVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <searchconfig-model
          data={this.searchconfigData}
          visible={this.searchconfigVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <checkOpeLog-model
          time={this.clickTime}
          title={this.checkLogTitle}
          data={this.checkLogData}
          visible={this.checkLogVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
      </div>
    );
  }
}
