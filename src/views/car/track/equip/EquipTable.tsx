import { Component, Vue } from 'vue-property-decorator';
import { tableList, Opreat, FilterFormList } from '@/interface';
import { Button, Tabs, TabPane, Tag } from 'element-ui';
import DeployModel from './components/deployModel';
import ReverseModel from './components/reverseModel';
import './EquipTable.less';

@Component({
  components: {
  'el-button': Button,
  'el-tabs': Tabs,
  'el-tab-pane': TabPane,
  'el-tag': Tag,
  'deploy-model': DeployModel,
  'reverse-model': ReverseModel,
  }
  })
export default class Equipment extends Vue {
  // 表格参数
  filterList: FilterFormList[] = [
    {
      key: 'isactive',
      type: 'select',
      label: '状态',
      placeholder: '请选择型号',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: 'imei',
      placeholder: '请输入imei号',
    },
  ];
  tableList: tableList[] = [
    {
      label: 'imei号',
      prop: 'shopName',
    },
    {
      label: '型号',
      prop: 'name',
    },
    {
      label: '启动时间',
      prop: 'areaValue',
    },
    {
      label: '启动时长',
      prop: 'address',
    },
    {
      label: '上报频率',
      prop: 'alarmType',
    },
    {
      label: '追踪时间',
      prop: 'remark',
    },
    {
      label: '生效时间',
      prop: 'remark',
    },
    {
      label: '追踪时长',
      prop: 'remark',
    },
    {
      label: '追踪频率',
      prop: 'remark',
    },
    {
      label: '剩余电量',
      prop: 'remark',
    },
    {
      label: '状态',
      prop: 'isactive',
      formatter: this.formatStatus,
    },
  ];
  opreat: Opreat[] = [
    {
      key: 'deploy',
      rowKey: 'id',
      color: 'blue',
      text: '配置',
      roles: true,
    },
    {
      key: 'reserve',
      rowKey: 'id',
      color: 'green',
      text: '预约',
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

  deployVisible: boolean = false;
  reverseVisible: boolean = false;

  // 格式化状态
  formatStatus(row: any) {
    let type;
    switch (row.status) {
      case 0:
        type = <el-tag size="small" type="success">未预约</el-tag>;
        break;
      case 1:
        type = <el-tag size="small" type="danger">已预约</el-tag>;
        break;
      case 2:
        type = <el-tag size="small" type="danger">追踪中</el-tag>;
        break;
      default:
        break;
    }
    return type;
  }

  currentChange = (val: any) => {

  }

  menuClick(key: string, row: any) {
    if (key === 'deploy') {
      this.deployVisible = true;
    } else if (key === 'reserve') {
      this.reverseVisible = true;
    }
  }

  // 关闭弹窗
  closeModal(): void {
    this.deployVisible = false;
    this.reverseVisible = false;
  }
  // 关闭后刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
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
        <deploy-model
          visible={this.deployVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></deploy-model>
        <reverse-model
          visible={this.reverseVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></reverse-model>
      </div>
    );
  }
}
