import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag, Button, Tooltip } from 'element-ui';
import exportExcel from '@/api/export';
import {
  deviceModel, queryCfg, getBtName,
} from '@/api/equipment';
import { getInfoByLevelCode, } from '@/api/customer';
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
      label: '其他参数',
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
    terminalModel: 0,
    online: null,
    levelCODE: [''],
  };

  outParams: any = {
    levelCode: '', // 新监控levelcode
    srLevelCode: '', // 4s门户levelcode
  };

  // 请求地址
  // url: string = '/vehicle/config/list';
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
    return !(row.online === 1 && row.softVersion.substr(0, 3) === 'ovt');
  }

  // 表格参数
  tableList: tableList[] = [
    { label: '商户门店', prop: 'cfgName' },
    { label: 'imei号', prop: 'productCode' },
    { label: '主机编码', prop: 'remark' },
    { label: '设备型号', prop: 'reboot' },
    { label: '软件版本', prop: 'reboot' },
    { label: '配置名称', prop: 'reboot' },
    { label: '产品编码', prop: 'reboot' },
    { label: '当前车辆', prop: 'reboot' },
    { label: '操作记录', prop: 'reboot', formatter: this.opeList },
    { label: '网络状态', prop: 'reboot', formatter: this.onlineStatus },
  ];

  // // 表格参数
  // tableList: tableList[] = [
  //   { label: '商户门店', prop: 'orgName' },
  //   { label: 'imei号', prop: 'imei' },
  //   { label: '主机编码', prop: 'barCode' },
  //   { label: '设备型号', prop: 'terminalModel' },
  //   { label: '软件版本', prop: 'softVersion' },
  //   { label: '配置名称', prop: 'cfgName' },
  //   { label: '产品编码', prop: 'productCode' },
  //   { label: '当前车辆', prop: 'platenum' },
  //   { label: '操作记录', prop: 'orgName', formatter: this.opeList },
  //   { label: '网络状态', prop: 'online' },
  // ];

  onlineStatus(row: any) {
    return row.online === 1
      ? <span style="color:#67953A">在线</span>
      : <el-tooltip class="item" effect="dark" content={`离线 (${utils.minToAll(row.offlineTime)})`} placement="top">
        <span style="color:#F56C6C">离线 ({utils.minToAll(row.offlineTime)}分钟)</span>
      </el-tooltip>;
  }

  // 查看操作记录
  opeList(row: any) {
    return <el-button type="text" on-click={() => this.checkLoc(row)}>查看</el-button>;
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
      // 操作
      '/vehicle/config/add',
      '/vehicle/config/info',
      '/vehicle/config/update',
      '/vehicle/config/delete',
      '/vehicle/config/exportExcel',
    ];
    // this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
    //   this.opreat[0].roles = !!(res[1] && res[2]);
    //   this.opreat[1].roles = !!(res[3]);
    //   this.addBtn = !!(res[0]);
    //   this.exportBtn = !!(res[4]);
    // });
  }

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
        value: 0,
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
          item.siruiOrgs.forEach((it: any) => {
            it.label = it.name;
            it.value = it.levelCode;
          });
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
  }

  onlineTypes: OnlineType[] = [
    { key: null, value: null, label: '网络状态(全部)' },
    { key: 1, value: 1, label: '在线' },
    { key: 0, value: 0, label: '离线' },
  ]

  // 导出按钮展示
  exportBtn: boolean = true;

  // 鉴权码
  authBtn: boolean = true;

  rowData: any = {};

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'downConfig') { // 下发配置
      this.downconfigVisibale = true;
      this.downconfigData = row;
      this.checkconfigData = row;
    } else if (key === 'clearConfig') { // 清除配置
      this.clearconfigVisible = true;
      this.clearconfigData = row;
    } else if (key === 'checkConfig') { // 查询配置
      queryCfg(row.imei).then((res: any) => {
        console.log(res);
      });
      // this.searchconfigVisible = true;
      // this.searchconfigData = row;
    } else if (key === 'btAuth') { // 蓝牙鉴权
      this.btAuthVisible = true;
      this.btAuthData = row;
    } else if (key === 'btName') { // 蓝牙名称
      // getBtName(row.imei).then((res: any) => {
      //   console.log(res);
      // });
      this.btNameVisible = true;
      this.btNameData = row;
      this.clickTime = utils.getNowTime();
    }
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


  // 关闭弹窗
  closeModal(): void {
    this.downconfigVisibale = false; // 下发配置
    this.clearconfigVisible = false; // 清除配置
    this.btAuthVisible = false; // 蓝牙鉴权
    this.btNameVisible = false; // 蓝牙名称
    this.searchconfigVisible = false; // 查询配置
    this.checkLogVisible = false; // 查询操作记录
  }

  // 打开配置参数校验
  openCheckModel() {
    this.checkconfigVisible = true;
  }

  // 关闭配置参数校验
  closeCheckModel() {
    this.checkconfigVisible = false;
  }

  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
  }

  countDownNum: number = 3;

  startCountDown() {
    const timer = setInterval(() => {
      this.countDownNum -= 1;
      if (this.countDownNum === 0) {
        clearInterval(timer);
      }
    }, 1000);
  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, '配置列表', '/vehicle/config/exportExcel');
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
          localName={'model'}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          export-btn={this.exportBtn}
          on-downBack={this.downLoad}
          on-menuClick={this.menuClick}
        />
        <downconfig-model
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
          updateAble={this.authBtn}
          data={this.btAuthData}
          visible={this.btAuthVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <btname-model
          time={this.clickTime}
          data={this.btNameData}
          visible={this.btNameVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <checkconfig-model
          num={this.countDownNum}
          data={this.checkconfigData}
          visible={this.checkconfigVisible}
          on-close={this.closeCheckModel}
          on-refresh={this.refresh}
        />
        <searchconfig-model
          data={this.searchconfigData}
          visible={this.searchconfigVisible}
          on-close={this.closeCheckModel}
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
