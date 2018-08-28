import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import { getCustomerList } from '@/api/customer';
import { vehicleModelEnable } from '@/api/car';
import AddModel from '@/views/equipment/model/components/Addmodel';

interface ActiveType { key: any, value: any, label: string }

@Component({
  components: {
  'el-tag': Tag,
  'add-model': AddModel,
  }
  })
export default class Member extends Vue {
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
  url: string = '/monitor/vehicle/model/list';

  opreat: Opreat[] = [
    {
      key: 'edit',
      rowKey: 'id',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'delete',
      rowKey: 'id',
      color: (row: any) => (row.available === 1 ? 'red' : 'red'),
      text: (row: any) => (row.available === 1 ? '删除' : '删除'),
      msg: (row: any) => (row.available === 1 ? '是否要删除？' : '是否要删除？'),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '配置名称', prop: 'cfgName', formatter: (row: any) => (row.cfgName ? row.cfgName : '--') },
    { label: '产品编码', prop: 'productCode', formatter: (row: any) => (row.productCode ? row.productCode : '--') },
    { label: '配置描述', prop: 'remark', formatter: (row: any) => (row.remark ? row.remark : '--') },
    { label: '是否重启', prop: 'reboot', formatter: (row: any) => (row.reboot ? row.reboot : '--') },
  ];

  statusDom(row: any) {
    const type = row.available ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.available ? '已启用' : '未启用'}</el-tag>;
  }

  activeTypes: ActiveType[] = [
    { key: null, value: null, label: '状态(全部)' },
    { key: 0, value: 0, label: '已启用' },
    { key: 1, value: 1, label: '未启用' },
  ]

  // 新增、编辑
  addVisible: boolean = false;
  addTitle: string = '';

  modelForm: any = {
    roleName: '',
    remark: '',
  };
  freezeData: any = {}

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      this.addVisible = true;
      this.addTitle = '修改配置';
    } else if (key === 'delete') {
      // this.$router.push({ name: '详情配置', query: { id: row.id } });
      console.log(1);
    }
  }
  addModel() {
    // this.$router.push({ name: '详情配置' });
    this.addVisible = true;
    this.addTitle = '新增配置';
  }

  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
  }
  // 关闭弹窗时刷新
  refresh(): void {
    this.addVisible = false;
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
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
          opreatWidth={'180px'}
          on-addBack={this.addModel}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          dataType={'JSON'}
          export-btn={true}
          on-menuClick={this.menuClick}
        />
        <add-model
          title={this.addTitle}
          visible={this.addVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></add-model>
      </div>
    );
  }
}
