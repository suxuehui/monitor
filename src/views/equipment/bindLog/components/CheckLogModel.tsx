import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { Dialog, Tooltip } from 'element-ui';
import { tableList, Opreat } from '@/interface';
import MTable from '@/components/FilterTable/MTable';
import './CheckLogModel.less';
@Component({
  components: {
    'el-dialog': Dialog,
    'm-table': MTable,
    'el-tooltip': Tooltip,
  },
})
export default class CheckLog extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  @Prop() private time: any;

  tableParams: any = {}

  url: string = '/terminal/accept/list';

  opreat: Opreat[] = [];

  // 表格参数
  tableList: tableList[] = [
    { label: '验收员', prop: 'orgName', formatter: this.acceptPerson },
    { label: '提交时间', prop: 'createTime' },
    { label: '验收时间', prop: 'acceptTime' },
    { label: '验收状态', prop: 'acceptStatus', formatter: (row: any) => (row.acceptStatus ? row.acceptStatus : '--') },
    { label: '备注', prop: 'remark' },
  ];

  acceptPerson(row: any) {
    return row.acceptOrgName && row.acceptRealName && row.acceptUsername
      ? <el-tooltip class="item" effect="dark" content={`${row.acceptOrgName}+${row.acceptRealName}+${row.acceptUsername}`} placement="top">
        <div>
          <p>{`${row.acceptOrgName}+${row.acceptRealName}`}</p>
          <p>{`(${row.acceptUsername})`}</p>
        </div>
      </el-tooltip> : '--';
  }

  @Watch('time')
  onDataChange() {
    this.tableParams = {
      opsRecordId: this.data,
      page: true,
      pageNum: 1,
      pageSize: 10,
    };
    const mtable: any = this.$refs.MTable;
    if (mtable) {
      mtable.getData(this.tableParams);
    }
  }

  closeModal() {
    this.$emit('close');
  }

  tableClick() { }

  render() {
    return (
      <div>
        <el-dialog
          width="780px"
          title="验收记录"
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
              dataType={'JSON'}
              opreat={this.opreat}
              opreat-width={'180px'}
              on-tableClick={this.tableClick}
            />
          </div>
        </el-dialog>
      </div >
    );
  }
}
