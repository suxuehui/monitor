import { Component, Vue } from 'vue-property-decorator';
import {
  FilterFormList, tableList, Opreat,
} from '@/interface';
import qs from 'qs';
import { Tag } from 'element-ui';

import exportExcel from '@/api/export';
import { orgTree, getDict } from '@/api/app';
import { getSolution } from '@/api/message';
import CoordTrasns from '@/utils/coordTrasns';
import utils from '@/utils';

import HandleModel from '@/views/message/alarm/components/HandleModel';
import CheckModel from '@/views/message/alarm/components/CheckModel';
import './index.less';

interface ActiveType { key: any, value: any, label: string }

@Component({
  components: {
    'el-tag': Tag,
    'handle-model': HandleModel,
    'check-model': CheckModel,
  },
  name: 'Alarm',
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
      key: 'query',
      type: 'datetimerange',
      label: '告警时间',
      placeholder: ['开始', '结束'],
      change: this.dateChange,
      pickerOptions: {
        disabledDate(time: any) {
          return time.getTime() > Date.now();
        },
      },
    },
  ];

  // 高级筛选
  filterGrade: FilterFormList[] = [
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
      key: 'plateNum',
      type: 'input',
      label: '车牌号',
      placeholder: '请输入车牌号',
    },
    {
      key: 'vin',
      type: 'input',
      label: '车架号',
      placeholder: '请输入车架号',
    },
    {
      key: 'query',
      type: 'datetimerange',
      label: '告警时间',
      placeholder: ['开始', '结束'],
      change: this.dateChange,
      pickerOptions: {
        disabledDate(time: any) {
          return time.getTime() > Date.now();
        },
      },
    },
  ];

  // 筛选参数
  filterParams: any = {
    levelcode: '',
    status: 'false',
    alarmType: '',
    shopName: '',
    plateNum: '',
    vin: '',
    query: [null, null],
  };

  outParams: any = {
    queryStartTime: '',
    queryEndTime: '',
  };

  // 请求地址
  url: string = '/message/alarm/list';

  opreat: Opreat[] = [
    {
      key: 'handle',
      rowKey: 'vin',
      color: (row: any) => (row.activeStatus === 2 ? 'green' : 'blue'),
      text: '处理',
      disabled: (row: any) => (!row.status === false),
      roles: true,
    },
    {
      key: 'check',
      rowKey: 'vin',
      color: 'blue',
      text: '查看',
      disabled: (row: any) => (row.status === false),
      roles: true,
    },
    {
      key: 'checkLoc',
      rowKey: 'vin',
      color: 'blue',
      text: '告警地点',
      roles: true,
    },
  ];

  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName' },
    { label: '车牌号', prop: 'plateNum' },
    { label: '车架号', prop: 'vin' },
    { label: '告警类型', prop: 'alarmTypeName' },
    {
      label: '告警时间',
      prop: 'formatMsgTime',
      sortable: true,
      sortBy: 'formatMsgTime',
    },
    { label: '告警内容', prop: 'content' },
    { label: '状态', prop: 'status', formatter: this.statusDom },
  ];

  dateChange(val: any) {
    if (val) {
      if ((val[1].getTime() - val[0].getTime()) > 7 * 24 * 60 * 60 * 1000) {
        this.$message.error('查询时间不能超过7天');
      } else {
        this.outParams.queryStartTime = val[0].Format('yyyy-MM-dd hh:mm:ss');
        this.outParams.queryEndTime = val[1].Format('yyyy-MM-dd hh:mm:ss');
      }
    } else {
      this.clear();
    }
  }

  clear() {
    this.outParams = {
      queryStartTime: '',
      queryEndTime: '',
    };
  }

  clearOut(callBack: Function) {
    const newParams = JSON.parse(JSON.stringify(this.filterParams));
    const date = new Date();
    const starTime = new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000));
    newParams.query[0] = new Date(starTime);
    newParams.query[1] = date;
    newParams.alarmType = '';
    callBack(newParams);
    this.outParams.queryStartTime = new Date(starTime).Format('yyyy-MM-dd hh:mm:ss');
    this.outParams.queryEndTime = date.Format('yyyy-MM-dd hh:mm:ss');
  }

  activated() {
    const table: any = this.$refs.table;
    if (table) {
      if (this.$route.params && this.$route.params.alarmType) {
        const newParams = JSON.parse(JSON.stringify(this.filterParams));
        newParams.alarmType = this.$route.params.alarmType;
        table.resetSearchFun(newParams);
      } else {
        table.reloadTable();
      }
    }
  }

  statusDom(row: any) {
    const type = row.status ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.status ? '已处理' : '未处理'}</el-tag>;
  }

  activeTypes: ActiveType[] = [
    { key: null, value: null, label: '状态(全部)' },
    { key: 'true', value: 'true', label: '已处理' },
    { key: 'false', value: 'false', label: '未处理' },
  ]

  alarmType: any = [];

  // 导出按钮展示
  showExportBtn: boolean = true;

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/message/alarm/handle', // 处理
      '/message/alarm/getSolution', // 处理结果
      '/message/alarm/exportExcel', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.opreat[0].roles = !!(res[0]); // 处理
      this.opreat[1].roles = !!(res[1]); // 处理结果
      this.showExportBtn = !!(res[2]); // 导出
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
        this.filterGrade[0].options = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    // 告警类型
    getDict({ type: 'Alarm.Type' }).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.map((item: any, index: number) => this.alarmType.push({
          key: index,
          value: item.enumValue,
          label: item.name,
        }));
        // 设备类型(全部)
        this.alarmType.unshift({
          key: Math.random(),
          value: '',
          label: '告警类型(全部)',
        });
        this.filterList[1].options = this.alarmType;
        this.filterGrade[1].options = this.alarmType;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    // 当前月份
    const date = new Date();
    const starTime = new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000));
    this.filterParams.query[0] = new Date(starTime);
    this.filterParams.query[1] = date;
    this.outParams.queryStartTime = new Date(starTime).Format('yyyy-MM-dd hh:mm:ss');
    this.outParams.queryEndTime = date.Format('yyyy-MM-dd hh:mm:ss');
    if (this.$route.params && this.$route.params.alarmType) {
      this.filterParams.alarmType = this.$route.params.alarmType;
    } else {
      const table: any = this.$refs.table;
      table && table.reloadTable();
    }
  }

  mounted() {
    // 处理状态
    this.filterList[2].options = this.activeTypes;
    this.filterGrade[2].options = this.activeTypes;
  }

  modelForm: any = {};

  checkData: any = {}

  // 处理
  handleVisible: boolean = false;

  // 查看
  checkVisible: boolean = false;

  // 操作
  menuClick(key: string, row: any) {
    if (key === 'handle') {
      this.modelForm = row;
      this.handleVisible = true;
    } else if (key === 'check') {
      getSolution({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          this.checkData = res.entity;
          this.checkVisible = true;
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'checkLoc') {
      this.checkMapLoc(row);
    }
  }

  checkMapLoc(row: any) {
    if (row.lat > 0) {
      const point: any = CoordTrasns.transToBaidu(
        {
          lat: row.lat,
          lng: row.lng,
        },
        row.coordinateSystem,
      );
      this.$router.push({ name: '告警地点', query: { lng: point.lng, lat: point.lat } });
    } else {
      this.$message.error('告警地点位置信息缺失');
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

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, `告警列表${utils.returnNowTime()}`, '/message/alarm/exportExcel');
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
          isResetChange={true}
          localName={'alarm'}
          url={this.url}
          dataType={'JSON'}
          opreatWidth='180px'
          export-btn={this.showExportBtn}
          on-downBack={this.downLoad}
          on-menuClick={this.menuClick}
          on-clearOutParams={this.clearOut}
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
