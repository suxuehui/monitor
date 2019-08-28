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
    this.tableParams.pageNum = 1;
    this.tableParams.imei = this.data.imei;
    this.getTableData();
  }

  tableParams: any = {
    page: true,
    pageNum: 1,
    pageSize: 5,
    imei: '',
  }
  
  // 查询数据
  getTableData() {
    const mTable: any = this.$refs.MTable;
    if (mTable) {
      mTable.clearPageParams();
      mTable.getData(this.tableParams);
    }
  }

  defaultPageSize: any = null;

  url: string = '/device/terminal/findTerminalLog';

  operat: Opreat[] = [];

  // 表格参数
  tableList: tableList[] = [
    { label: '操作人员', prop: 'time' },
    { label: '操作时间', prop: 'event' },
    { label: '操作内容', prop: 'softVersion' },
  ];

  closeModal() {
    this.$emit('close');
  }

  tableClick(key: string, row: any) { }

  render() {
    const pickerOptions = {
      disabledDate(time: any) {
        return time.getTime() > Date.now();
      },
    };
    return (
      <el-dialog
        width="650px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        {/* <div class="table">
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
        </div> */}
        日志
      </el-dialog>
    );
  }
}
