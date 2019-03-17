import { Component, Vue } from 'vue-property-decorator';
import { Tag, Button, Popover } from 'element-ui';
import qs from 'qs';
import { FilterFormList, tableList, Opreat } from '@/interface';
import {
  terminalType, resetTime, getOnLineAddress,
} from '@/api/equipment';
import exportExcel from '@/api/export';
import utils from '@/utils';
import { orgTree } from '@/api/app';
import PopconfirmBlock from '@/components/Popconfirm/index';
import BindModel from './components/BindModel';
import AcceptModel from './components/AcceptModel';
import UnbindModel from './components/UnbindModel';
import UploadModel from './components/UploadModel';
import ChangelocModel from './components/ChangelocModel';
import AThresholdModel from './components/AThresholdModel';
import BsjThresholdModel from './components/BsjThresholdModel';
import CheckLogModel from './components/CheckLogModel';
import './index.less';

interface TerminalType { key: number, value: number, label: string, color: string }

@Component({
  components: {
    'el-tag': Tag,
    'el-button': Button,
    'el-popover': Popover,
    'bind-model': BindModel,
    'accept-model': AcceptModel,
    'upload-model': UploadModel,
    'unbind-model': UnbindModel,
    'changeloc-model': ChangelocModel,
    'aThreshold-model': AThresholdModel,
    'bsjThreshold-model': BsjThresholdModel,
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
      key: 'levelCode',
      type: 'levelcode',
      label: '商户门店',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
      placeholder: '商户门店（全部）',
      options: [],
    },
    {
      key: 'levelCode',
      type: 'levelcode',
      label: '设备型号',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
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
      key: 'levelCode',
      type: 'levelcode',
      label: '商户门店',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
      placeholder: '请选择商户门店',
      options: [],
    },
    {
      key: 'levelCode',
      type: 'levelcode',
      label: '设备型号',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
      placeholder: '请选择设备型号',
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

  // 筛选参数
  filterParams: any = {};

  outParams: any = {};

  // 请求地址
  url: string = '/vehicle/config/list';

  // 设备状态status 1-待安绑，2-待验收，3-已合格，4-未合格，5-已返厂 ,
  // 网络状态online 1-在线，0-离线
  opreat: Opreat[] = [
    {
      key: 'bind',
      rowKey: 'imei',
      color: 'green',
      text: '绑定',
      msg: '是否要绑定？',
      // disabled: this.bindDisable,
      roles: true,
    },
    {
      key: 'unbind',
      rowKey: 'imei',
      color: 'red',
      text: '解绑',
      msg: '是否要解绑？',
      roles: true,
      // disabled: this.unBindDisable,
    },
    {
      key: 'accept',
      rowKey: 'imei',
      color: 'blue',
      text: '验收',
      // disabled: this.acceptDisable,
      roles: true,
    },
    {
      key: 'changeLoc',
      rowKey: 'imei',
      color: 'blue',
      text: '切换地址',
      roles: true,
    },
    {
      key: 'setThreshold',
      rowKey: 'imei',
      color: 'blue',
      text: '阈值',
      roles: true,
    },
    {
      key: 'logs',
      rowKey: 'imei',
      color: 'blue',
      text: '日志',
      roles: true,
    },
  ];

  acceptDisable(row: any) {
    if (row.status === 1 || row.status === 3 || row.status === 5) {
      return true;
    }
    return false;
  }

  bindDisable(row: any) {
    // 待安绑
    if (row.status === 1) {
      return false;
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
    { label: '商户门店', prop: 'merchantStores' },
    { label: 'imei号', prop: 'imei' },
    { label: '主机编码', prop: 'barCode' },
    { label: 'ICCID', prop: 'iccId' },
    { label: '设备型号', prop: 'terminalModel' },
    { label: '网络类型', prop: 'wireless' },
    { label: '当前车辆', prop: 'plateNum' },
    { label: '安绑记录', prop: 'plateNum1', formatter: this.bindLog },
    { label: '设备到期', prop: 'serviceEndDay', formatter: this.endDay },
    { label: '设备状态', prop: 'status', formatter: this.terSelect },
    { label: '上线地址', prop: 'plateNum', formatter: this.upLoc },
    { label: '网络状态', prop: 'online', formatter: this.onlineSelect },
  ];

  /**
   * @method 查看上线地址
   * @param {obj} row 列数据
   */
  upLoc(row: any) {
    return <el-button type="text" on-click={() => this.checkLoc(row)}>查看地址</el-button>;
  }

  // 点击操作时的时间
  clickTime: string = ''

  // 查看上线地址
  checkLoc(data: any) {
    this.clickTime = utils.getNowTime();
    this.upLocVisible = true;
    this.upLocData = data;
    console.log(data);
    // getOnLineAddress(data.id).then((res) => {
    //   if (res.result.resultCode === '0') {
    //     console.log(res)
    //   } else {
    //     this.$message.error(res.result.resultMessage);
    //   }
    // })
  }

  // 查看安绑记录
  bindLog(row: any) {
    return <el-button type="text" disabled={!this.opsBtn} on-click={() => this.checkLog(row)}>查看记录</el-button>;
  }

  // 设备到期时间
  endDay(row: any) {
    return <div>
      <span style="marginLeft:-6px">{row.serviceEndDay !== null ? `${row.serviceEndDay}天` : '--'}</span>
      {
        this.resetBtn
          ? <popconfirm-block
            ref={`popBlock${row.id}`}
            title="确定要对此设备进行续期1年？"
            width="225"
            keyName='续期'
            disabled={row.status !== 3}
            loading={this.loading}
            on-confirm={() => this.onResetTime(row)}
            on-cancel={this.closePop}
          >
            <el-button style="marginLeft:10px" disabled={row.status !== 3} type="text" size="small" >续期</el-button>
          </popconfirm-block> : null
      }
    </div>;
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

  // 网络状态 1-在线，0-离线，
  onlineStatus: any = [
    { key: -1, value: -1, label: '全部' },
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
  aThresholdData: any = {};

  aThresholdVisible: boolean = false;

  // BSJ或WK
  bsjThresholdData: any = {};

  bsjThresholdVisible: boolean = false;

  // 查看日志
  checkLogVisible: boolean = false;

  checkLogData: any = {};

  checkLogTitle: string = '';

  modelForm: any = {
    imei: '',
  };

  // 设备类型
  typeList: any = [];

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
        break;
      // 阈值
      case 'setThreshold':
        console.log(row);
        if (row.reportLabel2a1) {
          // 上报2a1
          this.aThresholdVisible = true;
          this.aThresholdData = row;
        } else {
          this.bsjThresholdVisible = true;
          this.bsjThresholdData = row;
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

  // downLoad(data: any) {
  //   const data1 = qs.stringify(data);
  //   terminalExport(data1, '设备管理列表');
  // }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, '设备管理列表', '/device/terminal/exportExcel');
  }

  // 关闭弹窗
  closeModal(): void {
    this.bindVisible = false; // 绑定
    this.unbindVisible = false; // 解绑
    this.acceptVisible = false; // 验收
    this.upLocVisible = false; // 线上地址
    this.changelocVisible = false; // 切换地址
    this.bsjThresholdVisible = false; // 阀值bsj wk
    this.aThresholdVisible = false; // 阀值2a1
    this.checkLogVisible = false; // 日志
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
          time={this.clickTime}
          data={this.upLocData}
          visible={this.upLocVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <changeloc-model
          data={this.changelocData}
          visible={this.changelocVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <aThreshold-model
          data={this.aThresholdData}
          visible={this.aThresholdVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <bsjThreshold-model
          data={this.bsjThresholdData}
          visible={this.bsjThresholdVisible}
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
