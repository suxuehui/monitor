import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog,
} from 'element-ui';
import { tableList, Opreat } from '@/interface';
import MTable from '@/components/FilterTable/MTable';

@Component({
  components: {
    'el-dialog': Dialog,
    'm-table': MTable,
  },
})
export default class CheckLogModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private title: any;

  @Prop() private time: any;

  @Watch('time')
  onDataChange() {
    this.url = '/device/terminal/opsList';
    this.tableParams.imei = this.data.imei;
    const mtable: any = this.$refs.MTable;
    if (mtable) {
      mtable.reload();
    }
  }

  loading: boolean = false;

  tableParams: any = {
    page: true,
    pageNum: 1,
    pageSize: 10,
    imei: '',
  }

  defaultPageSize: any = 10;

  url: string = '';

  operat: Opreat[] = [];

  // 表格参数
  tableList: tableList[] = [
    { label: '操作人员', prop: 'orgName', formatter: this.manSet },
    { label: '操作时间', prop: 'crtTime' },
    { label: '操作内容', prop: 'content' },
  ];

  // 操作人员设置
  manSet(row: any) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p>{row.orgName}-{row.realName}</p>
        <p>({row.userName})</p>
      </div>
    );
  }

  closeModal() {
    this.$emit('close');
  }

  tableClick(key: string, row: any) { }

  handleSearch() { }

  render() {
    return (
      <el-dialog
        width="850px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="table">
          <m-table
            ref="MTable"
            class="mTable"
            table-list={this.tableList}
            table-params={this.tableParams}
            url={this.url}
            row-key="rowKey"
            fetchType='post'
            pagerCount={5}
            dataType={'JSON'}
            operat={this.operat}
            height={'300'}
            operat-width={'180px'}
            on-tableClick={this.tableClick}
            defaultPageSize={this.defaultPageSize}
          />
        </div>
      </el-dialog>
    );
  }
}
