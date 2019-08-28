import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag } from 'element-ui';
import { configDelete, configInfo } from '@/api/config';
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
      key: 'keyWord',
      type: 'input',
      label: '配置文件名',
      placeholder: '配置名称、产品编码',
    },
  ];

  // 高级筛选
  filterGrade: FilterFormList[] = [];

  // 筛选参数
  filterParams: any = {
    shopName: '',
    available: '',
    confName: '',
  };

  outParams: any = {};

  // 请求地址
  url: string = '/vehicle/config/list';

  opreat: Opreat[] = [
    {
      key: 'edit',
      rowKey: 'productCode',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'able',
      rowKey: 'productCode',
      color: 'green',
      text: '启用',
      roles: true,
    },
    {
      key: 'forbid',
      rowKey: 'productCode',
      color: 'red',
      text: '禁用',
      roles: true,
    },
    {
      key: 'log',
      rowKey: 'productCode',
      color: 'blue',
      text: '日志',
      roles: true,
    },
  ];

  // 表格参数
  tableList: tableList[] = [
    { label: '品牌', prop: 'cfgName' },
    { label: '车系', prop: 'productCode' },
    { label: '车型', prop: 'remark' },
    { label: '最近修改时间', prop: 'remark' },
    { label: '最近修改人员', prop: 'remark' },
    { label: '状态', prop: 'remark' },
  ];

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/vehicle/config/add', // 新增
      '/vehicle/config/update', // 编辑
      '/vehicle/config/exportExcel', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      // 
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
      console.log('编辑')
      // configInfo({ id: row.id }).then((res) => {
      //   if (res.result.resultCode === '0') {
      //     this.rowData = res.entity;
      //     setTimeout(() => {
            this.addVisible = true;
            this.addTitle = '修改配置';
      //     }, 200);
      //   } else {
      //     this.$message.error(res.result.resultMessage);
      //   }
      // });
    } else if (key === 'able') {
      console.log('开启')
      // configDelete({ id: row.id }).then((res) => {
      //   if (res.result.resultCode === '0') {
      //     FromTable.reloadTable('delete');
      //     this.$message.success(res.result.resultMessage);
      //   } else {
      //     this.$message.error(res.result.resultMessage);
      //   }
      // });
    } else if (key === 'forbid') {
      console.log('禁用')
    } else if (key === 'log') {
      console.log('日志')
      this.checkLogData = row;
      this.checkLogVisible = true;
      this.clickTime = utils.getNowTime();
    }
  }

  // 点击操作时的时间
  clickTime: string = '';

  addModel() {
    this.addVisible = true;
    this.addTitle = '添加配置';
  }

  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    const addBlock: any = this.$refs.addTable;
    this.checkLogVisible = false;
    setTimeout(() => {
      // addBlock.resetData();
    }, 200);
  }

  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, `配置列表${utils.returnNowTime()}`, '/vehicle/config/exportExcel');
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
          on-addBack={this.addModel}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          export-btn={this.showExportBtn}
          on-downBack={this.downLoad}
          on-menuClick={this.menuClick}
        />
        <add-model
          ref="addTable"
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
