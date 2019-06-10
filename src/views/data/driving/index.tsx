import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag } from 'element-ui';
import exportExcel from '@/api/export';
import { orgTree } from '@/api/app';
import utils from '@/utils';
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
      key: 'levelCode',
      type: 'levelcode',
      label: '所属商户',
      filterable: true,
      props: {
        value: 'levelCode',
        children: 'children',
        label: 'orgName',
      },
      placeholder: '所属商户(全部)',
      options: [],
    },
    {
      key: 'query',
      type: 'daterange',
      label: '告警时间',
      placeholder: ['开始', '结束'],
      change: this.dateChange,
      pickerOptions: {
        disabledDate(time: any) {
          return time.getTime() > Date.now();
        },
      },
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
    levelCode: '',
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
    { label: '车牌号', prop: 'plateNum' },
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
      prop: 'drivingMileage',
      sortable: true,
      sortBy: 'drivingMileage',
      formatter(row: any) {
        return `${row.drivingMileage} km`;
      },
    },
    {
      label: '行驶时间',
      prop: 'drivingMinute',
      sortable: true,
      sortBy: 'drivingMinute',
      formatter(row: any) {
        return `${row.drivingMinute} 分钟`;
      },
    },
    {
      label: '耗油量',
      prop: 'drivingOil',
      sortable: true,
      sortBy: 'drivingOil',
      formatter(row: any) {
        return `${row.drivingOil} L`;
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
      prop: 'sharpTurnCount',
      sortable: true,
      sortBy: 'sharpTurnCount',
      formatter(row: any) {
        return `${row.sharpTurnCount} 次`;
      },
    },
    {
      label: '超速',
      prop: 'overSpeed',
      sortable: true,
      sortBy: 'overSpeed',
      formatter(row: any) {
        return `${row.overSpeed} 次`;
      },
    },
    {
      label: '振动',
      prop: 'shockCount',
      sortable: true,
      sortBy: 'shockCount',
      formatter(row: any) {
        return `${row.shockCount} 次`;
      },
    },
    {
      label: '碰撞',
      prop: 'impactCount',
      sortable: true,
      sortBy: 'impactCount',
      formatter(row: any) {
        return `${row.impactCount} 次`;
      },
    },
    {
      label: '翻滚',
      prop: 'overTurn',
      sortable: true,
      sortBy: 'overTurn',
      formatter(row: any) {
        return `${row.overTurn} 次`;
      },
    },
  ];

  dateChange(val: any) {
    if (val) {
      if ((val[1].getTime() - val[0].getTime()) > 90 * 24 * 60 * 60 * 1000) {
        this.$message.error('查询时间不能超过3个月，请重新选择');
      } else {
        this.outParams.startTime = val[0].Format('yyyy-MM-dd');
        this.outParams.endTime = val[1].Format('yyyy-MM-dd');
      }
    } else {
      this.clear();
    }
  }

  clear() {
    this.outParams = {
      startTime: '',
      endTime: '',
    };
  }

  clearOut(callBack: Function) {
    const newParams = JSON.parse(JSON.stringify(this.filterParams));
    const date = new Date();
    const startTime = new Date(date.getTime());
    newParams.query[0] = new Date(startTime);
    newParams.query[1] = date;
    callBack(newParams);
    this.outParams.startTime = new Date(startTime).Format('yyyy-MM-dd');
    this.outParams.endTime = date.Format('yyyy-MM-dd');
  }

  created() {
    const getNowRoles: string[] = [
      // 操作
      '/statistics/driving/exportExcel', // 导出
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.exportBtn = !!(res[0]); // 导出
    });
    this.setDays();
  }

  mounted() {
    // 门店
    orgTree(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.unshift({
          id: Math.random(),
          levelCode: '',
          orgName: '所属商户(全部)',
        });
        this.filterList[0].options = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  setDays() {
    // 当天
    const date = new Date();
    this.filterParams.query[0] = date;
    this.filterParams.query[1] = date;
    this.outParams.startTime = date.Format('yyyy-MM-dd');
    this.outParams.endTime = date.Format('yyyy-MM-dd');
  }

  exportBtn: boolean = false;

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, `数据统计列表${utils.returnNowTime()}`, '/statistics/driving/exportExcel');
  }

  render(h: any) {
    return (
      <div class="fzk-driving-wrap">
        <filter-table
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          dataType={'JSON'}
          isResetChange={true}
          on-clearOutParams={this.clearOut}
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
