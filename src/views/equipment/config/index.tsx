import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag, Button } from 'element-ui';
import exportExcel from '@/api/export';

import DownConfigModel from './components/DownConfigModel';
import ClearConfigModel from './components/ClearConfigModel';
import BtAuthModel from './components/BtAuthModel';
import BtNameModel from './components/BtNameModel';
import CheckConfigModel from './components/CheckConfigModel';
import SearchConfigModel from './components/SearchConfigModel';
import utils from '@/utils';
@Component({
  components: {
    'el-tag': Tag,
    'el-button': Button,
    'downconfig-model': DownConfigModel,
    'clearconfig-model': ClearConfigModel,
    'btauth-model': BtAuthModel,
    'btname-model': BtNameModel,
    'checkconfig-model': CheckConfigModel,
    'searchconfig-model': SearchConfigModel,
  },
  name: 'ConfigModel',
})
export default class ConfigModel extends Vue {
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
      key: 'online',
      type: 'select',
      label: '网络状态',
      placeholder: '请选择网络状态',
      options: [],
    },
    {
      key: 'online',
      type: 'select',
      label: '设备型号',
      placeholder: '请选择设备型号',
      options: [],
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
      placeholder: '商户门店（全部）',
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
      key: 'online',
      type: 'select',
      label: '设备型号',
      placeholder: '请选择设备型号',
      options: [],
    },
    {
      key: 'keyWord',
      type: 'input',
      label: '其他参数',
      placeholder: 'imei号、主机编码、车牌号、配置名称、产品编码',
    },
  ];

  // 筛选参数
  filterParams: any = {};

  outParams: any = {};

  // 请求地址
  url: string = '/vehicle/config/list';
  // url: string = '/device/terminal/configurationLis';

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
    { label: '操作记录', prop: 'reboot', formatter: this.upLoc },
    { label: '网络状态', prop: 'reboot' },
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
  //   { label: '操作记录', prop: 'orgName', formatter: this.upLoc },
  //   { label: '网络状态', prop: 'online' },
  // ];

  /**
   * @method 查看上线地址
   * @param {obj} row 列数据
   */
  upLoc(row: any) {
    return <el-button type="text" on-click={() => this.checkLoc(row)}>查看</el-button>;
  }

  // 查看上线地址
  checkLoc(data: any) {
    this.clickTime = utils.getNowTime();
    // this.upLocVisible = true;
    // this.upLocData = data;
    console.log(data);
    // getOnLineAddress(data.id).then((res) => {
    //   if (res.result.resultCode === '0') {
    //     console.log(res)
    //   } else {
    //     this.$message.error(res.result.resultMessage);
    //   }
    // })
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
      this.searchconfigVisible = true;
      this.searchconfigData = row;
    } else if (key === 'btAuth') { // 蓝牙鉴权
      this.btAuthVisible = true;
      this.btAuthData = row;
    } else if (key === 'btName') { // 蓝牙名称
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

  // 点击时间
  clickTime: string = '';

  // 关闭弹窗
  closeModal(): void {
    this.downconfigVisibale = false; // 下发配置
    this.clearconfigVisible = false; // 清除配置
    this.btAuthVisible = false; // 蓝牙鉴权
    this.btNameVisible = false; // 蓝牙名称
    this.searchconfigVisible = false; // 查询配置
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
      </div>
    );
  }
}
