import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag } from 'element-ui';
import {
  attachcfgQuery, attachcfgEnable, attachcfgDisable, attachcfgQuerylog,
} from '@/api/config';
import exportExcel from '@/api/export';
import AddModel from './components/Addmodel';
import CheckLogModel from './components/CheckLogModel';
import utils from '@/utils';
@Component({
  components: {
    'el-tag': Tag,
    'add-model': AddModel,
    'checkLog-model': CheckLogModel,
  },
  name: 'NetPlus',
})
export default class NetPlus extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'keyword',
      type: 'input',
      label: '配置文件名',
      placeholder: '品牌、车系、车型',
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
  url: string = '/attachcfg/list';

  operat: Opreat[] = [
    {
      key: 'edit',
      rowKey: 'id',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'able',
      rowKey: 'id',
      color: 'green',
      text: '启用',
      disabled: (row: any) => this.enableClick(row),
      roles: true,
    },
    {
      key: 'forbid',
      rowKey: 'id',
      color: 'red',
      text: '禁用',
      disabled: (row: any) => this.disableClick(row),
      roles: true,
    },
    {
      key: 'log',
      rowKey: 'productidCode',
      color: 'blue',
      text: '日志',
      roles: true,
    },
  ];

  enableClick(data:any) {
    return data.enable;
  }

  disableClick(data:any) {
    return !data.enable;
  }

  // 表格参数
  tableList: tableList[] = [
    { label: '品牌', prop: 'brandName' },
    { label: '车系', prop: 'seriesName' },
    { label: '车型', prop: 'modelName' },
    { label: '最近修改时间', prop: 'updTime' },
    { label: '最近修改人员', prop: 'updUser' },
    { label: '状态', prop: 'enable', formatter: this.enableStatus },
  ];

  enableStatus(row: any) {
    const str: string = row.enable ? '已启用' : '未启用';
    const type: string = row.enable ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{str}</el-tag>;
  }

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/attachcfg/insert', // 新增
      '/attachcfg/edit', // 编辑
      '/attachcfg/enable/{cfgId}', // 启用
      '/attachcfg/disable/{cfgId}', // 禁用
      '/attachcfg/querylog', // 日志查询
      '/attachcfg/exportExcel', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.showAddBtn = !!(res[0]); // 新增
      this.operat[0].roles = !!(res[1]); // 编辑
      this.operat[1].roles = !!(res[2]); // 启用
      this.operat[2].roles = !!(res[3]); // 禁用
      this.operat[3].roles = !!(res[4]); // 日志
      this.showExportBtn = !!(res[5]); // 导出
    });
  }

  // 新增、导出按钮展示
  showAddBtn: boolean = true;

  showExportBtn: boolean = true;

  // 新增、编辑、
  addVisible: boolean = false;

  addTitle: string = '';

  rowData: any = {};

  // 查看日志
  checkLogVisible: boolean = false;

  checkLogData: any = {};

  checkLogTitle: string = '修改日志';

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      this.addVisible = true;
      this.addTitle = '编辑配置';
      this.rowData = row;
      this.netPlusClickTime = utils.getNowTime();
    } else if (key === 'able') {
      attachcfgEnable(row.id).then((res) => {
        if (res.result.resultCode === '0') {
          FromTable.reloadTable();
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'forbid') {
      attachcfgDisable(row.id).then((res) => {
        if (res.result.resultCode === '0') {
          FromTable.reloadTable();
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'log') {
      this.checkLogData = row;
      this.checkLogVisible = true;
      this.clickTime = utils.getNowTime();
    }
  }

  // 点击操作时的时间
  clickTime: string = '';

  netPlusClickTime: string = '';

  addModel() {
    this.addVisible = true;
    this.addTitle = '添加配置';
  }

  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    this.checkLogVisible = false;
  }

  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, `配置列表${utils.returnNowTime()}`, '/attachcfg/exportExcel');
  }

  render(h: any) {
    return (
      <div class="fzk-config-wrap">
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          add-btn={this.showAddBtn}
          opreatWidth={'180px'}
          localName={'model'}
          dataType={'JSON'}
          on-addBack={this.addModel}
          operat={this.operat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          export-btn={this.showExportBtn}
          on-downBack={this.downLoad}
          on-menuClick={this.menuClick}
        />
        <add-model
          ref="addTable"
          time={this.netPlusClickTime}
          data={this.rowData}
          title={this.addTitle}
          visible={this.addVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
        <checkLog-model
          time={this.clickTime}
          title={this.checkLogTitle}
          data={this.checkLogData}
          visible={this.checkLogVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        />
      </div>
    );
  }
}
