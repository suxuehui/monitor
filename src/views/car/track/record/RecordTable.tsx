import { Component, Vue, Emit } from 'vue-property-decorator';
import { tableList, Opreat, FilterFormList } from '@/interface';
import {
  Button, Tabs, TabPane, Tooltip,
} from 'element-ui';
import qs from 'qs';
import exportExcel from '@/api/export';
import utils from '@/utils';

import './RecordTable.less';
@Component({
  components: {
    'el-button': Button,
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
    'el-tooltip': Tooltip,
  },
  name: 'RecordTable',
})
export default class RecordTable extends Vue {
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
      label: '设备型号',
      prop: 'terminalTypeModel',
      // formatter: this.checkClientType,
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

  tableUrl: string = '/vehicle/tracke/findRecordList';

  // 表格请求地址
  outParams: any = {
    startDate: '',
    endDate: '',
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

  exportBtn: boolean = false;

  created() {
    if (this.$route.params.id) {
      this.outParams.vehicleId = this.$route.params.id;
    }
    const getNowRoles: string[] = [
      '/vehicle/tracke/exportExcelRecord',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.exportBtn = !!(res[0]);
    });
  }

  activated() {
    this.outParams.vehicleId = this.$route.params.id;
    const TableRecord: any = this.$refs.table;
    TableRecord.reloadTable();
  }

  clear() {
    this.outParams = {
      startDate: '',
      endDate: '',
      vehicleId: this.$route.params.id,
    };
  }

  timeRangeChange(val: any) {
    if (val) {
      if (val.length === 2) {
        const startT = val[0].Format('yyyy-MM-dd hh:mm:ss');
        const endT = val[1].Format('yyyy-MM-dd hh:mm:ss');
        this.outParams.startDate = startT;
        this.outParams.endDate = endT;
      } else {
        this.outParams.startDate = `${val[0]}`;
        this.outParams.endDate = `${val[1]}`;
      }
    } else {
      this.outParams.startDate = '';
      this.outParams.endDate = '';
    }
  }

  currentChange(val: any) {
    if (val) {
      if (parseFloat(val.lat) >= 0) {
        this.$emit('location', val);
      } else {
        this.$message.error('该设备暂无位置信息！');
      }
    }
  }

  menuClick(key: string, row: any) {

  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, `追踪记录列表${utils.returnNowTime()}`, '/vehicle/tracke/exportExcelRecord');
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
          page-size-list={[5, 10, 15]}
          export-btn={this.exportBtn}
          on-downBack={this.downLoad}
          highlight-current-row={true}
          on-clearOutParams={this.clear}
          on-currentChange={this.currentChange}
          on-menuClick={this.menuClick}
          table-list={this.tableList}
          url={this.tableUrl}
          default-page-size={5}
          localName={'recordTable'}
          opreat={this.opreat}
          out-params={this.outParams}
          opreat-width="150px"
        >
        </filter-table>
      </div>
    );
  }
}
