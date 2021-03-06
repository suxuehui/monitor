import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button, Form, FormItem, Input, DatePicker,
} from 'element-ui';
import { tableList, Opreat } from '@/interface';
import MTable from '@/components/FilterTable/MTable';
import utils from '@/utils';

import './CheckLogModel.less';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-input': Input,
    'el-form-item': FormItem,
    'el-button': Button,
    'm-table': MTable,
    'el-date-picker': DatePicker,
  },
})
export default class CheckLogModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private title: any;

  @Prop() private time: any;

  mounted() {
    this.tableParams = {
      page: true,
      pageNum: 1,
      pageSize: 5,
    };
    this.defaultPageSize = 5;
  }

  nowTime: any = null;

  @Watch('time')
  onDataChange() {
    /**
     * 每次点击进来重新设置查询时间、显示时间，然后再更新数据，
     */
    this.defaultTime = [
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
      new Date(new Date().getFullYear(), new Date().getMonth(),
        new Date().getDate(), new Date().getHours(), new Date().getMinutes(),
        new Date().getSeconds()),
    ];
    const date = new Date();
    this.tableParams.pageNum = 1;
    this.tableParams.imei = this.data.imei;
    this.tableParams.startTime = utils.returnTime();
    this.tableParams.endTime = date.Format('yyyy-MM-dd hh:mm:ss');
    this.getTableData();
  }

  tableParams: any = {
    page: true,
    pageNum: 1,
    pageSize: 5,
    startTime: '',
    endTime: '',
    imei: '',
  }

  defaultPageSize: any = null;

  url: string = '/device/terminal/findTerminalLog';

  operat: Opreat[] = [];

  // 默认时间
  defaultTime: any = [
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
    new Date(new Date().getFullYear(), new Date().getMonth(),
      new Date().getDate(), new Date().getHours(), new Date().getMinutes(),
      new Date().getSeconds()),
  ];

  timeSelect(data: any) {
    if (data) {
      const start = new Date(data[0]).getTime();
      const end = new Date(data[1]).getTime();
      if (end - start < 90 * 24 * 60 * 60 * 1000) {
        this.tableParams = {
          imei: this.data.imei,
          startTime: data[0],
          endTime: data[1],
        };
      } else {
        this.$message.error('查询时间范围最大为三个月，请重新选择');
      }
    } else {
      this.tableParams = {
        imei: this.data.imei,
        startTime: '',
        endTime: '',
      };
    }
  }

  // 表格参数
  tableList: tableList[] = [
    { label: '时间', prop: 'time' },
    { label: '事件', prop: 'event' },
    { label: '软件版本', prop: 'softVersion' },
    {
      label: '上电状态标志',
      prop: 'powerOnStatus',
    },
    {
      label: '重启次数',
      prop: 'restartNumber',
      formatter: this.numSet,
    },
    { label: '离线前状态', prop: 'preOfflineState' },
  ];

  numSet(row: any) {
    return row.restartNumber ? `${row.restartNumber}` : '--';
  }

  closeModal() {
    this.$emit('close');
  }

  tableClick(key: string, row: any) { }

  handleSearch() {
    const mTable: any = this.$refs.MTable;
    if (mTable) {
      mTable.getData();
    }
  }

  // 查询数据
  getTableData() {
    const mTable: any = this.$refs.MTable;
    if (mTable) {
      mTable.clearPageParams();
      mTable.getData(this.tableParams);
    }
  }

  render() {
    const pickerOptions = {
      disabledDate(time: any) {
        return time.getTime() > Date.now();
      },
    };
    return (
      <el-dialog
        width="850px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="fzkTimePick">
          <el-date-picker
            id="datePicker"
            v-model={this.defaultTime}
            type="datetimerange"
            size="mini"
            value-format="yyyy-MM-dd HH:mm:ss"
            on-change={(val: any) => this.timeSelect(val)}
            range-separator="至"
            picker-options={pickerOptions}
            start-placeholder="开始"
            end-placeholder="结束">
          </el-date-picker>
          <el-button type="primary" size="mini" class="searchBtn" on-click={this.handleSearch} icon="el-icon-search">查询</el-button>
        </div>
        <div class="table">
          <m-table
            ref="MTable"
            class="mTable"
            table-list={this.tableList}
            table-params={this.tableParams}
            url={this.url}
            row-key="rowKey"
            pagerCount={5}
            pageSizeList={[5, 10, 15]}
            fetchType='post'
            dataType={'JSON'}
            operat={this.operat}
            operat-width={'180px'}
            on-tableClick={this.tableClick}
            defaultPageSize={this.defaultPageSize}
          />
        </div>
      </el-dialog>
    );
  }
}
