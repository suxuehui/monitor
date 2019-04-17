import { Component, Vue } from 'vue-property-decorator';
import { tableList, Opreat, FilterFormList } from '@/interface';
import {
  Button, Tabs, TabPane, Tag, Tooltip,
} from 'element-ui';
import qs from 'qs';
import utils from '@/utils';
import {
  deviceModel,
} from '@/api/equipment';
import exportExcel from '@/api/export';
import DeployModel from './components/deployModel';
import ReverseModel from './components/reverseModel';
import './EquipTable.less';

@Component({
  components: {
    'el-button': Button,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    'el-tag': Tag,
    'deploy-model': DeployModel,
    'reverse-model': ReverseModel,
    'el-tooltip': Tooltip,
  },
  name: 'EquipTable',
})
export default class EquipTable extends Vue {
  // 表格参数
  filterList: FilterFormList[] = [
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
      key: 'imei',
      type: 'input',
      label: 'imei',
      placeholder: '请输入imei号',
    },
  ];

  tableList: tableList[] = [
    {
      label: 'imei号',
      prop: 'imei',
    },
    {
      label: '设备型号',
      prop: 'terminalTypeModel',
    },
    {
      label: '配置启动',
      prop: 'configDate',
      formatter: (row: any) => this.addUnit(row, 'configDate'),
    },
    {
      label: '当前启动',
      prop: 'startDate',
      formatter: (row: any) => this.addUnit(row, 'startDate'),
    },
    {
      label: '启动时长',
      prop: 'duration',
      formatter: (row: any) => this.addUnit(row, 'duration'),
    },
    {
      label: '上报频率',
      prop: 'frequency',
      formatter: (row: any) => this.addUnit(row, 'frequency'),
    },
    {
      label: '追踪时间',
      prop: 'trackDate',
      formatter: (row: any) => this.specialAddUnit(row, 'trackDate'),
    },
    {
      label: '生效时间',
      prop: 'effectiveDate',
      formatter: (row: any) => this.specialAddUnit(row, 'effectiveDate'),
    },
    {
      label: '追踪时长',
      prop: 'trackDuration',
      formatter: (row: any) => this.specialAddUnit(row, 'trackDuration'),
    },
    {
      label: '追踪频率',
      prop: 'trackFrequency',
      formatter: (row: any) => this.specialAddUnit(row, 'trackFrequency'),
    },
    {
      label: '剩余电量',
      prop: 'leftPowerPercent',
    },
    {
      label: '状态',
      prop: 'status',
      formatter: this.formatStatus,
    },
  ];

  opreat: Opreat[] = [
    {
      key: 'deploy',
      rowKey: 'imei',
      color: 'blue',
      text: '配置',
      roles: true,
    },
    {
      key: 'reserve',
      rowKey: 'imei',
      color: 'green',
      text: '预约',
      roles: true,
    },
  ];

  filterParams: object = {
    clientType: '',
    imei: '',
  };

  backParams: object = {
    code: 'result.resultCode',
    codeOK: '0',
    message: 'result.resultMessage',
    data: 'entity.data',
    total: 'entity.count',
  };

  tableUrl: string = '/vehicle/tracke/findTerminalList';

  // 表格请求地址
  outParams: any = {
    vehicleId: '',
    modelId: '',
    clientType: '',
  }

  addUnit(row: any, unit: string) {
    let str = '';
    switch (unit) {
      case 'configDate':
        str = row.configDate ? `每天 ${utils.removeMarks(row.configDate)}` : '--';
        // str = row.configDate ? `每天 ${row.configDate}` : '--';
        break;
      case 'startDate':
        str = row.startDate ? `每天 ${row.startDate}` : '--';
        break;
      case 'duration':
        str = row.duration > 0 ? `${row.duration}分钟` : '--';
        break;
      case 'frequency':
        str = row.frequency > 0 ? `${row.frequency}次/天` : '--';
        break;
      default:
        break;
    }
    return (
      <el-tooltip class="item" effect="dark" content={str} placement="top">
        <span>{str}</span>
      </el-tooltip>
    );
  }

  specialAddUnit(row: any, unit?: string) {
    if (row.trackStatus && row.trackStatus !== 1) {
      let str = '';
      switch (unit) {
        case 'trackDuration':
          str = row.trackDuration > 0 ? `${row.trackDuration}分钟` : '--';
          break;
        case 'trackFrequency':
          str = row.trackFrequency > 0 ? `${row.trackFrequency}次/分钟` : '--';
          break;
        case 'trackDate':
          str = row.trackDate ? utils.removeMarks(row.trackDate) : '--';
          break;
        case 'effectiveDate':
          str = row.effectiveDate ? utils.removeMarks(row.effectiveDate) : '--';
          break;
        default:
          break;
      }
      return (
        <el-tooltip class="item" effect="dark" content={str} placement="top">
          <span>{str}</span>
        </el-tooltip>
      );
    } return '--';
  }

  typeChange(val: any) {
    this.outParams = {
      modelId: '',
      clientType: '',
    };
    if (val.length === 0) {
      this.outParams.clientType = '';
      this.outParams.modelId = '';
    } else if (val.length === 1) {
      this.outParams.clientType = val[val.length - 1];
      this.outParams.modelId = '';
    } else if (val.length === 2) {
      this.outParams.clientType = val[val.length - 2];
      this.outParams.modelId = val[val.length - 1];
    }
  }

  typeConfirm(row: any) {
    const str = row.clientType === 17 ? 'GL500' : '--';
    return (
      <el-tooltip class="item" effect="dark" content={str} placement="top">
        <span>{str}</span>
      </el-tooltip>
    );
  }

  // 格式化状态
  formatStatus(row: any) {
    let type;
    switch (row.trackStatus) {
      case 1:
        type = <el-tag size="small" type="info">未预约</el-tag>;
        break;
      case 2:
        type = <el-tag size="small">已预约</el-tag>;
        break;
      case 3:
        type = <el-tag size="small" type="success">追踪中</el-tag>;
        break;
      default:
        type = <el-tag size="small" type="info">未知</el-tag>;
        break;
    }
    return type;
  }

  // 设备类型
  typeList: any = [];

  showExportBtn: boolean = true;

  // 权限设置
  created() {
    if (this.$route.params.id) {
      this.outParams.vehicleId = this.$route.params.id;
    }
    const getNowRoles: string[] = [
      '/vehicle/tracke/saveConfig', // 配置
      '/vehicle/tracke/reserveConfig', // 预约
      '/vehicle/tracke/exportExcel', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.opreat[0].roles = !!(res[0]);// 配置
      this.opreat[1].roles = !!(res[1]); // 预约
      this.showExportBtn = !!(res[2]); // 导出
    });
  }

  mounted() {
    deviceModel('WIRELESS').then((res) => {
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
          label: '全部',
          value: '',
        });
        this.filterList[0].options = list;
        this.filterList[0].props = {
          value: 'value',
          children: 'children',
        };
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  activated() {
    this.outParams.vehicleId = this.$route.params.id;
    const Table: any = this.$refs.table;
    Table.reloadTable();
  }

  deployVisible: boolean = false;

  reverseVisible: boolean = false;

  rowData: any = {};

  currentChange = (val: any) => {
  }

  menuClick(key: string, row: any) {
    if (key === 'deploy') {
      const data: any = {
        vehicleId: this.$route.params.id,
        startDate: row.configDate, // 配置时间
        id: row.id,
        imei: row.imei,
        frequency: row.frequency,
        type: 'deploy',
      };
      this.rowData = data;
      this.deployVisible = true;
    } else if (key === 'reserve') {
      const data: any = {
        frequency: row.frequency,
        vehicleId: this.$route.params.id,
        id: row.id,
        imei: row.imei,
        trackDate: utils.removeMarks(row.trackDate).split(' ')[1],
        trackFrequency: row.trackFrequency,
        trackDuration: row.trackDuration,
        effectiveDate: utils.removeMarks(row.effectiveDate),
        type: 'reserve',
      };
      this.rowData = data;
      this.reverseVisible = true;
    }
  }

  // 关闭弹窗
  closeModal(): void {
    this.deployVisible = false;
    this.reverseVisible = false;
  }

  // 关闭后刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, `追踪设备列表${utils.returnNowTime()}`, '/vehicle/tracke/exportExcel');
  }

  clear() {
    this.outParams = {
      modelId: '',
      clientType: '',
    };
  }

  render() {
    return (
      <div class="container-equip">
        <filter-table
          ref="table"
          class="map-table"
          filter-list={this.filterList}
          filter-grade={[]}
          filter-params={this.filterParams}
          back-params={this.backParams}
          add-btn={false}
          export-btn={this.showExportBtn}
          on-downBack={this.downLoad}
          highlight-current-row={true}
          page-size-list={[5, 10, 15]}
          on-currentChange={this.currentChange}
          on-menuClick={this.menuClick}
          table-list={this.tableList}
          url={this.tableUrl}
          on-clearOutParams={this.clear}
          localName={'equipTable'}
          default-page-size={5}
          opreat={this.opreat}
          out-params={this.outParams}
          opreat-width="150px"
        >
        </filter-table>
        <deploy-model
          ref="deployModel"
          data={this.rowData}
          visible={this.deployVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></deploy-model>
        <reverse-model
          ref="reverseModel"
          data={this.rowData}
          visible={this.reverseVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></reverse-model>
      </div>
    );
  }
}
