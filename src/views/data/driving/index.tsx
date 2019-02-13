import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag } from 'element-ui';
import { exportExcel } from '@/api/export';
import { orgTree } from '@/api/app';
import './index.less';

@Component({
  components: {
    'el-tag': Tag,
  },
  name: 'Driving',
})
export default class Driving extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'levelcode',
      type: 'levelcode',
      label: '所属门店',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
      placeholder: '请选择所属门店',
      options: [],
    },
    {
      key: 'query',
      type: 'datetimerange',
      label: '告警时间',
      placeholder: ['开始', '结束'],
      change: this.dateChange,
    },
    {
      key: 'keyword',
      type: 'input',
      label: '角色名称',
      placeholder: '车牌号或车架号',
    },
  ];

  // 高级筛选
  filterGrade: FilterFormList[] = [];

  // 筛选参数
  filterParams: any = {
    levelcode: '',
    query: [null, null],
    keyword: '',
  };

  outParams: any = {
    startTime: '',
    endTime: '',
  };

  // 请求地址
  url: string = '/statistics/driving/list';

  opreat: Opreat[] = [];

  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName' },
    { label: '车牌号', prop: 'platenum' },
    { label: '车架号', prop: 'vin' },
    {
      label: '行驶次数',
      prop: 'drivingCount',
      sortable: true,
      sortBy: 'drivingCount',
      formatter(row: any) {
        return `${row.drivingCount} 次`;
      },
    },
    {
      label: '行驶里程',
      prop: 'mileageCount',
      sortable: true,
      sortBy: 'mileageCount',
      formatter(row: any) {
        return `${row.mileageCount} km`;
      },
    },
    {
      label: '行驶时间',
      prop: 'drivingTimeCount',
      sortable: true,
      sortBy: 'drivingTimeCount',
      formatter(row: any) {
        return `${row.drivingTimeCount} 分钟`;
      },
    },
    {
      label: '耗油量',
      prop: 'oilCount',
      sortable: true,
      sortBy: 'oilCount',
      formatter(row: any) {
        return `${row.oilCount} L`;
      },
    }, {
      label: '急加速',
      prop: 'speedUpCount',
      sortable: true,
      sortBy: 'speedUpCount',
      formatter(row: any) {
        return `${row.speedUpCount} 次`;
      },
    },
    {
      label: '急减速',
      prop: 'speedDownCount',
      sortable: true,
      sortBy: 'speedDownCount',
      formatter(row: any) {
        return `${row.speedDownCount} 次`;
      },
    },
    {
      label: '急转弯',
      prop: 'turnCount',
      sortable: true,
      sortBy: 'turnCount',
      formatter(row: any) {
        return `${row.turnCount} 次`;
      },
    },
    {
      label: '震动',
      prop: 'lightShakeCount',
      sortable: true,
      sortBy: 'lightShakeCount',
      formatter(row: any) {
        return `${row.lightShakeCount} 次`;
      },
    },
    {
      label: '碰撞',
      prop: 'heavyHitCount',
      sortable: true,
      sortBy: 'heavyHitCount',
      formatter(row: any) {
        return `${row.heavyHitCount} 次`;
      },
    },
    {
      label: '翻滚',
      prop: 'rollCount',
      sortable: true,
      sortBy: 'rollCount',
      formatter(row: any) {
        return `${row.rollCount} 次`;
      },
    },
  ];

  dateChange(val: any) {
    if (val) {
      if ((val[1].getTime() - val[0].getTime()) > 90 * 24 * 60 * 60 * 1000) {
        this.$message.error('查询时间不能超过90天');
      } else {
        this.outParams.startTime = val[0].Format('yyyy-MM-dd hh:mm:ss');
        this.outParams.endTime = val[1].Format('yyyy-MM-dd hh:mm:ss');
      }
    } else {
      this.clearOutParams();
    }
  }

  clearOutParams() {
    this.outParams = {
      startTime: '',
      endTime: '',
    };
  }

  clear() {
    this.setDays();
  }

  created() {
    // 门店
    orgTree(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.unshift({
          id: Math.random(),
          levelCode: '',
          orgName: '全部',
        });
        this.filterList[0].options = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    const getNowRoles: string[] = [
      // 操作
      '/statistics/driving/exportExcel',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.exportBtn = !!(res[0]);
    });
    this.setDays();
  }

  setDays() {
    // 三个月
    const date = new Date();
    const starTime = new Date(date.getTime() - (90 * 24 * 60 * 60 * 1000));
    this.filterParams.query[0] = new Date(starTime);
    this.filterParams.query[1] = date;
    this.outParams.startTime = new Date(starTime).Format('yyyy-MM-dd hh:mm:ss');
    this.outParams.endTime = date.Format('yyyy-MM-dd hh:mm:ss');
  }

  exportBtn:boolean = false;

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, '数据统计列表', '/statistics/driving/exportExcel');
  }

  render(h: any) {
    return (
      <div class="member-wrap">
        <filter-table
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          dataType={'JSON'}
          on-clearOutParams={this.clear}
          localName={'driving'}
          add-btn={false}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          export-btn={this.exportBtn}
          on-downBack={this.downLoad}
        />
      </div>
    );
  }
}
