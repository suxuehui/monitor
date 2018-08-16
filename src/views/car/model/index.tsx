import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import { getCustomerList } from '@/api/customer';
import { vehicleModelEnable } from '@/api/car';

interface ActiveType { key: any, value: any, label: string }

@Component({
  components: {
  'el-tag': Tag,
  }
  })
export default class Member extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'shopName',
      type: 'select',
      label: '商户',
      placeholder: '请选择所属商户',
      options: [],
    },
    {
      key: 'status',
      type: 'select',
      label: '状态',
      placeholder: '请选择状态',
      options: [],
    },
    {
      key: 'confName',
      type: 'input',
      label: '配置文件名',
      placeholder: '请输入配置文件名',
    },
  ];
  // 高级筛选
  filterGrade: FilterFormList[] = [];
  // 筛选参数
  filterParams: any = {
    shopName: '',
    status: '',
    confName: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/vehicle/model/list';

  opreat: Opreat[] = [
    {
      key: 'edit',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'freeze',
      color: (row: any) => (row.status ? 'red' : 'green'),
      text: (row: any) => (row.status ? '禁用' : '启用'),
      msg: (row: any) => (row.status ? '是否要禁用？' : '是否要启用？'),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'shopName' },
    { label: '配置文件名', prop: 'confName' },
    { label: '配置版本', prop: 'confVersion' },
    { label: '主机版本', prop: 'hostVersion' },
    { label: '硬件版本', prop: 'hardwareVersion' },
    { label: '协议', prop: 'protocol' },
    { label: '品牌', prop: 'brandName' },
    { label: '车型', prop: 'modelName' },
    { label: '能源类型', prop: 'energyType' },
    {
      label: '油箱容量',
      prop: 'oilVolume',
      formatter(row: any) {
        return `${row.oilVolume} L`;
      },
    },
    { label: '状态', prop: 'status', formatter: this.statusDom },
  ];

  statusDom(row: any) {
    const type = row.status ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.status ? '已启用' : '未启用'}</el-tag>;
  }

  activeTypes: ActiveType[] = [
    { key: null, value: null, label: '状态(全部)' },
    { key: true, value: true, label: '已启用' },
    { key: false, value: false, label: '未启用' },
  ]

  mounted() {
    this.filterList[1].options = this.activeTypes;
    getCustomerList(null).then((res) => {
      res.entity.data.forEach((element: any) => {
        element.key = element.orgName;
        element.value = element.id;
        element.label = element.orgName;
      });
      this.filterList[0].options = res.entity.data;
    });
  }

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
    if (key === 'freeze') {
      vehicleModelEnable({ id: row.id }).then((res) => {
        if (res.result.resultCode) {
          FromTable.reloadTable();
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'edit') {
      this.$router.push({ name: '详情配置', query: { id: row.id } });
    }
  }
  addModel() {
    this.$router.push({ name: '详情配置' });
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
          export-btn={true}
          on-menuClick={this.menuClick}
        />
      </div>
    );
  }
}
