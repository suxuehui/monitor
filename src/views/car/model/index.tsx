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
      key: 'available',
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
      key: 'freeze',
      rowKey: 'id',
      color: (row: any) => (row.available === 1 ? 'red' : 'green'),
      text: (row: any) => (row.available === 1 ? '禁用' : '启用'),
      msg: (row: any) => (row.available === 1 ? '是否要禁用？' : '是否要启用？'),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName', formatter: (row: any) => (row.orgName ? row.orgName : '--') },
    { label: '配置文件名', prop: 'cfgName', formatter: (row: any) => (row.cfgName ? row.cfgName : '--') },
    { label: '配置版本', prop: 'cfgVer', formatter: (row: any) => (row.cfgVer ? row.cfgVer : '--') },
    { label: '主机版本', prop: 'hostVer', formatter: (row: any) => (row.hostVer ? row.hostVer : '--') },
    { label: '硬件版本', prop: 'hardWareVer', formatter: (row: any) => (row.hardWareVer ? row.hardWareVer : '--') },
    { label: '协议', prop: 'protocolName', formatter: (row: any) => (row.protocolName ? row.protocolName : '--') },
    { label: '品牌', prop: 'brandName', formatter: (row: any) => (row.brandName ? row.brandName : '--') },
    { label: '车型', prop: 'modelName', formatter: (row: any) => (row.modelName ? row.modelName : '--') },
    { label: '能源类型', prop: 'energyType', formatter: (row: any) => (row.energyType ? row.energyType : '--') },
    {
      label: '油箱容量',
      prop: 'fuelTankCap ',
      formatter(row: any) {
        return `${row.fuelTankCap} L`;
      },
    },
    { label: '状态', prop: 'available ', formatter: this.statusDom },
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

  mounted() {
    this.filterList[1].options = this.activeTypes;
    // getCustomerList(null).then((res) => {
    //   console.log(res);
    // res.entity.data.forEach((element: any) => {
    //   element.key = element.orgName;
    //   element.value = element.id;
    //   element.label = element.orgName;
    // });
    // this.filterList[0].options = res.entity.data;
    // });
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
          // dataType={'JSON'}
          export-btn={true}
          on-menuClick={this.menuClick}
        />
      </div>
    );
  }
}
