import { Component, Vue } from 'vue-property-decorator';
import { tableList, Opreat, FilterFormList, MapCarData } from '@/interface';
import { Button, Tabs, TabPane } from 'element-ui';

import './EquipmentTable.less';
@Component({
  components: {
  'el-button': Button,
  'el-tabs': Tabs,
  'el-tab-pane': TabPane
  }
  })
export default class Equipment extends Vue {
  // 表格参数
  filterList: FilterFormList[] = [
    {
      key: 'levelcode',
      type: 'levelcode',
      label: '所属门店',
      placeholder: '请选择门店',
      options: [],
    },
    {
      key: 'areaValue',
      type: 'cascader',
      label: '所在地区',
      placeholder: '请选择所在地区',
      options: [],
    },
    {
      key: 'alarmType',
      type: 'select',
      label: '监控类型',
      placeholder: '请选择监控类型',
      options: [],
    },
    {
      key: 'isactive',
      type: 'select',
      label: '状态',
      placeholder: '请选择状态',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '围栏名称/围栏地址',
      placeholder: '围栏名称/围栏地址',
    },
  ];
  tableList: tableList[] = [
    {
      label: '所属商户',
      prop: 'shopName',
    },
    {
      label: '围栏名称',
      prop: 'name',
    },
    {
      label: '所在地区',
      prop: 'areaValue',
    },
    {
      label: '围栏地址',
      prop: 'address',
    },
    {
      label: '监控类型',
      prop: 'alarmType',
    },
    {
      label: '监控时段',
      prop: 'time',
      formatter(row: any) {
        return `每天${row.beginTime}~${row.endTime}`;
      },
    },
    {
      label: '备注',
      prop: 'remark',
    },
    {
      label: '状态',
      prop: 'isactive',
    },
  ];
  opreat: Opreat[] = [
    {
      key: 'edit',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'use',
      color: (row: any) => (row.isactive ? 'red' : 'green'),
      text: (row: any) => (row.isactive ? '关闭' : '启用'),
      msg: (row: any) => (row.isactive ? '是否要关闭？' : '是否要启用？'),
      roles: true,
    },
    {
      key: 'delete',
      color: (row: any) => (row.active ? 'green' : 'red'),
      text: (row: any) => (row.active ? '删除' : '删除'),
      msg: (row: any) => (row.active ? '是否要删除？' : '是否要删除？'),
      roles: true,
    },
  ];
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
