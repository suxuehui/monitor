import { Component, Vue, Emit } from 'vue-property-decorator';
import { tableList, Opreat, FilterFormList } from '@/interface';
import { Button, Tabs, TabPane, Tooltip } from 'element-ui';

import './RecordTable.less';
@Component({
  components: {
  'el-button': Button,
  'el-tabs': Tabs,
  'el-tab-pane': TabPane,
  'el-tooltip': Tooltip,
  }
  })
export default class Equipment extends Vue {
  // 表格参数
  filterList: FilterFormList[] = [
    {
      key: 'time',
      type: 'datetimerange',
      label: '时间',
      placeholder: [
        '开始时间', '结束时间',
      ],
      value: [
        'startTime', 'endTime',
      ],
      change: this.timeRangeChange,
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              const end = new Date();
              const start = new Date(`${end.Format('yyyy-MM-dd hh:mm:ss').replace(/\s\w+:\w+:\w+/g, '')} 00:00:00`);
              picker.$emit('pick', [start, end]);
            },
          }, {
            text: '昨天',
            onClick(picker) {
              const end = new Date();
              const start = new Date(`${end.Format('yyyy-MM-dd hh:mm:ss').replace(/\s\w+:\w+:\w+/g, '')} 00:00:00`);
              end.setTime(start.getTime());
              start.setTime(start.getTime() - (3600 * 1000 * 24));
              picker.$emit('pick', [start, end]);
            },
          }, {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - (3600 * 1000 * 24 * 7));
              picker.$emit('pick', [start, end]);
            },
          },
        ],
      },
    },
  ];
  tableList: tableList[] = [
    {
      label: '车牌',
      prop: 'platNum',
    },
    {
      label: '时间',
      prop: 'date',
      sortable: true,
      sortBy: 'date',
    },
    {
      label: '地点',
      prop: 'address',
    },
    {
      label: '上报类型',
      prop: 'type',
      formatter: this.checkType,
    },
    {
      label: '型号',
      prop: 'clientType',
      formatter: this.checkClientType,
    },
    {
      label: 'imei号',
      prop: 'imei',
    },
  ];
  opreat: Opreat[] = [];
  filterParams: object = {};
  backParams: object = {
    code: 'result.resultCode',
    codeOK: '0',
    message: 'result.resultMessage',
    data: 'entity.data',
    total: 'entity.count',
  };
  tableUrl: string = '/vehicle/tracke/findRecordList'; // 表格请求地址
  outParams: any = {
    startTime: '',
    endTime: '',
    vehicleId: '',
  }

  checkClientType(row: any) {
    let str = '';
    if (row.clientType === 17) {
      str = 'GL500';
    } else {
      str = '--';
    }
    return <el-tooltip class="item" effect="dark" content={str} placement="top">
      <span>{str}</span>
    </el-tooltip>;
  }
  checkType(row: any) {
    let str = '';
    if (row.clientType === 1) {
      str = '正常上报';
    } else if (row.clientType === 2) {
      str = '追踪上报';
    } else {
      str = '--';
    }
    return <el-tooltip class="item" effect="dark" content={str} placement="top">
      <span>{str}</span>
    </el-tooltip>;
  }

  created() {
    if (this.$route.params.id) {
      this.outParams.vehicleId = this.$route.params.id;
    }
  }

  clear() {
    this.outParams = {
      startTime: '',
      endTime: '',
      vehicleId: '',
    };
  }
  timeRangeChange(val: any) {
    if (val) {
      if (val.length === 2) {
        const startT = val[0].Format('yyyy-MM-dd hh:mm:ss');
        const endT = val[1].Format('yyyy-MM-dd hh:mm:ss');
        this.outParams.startTime = startT;
        this.outParams.endTime = endT;
      } else {
        this.outParams.startTime = `${val[0]}`;
        this.outParams.endTime = `${val[1]}`;
      }
    }
  }

  currentChange(val: any) {
    this.$emit('location', val);
  }

  menuClick(key: string, row: any) {

  }
  render() {
    return (
      <div class="container-record">
        <filter-table
          ref="table"
          class="map-table"
          filter-list={this.filterList}
          filter-grade={[]}
          filter-params={this.filterParams}
          back-params={this.backParams}
          add-btn={false}
          export-btn={true}
          highlight-current-row={true}
          on-currentChange={this.currentChange}
          on-menuClick={this.menuClick}
          table-list={this.tableList}
          url={this.tableUrl}
          default-page-size={5}
          localName={'recordTable'}
          dataType={'JSON'}
          opreat={this.opreat}
          out-params={this.outParams}
          opreat-width="150px"
        >
        </filter-table>
      </div>
    );
  }
}
