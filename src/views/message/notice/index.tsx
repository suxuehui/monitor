import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag, Opreat } from '@/interface';
import { Tag, Tooltip } from 'element-ui';
import { noticeDelete, noticeView } from '@/api/message';
import AddModal from '@/views/message/notice/components/AddModal';
import CheckModel from '@/views/message/notice/components/CheckModel';

@Component({
  components: {
  'el-tag': Tag,
  'add-modal': AddModal,
  'check-modal': CheckModel,
  'el-tooltip': Tooltip,
  }
  })
export default class Alarm extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'keyword',
      type: 'input',
      label: '标题',
      placeholder: '请输入标题',
    },
  ];
  // 高级筛选
  filterGrade: FilterFormList[] = [];
  // 筛选参数
  filterParams: any = {
    keyword: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/message/notice/list';

  opreat: Opreat[] = [
    {
      key: 'check',
      rowKey: 'id',
      color: 'blue',
      text: '查看',
      roles: true,
    },
    {
      key: 'delete',
      rowKey: 'id',
      color: (row: any) => (row.abcd === 1 ? 'green' : 'red'),
      text: (row: any) => (row.abcd === 1 ? '绑定' : '删除'),
      msg: (row: any) => (row.abcd === 1 ? '是否要绑定？' : '是否要删除？'),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '标题', prop: 'title' },
    { label: '内容', prop: 'content', formatter: this.contentChange },
    {
      label: '发布时间',
      prop: 'publishTime',
      sortable: true,
      sortBy: 'publishTime',
    },
    { label: '发布人', prop: 'publisher' },
  ];

  // 新增
  addVisible: boolean = false;
  addTitle: string = '';
  // 查看
  checkVisible: boolean = false;

  modelForm: any = {
    title: '',
    content: '',
  };
  checkData: any = {}

  contentChange(row: any) {
    const dd = row.content.replace(/<[^>]+>/g, '');
    const res = dd.replace(/&nbsp;/g, '');
    return res;
  }

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'check') {
      this.checkData = row;
      this.checkVisible = true;
      noticeView({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          this.$store.dispatch('getNotice');
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'delete') {
      noticeDelete({ id: row.id }).then((res) => {
        if (res.result.resultCode) {
          FromTable.reloadTable();
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    }
  }
  addModel() {
    this.addVisible = true;
    this.modelForm = null;
  }
  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    this.checkVisible = false;
  }
  // 关闭后刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
  }
  render(h: any) {
    return (
      <div class="member-wrap">
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          add-btn={true}
          on-addBack={this.addModel}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          dataType={'JSON'}
          export-btn={true}
          localName={'notice'}
          on-menuClick={this.menuClick}
        />
        <add-modal
          visible={this.addVisible}
          data={this.modelForm}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></add-modal>
        <check-modal
          visible={this.checkVisible}
          data={this.checkData}
          on-close={this.closeModal}
        ></check-modal>
      </div>
    );
  }
}
