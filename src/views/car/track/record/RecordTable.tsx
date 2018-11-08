import { Component, Vue } from 'vue-property-decorator';
import { tableList, Opreat, FilterFormList, MapCarData } from '@/interface';
import { Button, Tabs, TabPane } from 'element-ui';

import './RecordTable.less';
@Component({
  components: {
  'el-button': Button,
  'el-tabs': Tabs,
  'el-tab-pane': TabPane
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
      prop: 'shopName',
    },
    {
      label: '时间',
      prop: 'name',
    },
    {
      label: '地点',
      prop: 'areaValue',
    },
    {
      label: '上报类型',
      prop: 'address',
    },
    {
      label: '型号',
      prop: 'alarmType',
    },
    {
      label: 'imei号',
      prop: 'remark',
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
  tableUrl: string = '/vehicle/monitor/list'; // 表格请求地址
  outParams: any = {
    startTime: '',
    endTime: '',
  }

  clear() {
    this.outParams = {
      startTime: '',
      endTime: '',
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

  currentChange = (val: any) => {
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
