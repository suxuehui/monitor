import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import './index.less';

@Component({
  components: {
  'el-tag': Tag,
  }
  })
export default class Driving extends Vue {
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
      key: 'queryTime',
      type: 'datetimerange',
      label: '时间',
      placeholder: ['开始时间', '结束时间'],
      value: ['queryStartTime', 'queryEndTime'],
      options: [],
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
    shopName: '',
    queryStartTime: '',
    queryEndTime: '',
    keyword: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/driving/list';

  opreat: Opreat[] = [];
  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'shopName' },
    { label: '车牌号', prop: 'plateNum' },
    { label: '车架号', prop: 'vin' },
    {
      label: '行驶次数',
      prop: 'driveCount',
      sortable: true,
      sortBy: 'driveCount',
      formatter(row: any) {
        return `${row.driveCount} 次`;
      },
    },
    {
      label: '行驶里程',
      prop: 'mileageSum',
      sortable: true,
      sortBy: 'mileageSum',
      formatter(row: any) {
        return `${row.mileageSum} km`;
      },
    },
    {
      label: '行驶时间',
      prop: 'driveMinSum',
      sortable: true,
      sortBy: 'driveMinSum',
      formatter(row: any) {
        return `${row.mileageSum} 分钟`;
      },
    },
    {
      label: '耗油量',
      prop: 'oilSum',
      sortable: true,
      sortBy: 'oilSum',
      formatter(row: any) {
        return `${row.mileageSum} L`;
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
      label: '轻碰撞',
      prop: 'ligntHitCount',
      sortable: true,
      sortBy: 'ligntHitCount',
      formatter(row: any) {
        return `${row.ligntHitCount} 次`;
      },
    },
    {
      label: '重碰撞',
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

  render(h: any) {
    return (
      <div class="member-wrap">
        <filter-table
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          dataType={'JSON'}
          add-btn={false}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          export-btn={true}
        />
      </div>
    );
  }
}
