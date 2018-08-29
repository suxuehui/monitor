import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import { getCustomerList } from '@/api/customer';
import { configDelete, configInfo } from '@/api/config';
import AddModel from '@/views/equipment/model/components/Addmodel';

interface ActiveType { key: any, value: any, label: string }

@Component({
  components: {
  'el-tag': Tag,
  'add-model': AddModel,
  }
  })
export default class Member extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'keyWord',
      type: 'input',
      label: '配置文件名',
      placeholder: '配置名称、产品编码',
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
  url: string = '/monitor/vehicle/config/list';

  opreat: Opreat[] = [
    {
      key: 'edit',
      rowKey: 'id',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'delete',
      rowKey: 'id',
      color: (row: any) => (row.available === 1 ? 'red' : 'red'),
      text: (row: any) => (row.available === 1 ? '删除' : '删除'),
      msg: (row: any) => (row.available === 1 ? '是否要删除？' : '是否要删除？'),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '配置名称', prop: 'cfgName', formatter: (row: any) => (row.cfgName ? row.cfgName : '--') },
    { label: '产品编码', prop: 'productCode', formatter: (row: any) => (row.productCode ? row.productCode : '--') },
    { label: '配置描述', prop: 'remark', formatter: (row: any) => (row.remark ? row.remark : '--') },
    { label: '是否重启', prop: 'reboot', formatter: this.statusDom },
  ];

  statusDom(row: any) {
    if (row.reboot === 1) {
      return <el-tag size="medium" type="success">是</el-tag>;
    } else if (row.reboot === 0) {
      return <el-tag size="medium" type="danger">否</el-tag>;
    }
    return <el-tag size="medium" type="info">未知</el-tag>;
  }

  // 新增、编辑
  addVisible: boolean = false;
  addTitle: string = '';

  rowData: any = {};

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      configInfo({ id: row.id }).then((res) => {
        this.rowData = res.entity;
      });
      setTimeout(() => {
        this.addVisible = true;
        this.addTitle = '修改配置';
      }, 200);
    } else if (key === 'delete') {
      configDelete({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          FromTable.reloadTable();
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    }
  }
  addModel() {
    this.addVisible = true;
    this.addTitle = '新增配置';
  }

  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
  }
  // 关闭弹窗时刷新
  refresh(): void {
    this.addVisible = false;
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
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
        <add-model
          data={this.rowData}
          title={this.addTitle}
          visible={this.addVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></add-model>
      </div>
    );
  }
}
