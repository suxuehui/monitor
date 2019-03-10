import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag } from 'element-ui';
import { exportExcel } from '@/api/export';

@Component({
  components: {
    'el-tag': Tag,
  },
  name: 'ModelManage',
})
export default class ModelManage extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'online',
      type: 'select',
      label: '设备类型',
      placeholder: '请选择设备类型',
      options: [],
    },
    {
      key: 'online',
      type: 'select',
      label: '能力配置',
      placeholder: '请选择能力配置',
      options: [],
    },
    {
      key: 'keyWord',
      type: 'input',
      label: '型号名称',
      placeholder: '请输入型号名称',
    },
  ];

  // 高级筛选
  filterGrade: FilterFormList[] = [];

  // 筛选参数
  filterParams: any = {};

  outParams: any = {};

  // 请求地址
  url: string = '/vehicle/config/list';

  opreat: Opreat[] = [
    {
      key: 'clearConfig',
      rowKey: 'id',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'checkConfig',
      rowKey: 'id',
      color: 'red',
      text: '删除',
      roles: true,
    },
    {
      key: 'downConfig',
      rowKey: 'id',
      color: 'green',
      text: '配置能力',
      roles: true,
    },
  ];

  // 表格参数
  tableList: tableList[] = [
    { label: '型号名称', prop: 'cfgName' },
    { label: '设备类型', prop: 'productCode' },
    { label: '网络类型', prop: 'remark' },
    { label: '规则描述', prop: 'reboot' },
    { label: '能力配置', prop: 'reboot' },
    { label: '设备数量', prop: 'reboot' },
  ];

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/vehicle/config/add',
      '/vehicle/config/info',
      '/vehicle/config/update',
      '/vehicle/config/delete',
      '/vehicle/config/exportExcel',
    ];
    // this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
    //   this.opreat[0].roles = !!(res[1] && res[2]);
    //   this.opreat[1].roles = !!(res[3]);
    //   this.addBtn = !!(res[0]);
    //   this.exportBtn = !!(res[4]);
    // });
  }

  // 导出按钮展示
  exportBtn: boolean = true;

  // 新增按钮展示
  addBtn: boolean = true;

  rowData: any = {};

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
  }

  // 点击时间
  clickTime: string = '';

  // 关闭弹窗
  closeModal(): void {

  }

  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, '配置列表', '/vehicle/config/exportExcel');
  }

  render(h: any) {
    return (
      <div class="model-wrap">
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          add-btn={this.addBtn}
          opreatWidth={'180px'}
          localName={'model'}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          export-btn={this.exportBtn}
          on-downBack={this.downLoad}
          on-menuClick={this.menuClick}
        />
      </div>
    );
  }
}
