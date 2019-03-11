import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button, Form, FormItem, Input, DatePicker,
} from 'element-ui';
import { tableList, Opreat } from '@/interface';
import MTable from '@/components/FilterTable/MTable';

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

  created() {
    // id、imei
    this.tableParams = {
      page: true,
      pageNum: 1,
      pageSize: 5,
      imei: this.$route.query.imei,
    };
    this.defaultPageSize = 5;
  }

  @Watch('time')
  onDataChange() {
    this.defaultTime = [
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
      new Date(new Date().getFullYear(), new Date().getMonth(),
        new Date().getDate(), new Date().getHours(), new Date().getMinutes(),
        new Date().getSeconds()),
    ];
  }

  loading: boolean = false;

  modelForm: any = {
  };

  tableParams: any = {
    page: true,
    pageNum: 1,
    pageSize: 5,
  }

  defaultPageSize: any = null;

  url: string = '/terminal/ops/list';

  opreat: Opreat[] = [];

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
        const time = {
          startTime: data[0],
          endTime: data[1],
        };
        console.log(time);
        // this.createdDrivingData(time, 'refresh');
      } else {
        this.$message.error('查询时间范围最大为三个月，请重新选择');
      }
    }
  }

  // 表格参数
  tableList: tableList[] = [
    { label: '时间', prop: 'orgName' },
    { label: '事件', prop: 'opsRealName' },
    { label: '软件版本', prop: 'opsType' },
    { label: '上电状态标志', prop: 'crtTime' },
    { label: '重启次数', prop: 'installUrl' },
    { label: '离线前状态', prop: 'vinUrl' },
  ];

  closeModal() {
    this.$emit('close');
    setTimeout(() => {
      this.modelForm = {};
      this.defaultTime = [];
    }, 200);
  }

  tableClick(key: string, row: any) { }

  handleSearch() { }

  // 查询数据
  getTableData() {
    const mTable: any = this.$refs.MTable;
    mTable.getData();
  }

  render() {
    return (
      <el-dialog
        width="660px"
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
            fetchType='post'
            dataType={'JSON'}
            opreat={this.opreat}
            opreat-width={'180px'}
            on-tableClick={this.tableClick}
            defaultPageSize={this.defaultPageSize}
          />
        </div>
      </el-dialog>
    );
  }
}
