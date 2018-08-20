import { Component, Vue } from 'vue-property-decorator';
import { tableList, Opreat, FilterFormList, MapCarData } from '@/interface';
import { Button, Tabs, TabPane } from 'element-ui';

import './RecordTable.less';
@Component({
  components: {
  'el-button': Button,
  'el-tabs': Tabs,
  'el-tab-pane': TabPane
  }
  })
export default class Equipment extends Vue {
  // 表格参数
  filterList: FilterFormList[] = [];
  tableList: tableList[] = [
    {
      label: '车牌',
      prop: 'shopName',
    },
    {
      label: '时间',
      prop: 'name',
    },
    {
      label: '地点',
      prop: 'areaValue',
    },
    {
      label: '上报类型',
      prop: 'address',
    },
    {
      label: '型号',
      prop: 'alarmType',
    },
    {
      label: 'imei号',
      prop: 'remark',
    },
  ];
  opreat: Opreat[] = [];
  filterParams: object = {
    areaValue: [],
    levelCode: '',
    alarmType: '',
    isactive: '',
    keyword: '',
  };
  backParams: object = {
    code: 'result.resultCode',
    codeOK: '0',
    message: 'result.resultMessage',
    data: 'entity.data',
    total: 'entity.count',
  };
  tableUrl: string = '/fence/list'; // 表格请求地址
  outParams: any = {}

  currentChange = (val: any) => {

  }

  menuClick(key: string, row: any) {

  }
  render() {
    return (
      <div class="container">
        <filter-table
          ref="table"
          class="map-table"
          filter-list={this.filterList}
          filter-grade={[]}
          filter-params={this.filterParams}
          back-params={this.backParams}
          add-btn={false}
          export-btn={true}
          highlight-current-row={true}
          on-currentChange={this.currentChange}
          on-menuClick={this.menuClick}
          table-list={this.tableList}
          url={this.tableUrl}
          dataType={'JSON'}
          opreat={this.opreat}
          out-params={this.outParams}
          opreat-width="150px"
        >
        </filter-table>
      </div>
    );
  }
}
