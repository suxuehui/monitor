import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import { orgTree, getDict } from '@/api/app';
import { getSolution } from '@/api/message';
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
      key: 'levelcode',
      type: 'levelcode',
      label: '所属商户',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
      placeholder: '请选择所属商户',
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
    levelcode: '',
    status: '',
    queryStartTime: '',
    queryEndTime: '',
    alarmType: '',
    shopName: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/message/alarm/list';

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
    { label: '告警时间', prop: 'formatMsgTime' },
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

  alarmType: any = [];

  // 导出按钮展示
  exportBtn: boolean = true;

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/message/alarm/getSolution',
      '/message/alarm/handle',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      console.log(res);
      this.opreat[0].roles = !!(res[0] && res[1]);
    });
    // 门店搜索
    orgTree(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.unshift({
          id: Math.random(),
          levelcode: '',
          orgName: '全部',
        });
        this.filterList[0].options = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    // 告警类型
    getDict({ type: 'Alarm.Type' }).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.map((item: any) => this.alarmType.push({
          key: item.enumid,
          value: item.enumvalue,
          label: item.name,
        }));
        // 设备类型(全部)
        this.alarmType.unshift({
          key: Math.random(),
          value: '',
          label: '告警类型(全部)',
        });
        this.filterList[1].options = this.alarmType;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  mounted() {
    // 处理状态
    this.filterList[2].options = this.activeTypes;
  }

  modelForm: any = {};
  checkData: any = {}
  // 处理
  handleVisible: boolean = false;
  // 查看
  checkVisible: boolean = false;

  // 操作
  menuClick(key: string, row: any) {
    if (row.status === true) {
      getSolution({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          this.checkData = res.entity;
          this.checkVisible = true;
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else {
      this.modelForm = row;
      this.handleVisible = true;
    }
  }
  // 关闭弹窗
  closeModal(): void {
    this.checkData = '';
    this.checkVisible = false;
    this.modelForm = {};
    this.handleVisible = false;
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
          export-btn={this.exportBtn}
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
