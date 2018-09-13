import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import { getCustomerList } from '@/api/customer';
import HandleModel from '@/views/message/alarm/components/HandleModel';
import CheckModel from '@/views/message/alarm/components/CheckModel';
import './index.less';

interface ActiveType { key: any, value: any, label: string }

@Component({
  components: {
  'el-tag': Tag,
  'handle-model': HandleModel,
  'check-model': CheckModel,
  }
  })
export default class Alarm extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'shopName',
      type: 'select',
      label: '商户',
      placeholder: '请选择商户',
      options: [],
    },
    {
      key: 'alarmType',
      type: 'select',
      label: '告警类型',
      placeholder: '请选择告警类型',
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
      key: 'query',
      type: 'datetimerange',
      label: '角色名称',
      placeholder: ['开始', '结束'],
      value: ['queryStartTime', 'queryEndTime'],
    },
  ];
  // 高级筛选
  filterGrade: FilterFormList[] = [];
  // 筛选参数
  filterParams: any = {
    status: '',
    queryStartTime: '',
    queryEndTime: '',
    alarmType: '',
    shopName: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/msg/alarm/list';

  opreat: Opreat[] = [
    {
      key: 'handle',
      rowKey: 'id',
      color: 'blue',
      text: (row: any) => (row.status ? '查看' : '处理'),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName' },
    { label: '车牌号', prop: 'plateNum' },
    { label: '车架号', prop: 'vin' },
    { label: '告警类型', prop: 'alarmTypeName' },
    { label: '告警时间', prop: 'msgTime' },
    { label: '告警内容', prop: 'content' },
    { label: '地点', prop: 'address', formatter: this.checkLoc },
    { label: '状态', prop: 'status', formatter: this.statusDom },
  ];

  checkLoc(row: any) {
    return <i class="iconfont iconfont-location" on-click={() => { this.checkMapLoc(row); }} ></i>;
  }

  statusDom(row: any) {
    const type = row.status ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.status ? '已处理' : '未处理'}</el-tag>;
  }
  checkMapLoc(row: any) {
    this.$router.push({ name: '告警地点', query: { lng: row.lng, lat: row.lat } });
  }

  activeTypes: ActiveType[] = [
    { key: null, value: null, label: '状态(全部)' },
    { key: true, value: true, label: '已处理' },
    { key: false, value: false, label: '未处理' },
  ]

  mounted() {
    this.filterList[2].options = this.activeTypes;
    getCustomerList(null).then((res) => {
      console.log(res);
      res.entity.data.forEach((element: any) => {
        element.key = element.orgName;
        element.value = element.id;
        element.label = element.orgName;
      });
      this.filterList[0].options = res.entity.data;
    });
  }

  modelForm: any = {};
  checkData: any = {}
  // 处理
  handleVisible: boolean = false;
  // 查看
  checkVisible: boolean = false;

  // 操作
  menuClick(key: string, row: any) {
    if (row.status) {
      this.checkData = row;
      this.checkVisible = true;
      console.log(row);
    } else {
      this.modelForm = row;
      this.handleVisible = true;
    }
  }
  // 关闭弹窗
  closeModal(): void {
    this.handleVisible = false;
    this.checkVisible = false;
  }

  // 关闭弹窗时刷新
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
          add-btn={false}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          localName={'alarm'}
          url={this.url}
          dataType={'JSON'}
          opreatWidth='180px'
          export-btn={true}
          on-menuClick={this.menuClick}
        />
        <handle-model
          visible={this.handleVisible}
          data={this.modelForm}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></handle-model>
        <check-model
          visible={this.checkVisible}
          data={this.checkData}
          on-close={this.closeModal}
        ></check-model>
      </div>
    );
  }
}
