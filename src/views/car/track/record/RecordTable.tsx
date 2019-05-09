import { Component, Vue, Emit } from 'vue-property-decorator';
import { tableList, Opreat, FilterFormList } from '@/interface';
import {
  Button, Tabs, TabPane, Tooltip,
} from 'element-ui';
import qs from 'qs';
import lodash from 'lodash';
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
        disabledDate(time: any) {
          return time.getTime() > Date.now();
        },
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
    },
    {
      label: 'imei号',
      prop: 'imei',
    },
  ];

  opreat: Opreat[] = [];

  filterParams: any = {
    query: [null, null],
  };

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
    startDate: null,
    endDate: null,
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

  showExportBtn: boolean = false;

  created() {
    if (this.$route.params.id) {
      this.outParams.vehicleId = this.$route.params.id;
    }
    const getNowRoles: string[] = [
      '/vehicle/tracke/exportExcelRecord', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.showExportBtn = !!(res[0]); // 导出
    });
  }

  activated() {
    this.outParams.vehicleId = this.$route.params.id;
    const TableRecord: any = this.$refs.recordTable;
    TableRecord.reloadTable();
  }

  clear() {
    this.outParams = {
      startDate: null,
      endDate: null,
      vehicleId: this.$route.params.id,
    };
  }

  timeRangeChange(val: any) {
    if (val) {
      if (val.length === 2) {
        const startT = val[0].Format('yyyy-MM-dd hh:mm:ss');
        const endT = val[1].Format('yyyy-MM-dd hh:mm:ss');
        const startT1 = new Date(startT).getTime();
        const endT1 = new Date(endT).getTime();
        if (endT1 - startT1 < 90 * 24 * 60 * 60 * 1000) {
          this.outParams = {
            startDate: startT,
            endDate: endT,
          };
        } else {
          const date = new Date();
          const startTime = new Date(date.getTime() - (90 * 24 * 60 * 60 * 1000));
          this.outParams.startDate = new Date(startTime).Format('yyyy-MM-dd hh:mm:ss');
          this.outParams.endDate = date.Format('yyyy-MM-dd hh:mm:ss');
          this.$message.error('查询时间不能超过3个月，请重新选择');
        }
      } else {
        this.outParams.startDate = `${val[0]}`;
        this.outParams.endDate = `${val[1]}`;
      }
    } else {
      this.outParams.startDate = null;
      this.outParams.endDate = null;
    }
  }

  currentChange(val: any) {
    if (val) {
      if (parseFloat(val.lat) >= 0) {
        val.origin = 'click';
        this.$emit('location', val);
      } else {
        this.$message.error('该设备暂无位置信息！');
      }
    }
  }

  pageDataChange(val: any) {
    const data: any = lodash.cloneDeep(val);
    data.forEach((item: any, index: number) => {
      this.$emit('location', item);
    });
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
          ref="recordTable"
          class="map-table"
          max-height="255"
          filter-list={this.filterList}
          filter-grade={[]}
          filter-params={this.filterParams}
          back-params={this.backParams}
          add-btn={false}
          export-btn={this.showExportBtn}
          on-downBack={this.downLoad}
          highlight-current-row={true}
          on-clearOutParams={this.clear}
          on-currentChange={this.currentChange}
          on-pageDataChange={this.pageDataChange}
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
