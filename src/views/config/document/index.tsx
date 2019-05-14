import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag } from 'element-ui';
import { configDelete, configInfo } from '@/api/config';
import exportExcel from '@/api/export';
import AddModel from './components/Addmodel';
import utils from '@/utils';
@Component({
  components: {
    'el-tag': Tag,
    'add-model': AddModel,
  },
  name: 'DeviceModel',
})
export default class DeviceModel extends Vue {
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
      key: 'delete',
      rowKey: 'productCode',
      color: (row: any) => (row.available === 1 ? 'red' : 'red'),
      text: (row: any) => (row.available === 1 ? '删除' : '删除'),
      msg: (row: any) => (row.available === 1 ? '是否要删除？' : '是否要删除？'),
      roles: true,
    },
  ];

  // 表格参数
  tableList: tableList[] = [
    { label: '配置名称', prop: 'cfgName' },
    { label: '产品编码', prop: 'productCode' },
    { label: '配置描述', prop: 'remark' },
    { label: '是否重启', prop: 'reboot', formatter: this.statusDom },
  ];

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/vehicle/config/add', // 新增
      '/vehicle/config/update', // 编辑
      '/vehicle/config/delete', // 删除
      '/vehicle/config/exportExcel', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.showAddBtn = !!(res[0]);
      this.opreat[0].roles = !!(res[1]);
      this.opreat[1].roles = !!(res[2]);
      this.showExportBtn = !!(res[3]);
    });
  }

  // 新增、导出按钮展示
  showAddBtn: boolean = true;

  showExportBtn: boolean = true;

  statusDom(row: any) {
    if (row.reboot === 1) {
      return <el-tag size="medium" type="success">是</el-tag>;
    } if (row.reboot === 2) {
      return <el-tag size="medium" type="danger">否</el-tag>;
    }
    return <el-tag size="medium" type="info">未知</el-tag>;
  }

  // 新增、编辑
  addVisible: boolean = false;

  addTitle: string = '';

  rowData: any = {};

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      configInfo({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          this.rowData = res.entity;
          setTimeout(() => {
            this.addVisible = true;
            this.addTitle = '修改配置';
          }, 200);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'delete') {
      configDelete({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          FromTable.reloadTable('delete');
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    }
  }

  addModel() {
    this.addVisible = true;
    this.addTitle = '新增配置';
  }

  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    const addBlock: any = this.$refs.addTable;
    setTimeout(() => {
      addBlock.resetData();
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
        ></add-model>
      </div>
    );
  }
}
