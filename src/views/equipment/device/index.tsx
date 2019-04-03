import { Component, Vue } from 'vue-property-decorator';
import {
  Tag, Button, Popover, Tooltip,
} from 'element-ui';
import qs from 'qs';
import { FilterFormList, tableList, Opreat } from '@/interface';
import {
  resetTime, deviceModel, getOnlineUrl,
} from '@/api/equipment';
import { getInfoByLevelCode } from '@/api/customer';
import exportExcel from '@/api/export';
import utils from '@/utils';
import PopconfirmBlock from '@/components/Popconfirm/index';
import BindModel from './components/BindModel';
import AcceptModel from './components/AcceptModel';
import UnbindModel from './components/UnbindModel';
import UploadModel from './components/UploadModel';
import ChangelocModel from './components/ChangelocModel';
import BThresholdModel from './components/BThresholdModel';
import AThresholdModel from './components/AThresholdModel';
import CheckLogModel from './components/CheckLogModel';
import './index.less';

interface TerminalType { key: number, value: number, label: string, color: string }

@Component({
  components: {
    'el-tag': Tag,
    'el-button': Button,
    'el-popover': Popover,
    'el-tooltip': Tooltip,
    'bind-model': BindModel,
    'accept-model': AcceptModel,
    'upload-model': UploadModel,
    'unbind-model': UnbindModel,
    'changeloc-model': ChangelocModel,
    'bThreshold-model': BThresholdModel,
    'aThreshold-model': AThresholdModel,
    'checkLog-model': CheckLogModel,
    'popconfirm-block': PopconfirmBlock,
  },
  name: 'Device',
})
export default class Device extends Vue {
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
      key: 'terid',
      type: 'cascader',
      label: '设备型号',
      filterable: true,
      props: {},
      change: this.typeChange,
      placeholder: '设备型号（全部）',
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
      key: 'terid',
      type: 'cascader',
      label: '设备型号',
      filterable: true,
      props: {},
      change: this.typeChange,
      placeholder: '设备型号（全部）',
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
      placeholder: 'imei号、主机编码、ICCID、车牌号',
    },
  ];

  typeChange(val: any) {
    this.outParams = {
      terminalModelId: '',
      terminalType: '',
    };
    if (val.length === 0) {
      this.outParams.terminalType = '';
      this.outParams.terminalModelId = '';
    } else if (val.length === 1) {
      this.outParams.terminalType = val[val.length - 1];
      this.outParams.terminalModelId = '';
    } else if (val.length === 2) {
      this.outParams.terminalType = val[val.length - 2];
      this.outParams.terminalModelId = val[val.length - 1];
    }
  }

  levelChange(val: any) {
    this.outParams = {
      levelCode: '',
      srLevelCode: '',
    };
    if (val.length === 0) {
      this.outParams.levelCode = '';
      this.outParams.srLevelCode = '';
    } else if (val.length === 1) {
      this.outParams.levelCode = val[val.length - 1];
      this.outParams.srLevelCode = '';
    } else if (val.length === 2) {
      this.outParams.levelCode = val[val.length - 2];
      this.outParams.srLevelCode = val[val.length - 1];
    }
  }

  // 筛选参数
  filterParams: any = {
    terid: [''],
    levelCODE: [''],
    status: 0,
    online: -1,
  };

  outParams: any = {
    terminalModelId: '', // 具体设备型号id值 ,
    terminalType: '', // 设备类型:3-OTU,22-KeLong,23-BSJ,16-BT
    levelCode: '', // 监控商户的门店
    srLevelCode: '', // 4s的门店
  };

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
      key: 'changeLoc',
      rowKey: 'imei',
      color: 'blue',
      text: '切换地址',
      roles: true,
      disabled: this.changeLocDisable,
    },
    {
      key: 'setThreshold',
      rowKey: 'imei',
      color: 'blue',
      text: '阈值',
      roles: true,
      disabled: this.unBindDisable,
    },
    {
      key: 'logs',
      rowKey: 'imei',
      color: 'blue',
      text: '日志',
      roles: true,
    },
  ];

  // 验收状态：待验收2 未合格4
  acceptDisable(row: any) {
    if (row.status === 1 || row.status === 3 || row.status === 5) {
      return true;
    }
    return false;
  }

  // 绑定状态：待安绑1
  bindDisable(row: any) {
    if (row.status === 1) {
      return false;
    }
    return true;
  }

  // 解绑状态\阈值状态：待验收2 未合格4 已合格3
  unBindDisable(row: any) {
    if (row.status === 2 || row.status === 3 || row.status === 4) {
      return false;
    }
    return true;
  }

  // 切换地址状态：已合格3 且门店支持切换switchAddress 设备在线online
  changeLocDisable(row: any) {
    if (row.status === 3 && row.switchAddress && row.online) {
      return false;
    }
    return true;
  }

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
    // this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
    //   this.opreat[0].roles = !!(res[1]); // 绑定
    //   this.opreat[1].roles = !!(res[2]); // 解绑
    //   this.opreat[2].roles = !!(res[3]); // 验收
    //   this.opreat[3].roles = !!(res[4]); // 鉴权码
    //   this.authBtn = !!(res[5]);
    //   this.opreat[4].roles = !!(res[6]);
    //   this.opreat[5].roles = !!(res[7]);
    //   this.addBtn = !!(res[0]);
    //   this.resetBtn = !!(res[8]);
    //   this.opsBtn = !!(res[9]);
    //   this.exportBtn = !!(res[10]);
    // });
    // });
    // 设备状态
    this.filterGrade[2].options = this.terminalStatus;
    // 网络状态
    this.filterGrade[3].options = this.onlineStatus;
  }

  mounted() {
    // 获取所有设备类型、型号
    deviceModel('ALL').then((res) => {
      const { entity, result } = res;
      if (result.resultCode === '0') {
        const list: any = [];
        entity.forEach((item: any, index: number) => {
          if (item.terminalModelList.length > 0) {
            item.terminalModelList.forEach((it: any, ind: number) => {
              it.label = it.name;
              it.value = it.id;
            });
            list.push({
              value: parseInt(item.dictionary.enumValue, 10),
              label: item.dictionary.name,
              children: item.terminalModelList,
            });
          } else {
            list.push({
              value: parseInt(item.dictionary.enumValue, 10),
              label: item.dictionary.name,
            });
          }
        });
        list.unshift({
          label: '设备型号（全部）',
          value: '',
        });
        this.filterList[1].options = list;
        this.filterList[1].props = {
          value: 'value',
          children: 'children',
        };
        this.filterGrade[1].options = list;
        this.filterGrade[1].props = {
          value: 'value',
          children: 'children',
        };
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
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

  // 表格参数
  tableList: tableList[] = [
    { label: '商户门店', prop: 'merchantStores' },
    { label: 'imei号', prop: 'imei' },
    { label: '主机编码', prop: 'barCode' },
    { label: '2a1', prop: 'drivingCfgPower' },
    { label: 'ICCID', prop: 'iccId' },
    { label: '设备型号', prop: 'terminalModel' },
    { label: '网络类型', prop: 'wireless', formatter: this.wireCheck },
    { label: '当前车辆', prop: 'plateNum' },
    { label: '安绑记录', prop: 'plateNum1', formatter: this.bindLog },
    { label: '设备状态', prop: 'status', formatter: this.terSelect },
    { label: '上线地址', prop: 'imei', formatter: this.upLoc },
    { label: '网络状态', prop: 'online', formatter: this.onlineSelect },
  ];

  // 是否无线设备
  wireCheck(row: any) {
    return row.wireless === 0 ? <el-tag>有线</el-tag> : <el-tag type="success">无线</el-tag>;
  }

  // 查看上线地址
  upLoc(row: any) {
    return <el-button type="text" disabled={!row.switchAddress} on-click={() => this.checkLoc(row)}>查看地址</el-button>;
  }

  // 点击操作时的时间
  clickTime: string = '';

  changeClickTime: string = '';

  aclickTime: string = '';

  bclickTime: string = '';

  // 查看上线地址
  checkLoc(data: any) {
    getOnlineUrl(data.id).then((res: any) => {
      const { result, entity } = res;
      if (result.resultCode === '0') {
        this.upLocVisible = true;
        this.upLocData = entity;
      } else {
        this.upLocData.masterUrl = '--';
        this.upLocData.slaveUrl = '--';
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 查看安绑记录
  bindLog(row: any) {
    return <el-button type="text" disabled={!this.opsBtn} on-click={() => this.checkLog(row)}>查看记录</el-button>;
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
    this.$router.push({ name: '安绑记录', query: { imei: row.imei, id: row.id }, params:{imei: row.imei, id: row.id} });
  }

  onlineSelect(row: any) {
    return row.online === 1
      ? <span style="color:#67953A">在线</span>
      : <el-tooltip class="item" effect="dark" content={`离线 (${utils.minToAll(row.offlineTime)})`} placement="top">
        <span style="color:#F56C6C">离线 ({utils.minToAll(row.offlineTime)}分钟)</span>
      </el-tooltip>;
  }

  terSelect(row: any) {
    let type;
    // 1-待安绑，2-待验收，3-已合格，4-未合格,5-已返厂 ,
    switch (row.status) {
      case 1:
        type = <el-tag size="medium" type="blue" >待安绑</el-tag>;
        break;
      case 2:
        type = <el-tag size="medium" type="info" >待验收</el-tag>;
        break;
      case 3:
        type = <el-tag size="medium" type="success" >已合格</el-tag>;
        break;
      case 4:
        type = <el-tag size="medium" type="warning" >未合格</el-tag>;
        break;
      case 5:
        type = <el-tag size="medium" type="danger" >已返厂</el-tag>;
        break;
      default:
        type = <el-tag size="medium" type="info" >未知</el-tag>;
    }
    return type;
  }

  // 设备状态 1-待安绑，2-待验收，3-已合格，4-未合格，5-已返厂 ,
  terminalStatus: TerminalType[] = [
    {
      key: 0, value: 0, label: '设备状态（全部）', color: '',
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

  // 网络状态 1-在线，0-离线，
  onlineStatus: any = [
    { key: -1, value: -1, label: '网络状态（全部）' },
    { key: 1, value: 1, label: '在线' },
    { key: 0, value: 0, label: '离线' },
  ]

  // 绑定
  bindVisible: boolean = false;

  bindTitle: string = '';

  // 解绑
  unbindVisible: boolean = false;

  unbindData: any = {};

  // 验收
  acceptVisible: boolean = false;

  acceptTitle: string = '';

  acceptData: any = {};

  // 上线地址upLoc
  upLocVisible: boolean = false;

  upLocData: any = {};

  // 切换地址
  changelocVisible: boolean = false;

  changelocData: any = {};

  // 阀值设置
  // 2a1
  bThresholdData: any = {};

  bThresholdVisible: boolean = false;

  // BSJ或WK
  aThresholdData: any = {};

  aThresholdVisible: boolean = false;

  // 查看日志
  checkLogVisible: boolean = false;

  checkLogData: any = {};

  checkLogTitle: string = '';

  modelForm: any = {
    imei: '',
  };

  // 门店列表
  shopList: any = [];

  loading: boolean = false;

  // 导出
  exportBtn: boolean = true;

  // 重置
  resetBtn: boolean = true;

  // 查看安绑记录
  opsBtn: boolean = true;

  closePop() {
    this.loading = false;
  }

  // 操作
  menuClick(key: string, row: any) {
    switch (key) {
      // 绑定
      case 'bind':
        this.modelForm = row;
        this.bindVisible = true;
        this.bindTitle = '绑定车辆';
        break;
      // 解绑
      case 'unbind':
        this.unbindVisible = true;
        this.unbindData = row;
        break;
      // 验收
      case 'accept':
        this.acceptData = row;
        this.acceptTitle = '安装验收';
        this.acceptVisible = true;
        break;
      // 切换地址
      case 'changeLoc':
        this.changelocVisible = true;
        this.changelocData = row;
        this.changeClickTime = utils.getNowTime();
        break;
      // 阈值
      case 'setThreshold':
        if (row.drivingCfgPower) {
          this.aclickTime = utils.getNowTime();
          // 上报2a1
          this.aThresholdVisible = true;
          this.aThresholdData = row;
        } else {
          this.bclickTime = utils.getNowTime();
          this.bThresholdVisible = true;
          this.bThresholdData = row;
        }
        break;
      // 日志
      case 'logs':
        this.checkLogData = row;
        this.checkLogVisible = true;
        this.checkLogTitle = `设备日志(${row.imei})`;
        this.clickTime = utils.getNowTime();
        break;
      default:
        break;
    }
  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, `设备管理列表${utils.returnNowTime()}`, '/device/terminal/exportExcel');
  }

  // 关闭弹窗
  closeModal(): void {
    this.bindVisible = false; // 绑定
    this.unbindVisible = false; // 解绑
    this.acceptVisible = false; // 验收
    this.upLocVisible = false; // 线上地址
    this.changelocVisible = false; // 切换地址
    this.aThresholdVisible = false; // 阀值bsj wk
    this.bThresholdVisible = false; // 阀值2a1
    this.checkLogVisible = false; // 日志
    this.loading = false;
  }

  clear() {
    this.outParams = {
      terminalModelId: '', // 具体设备型号id值 ,
      terminalType: '', // 设备类型:3-OTU,22-KeLong,23-BSJ,16-BT
      levelCode: '', // 监控商户的门店
      srLevelCode: '', // 4s的门店
    };
  }

  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
  }

  render(h: any) {
    return (
      <div class="fzk-device-wrap">
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          add-btn={false}
          data-type={'JSON'}
          localName={'device'}
          on-downBack={this.downLoad}
          opreat={this.opreat}
          opreatWidth={'150px'}
          out-params={this.outParams}
          on-clearOutParams={this.clear}
          table-list={this.tableList}
          url={this.url}
          export-btn={this.exportBtn}
          on-menuClick={this.menuClick}
        />
        <bind-model
          data={this.modelForm}
          title={this.bindTitle}
          visible={this.bindVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <accept-model
          data={this.acceptData}
          title={this.acceptTitle}
          visible={this.acceptVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <unbind-model
          data={this.unbindData}
          visible={this.unbindVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <upload-model
          data={this.upLocData}
          visible={this.upLocVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <changeloc-model
          changeTime={this.changeClickTime}
          data={this.changelocData}
          visible={this.changelocVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <bThreshold-model
          btime={this.bclickTime}
          data={this.bThresholdData}
          visible={this.bThresholdVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <aThreshold-model
          atime={this.aclickTime}
          data={this.aThresholdData}
          visible={this.aThresholdVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <checkLog-model
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
