import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator';
import { Dialog } from 'element-ui';
import { FilterFormList, tableList, Opreat } from '@/interface';
import MTable from '@/components/FilterTable/MTable';
import './CheckLogModel.less';
@Component({
  components: {
  'el-dialog': Dialog,
  "m-table": MTable
  }
  })
export default class CheckLog extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop({ default: '' }) private title!: string;
  @Prop() private data: any;
  tableParams: any = {}
  url: string = '/terminal/accept/list';
  opreat: Opreat[] = [];
  // 表格参数
  tableList: tableList[] = [
    { label: '验收员', prop: 'orgName', formatter: this.acceptPerson },
    { label: '提交时间', prop: 'createTime', formatter: (row: any) => (row.createTime ? row.createTime : '--') },
    { label: '验收时间', prop: 'acceptTime', formatter: (row: any) => (row.acceptTime ? row.acceptTime : '--') },
    { label: '验收状态', prop: 'acceptStatus', formatter: (row: any) => (row.acceptStatus ? row.acceptStatus : '--') },
    { label: '备注', prop: 'remark', formatter: (row: any) => (row.remark ? row.remark : '--') },
  ];

  acceptPerson(row: any) {
    return <div>
      <p>{`${row.acceptOrgName}+${row.acceptRealName}`}</p>
      <p>{`(${row.acceptUsername})`}</p>
    </div>;
  }

  @Watch('data')
  onDataChange() {
    this.tableParams = {
      opsRecordId: this.data,
      page: true,
      pageNum: 1,
      pageSize: 10,
    };
  }

  closeModal() {
    this.$emit('close');
  }

  tableClick() {

  }
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
