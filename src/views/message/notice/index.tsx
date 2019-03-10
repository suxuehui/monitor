import { Component, Vue } from 'vue-property-decorator';
import {
  FilterFormList, tableList, Opreat,
} from '@/interface';
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
  },
  name: 'Notice',
})
export default class Notice extends Vue {
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
      rowKey: 'title',
      color: 'blue',
      text: '查看',
      roles: true,
    },
    {
      key: 'delete',
      rowKey: 'title',
      color: 'red',
      text: '删除',
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

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/message/notice/publish',
      '/message/notice/delete',
      '/message/notice/view',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.opreat[1].roles = !!(res[1]);
      this.opreat[0].roles = !!(res[2]);
      this.addBtn = !!(res[0]);
    });
  }

  // 新增、导出按钮展示
  addBtn: boolean = true;

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
        if (res.result.resultCode === '0') {
          FromTable.reloadTable('delete');
          this.$store.dispatch('getNotice');
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
          add-btn={this.addBtn}
          on-addBack={this.addModel}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          dataType={'JSON'}
          export-btn={false}
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
