import { Component, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import { seriesDelete, seriesInfo, brandAll } from '@/api/model';
import AddModel from './components/Addmodel';
@Component({
  components: {
  'el-tag': Tag,
  'add-model': AddModel,
  }
  })
export default class Model extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'brandId',
      type: 'select',
      label: '品牌',
      placeholder: '请选择品牌车系',
      options: [],
      itemChange: this.brandLoad,
    },
    {
      key: 'keyword',
      type: 'input',
      label: '车型名称',
      placeholder: '请输入车型名称',
    },
  ];
  // 高级筛选
  filterGrade: FilterFormList[] = [];
  // 筛选参数
  filterParams: any = {
    brandId: '',
    keyword: '',
  };
  outParams: any = {};
  // 请求地址
  url: string = '/vehicle/model/list';

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
    { label: '品牌名称', prop: 'brandName', formatter: (row: any) => (row.brandName ? row.brandName : '--') },
    { label: '车系名称', prop: 'seriesName', formatter: (row: any) => (row.seriesName ? row.seriesName : '--') },
    { label: '车型名称', prop: 'name', formatter: (row: any) => (row.name ? row.name : '--') },
    { label: '能源类型', prop: 'energyType', formatter: (row: any) => (row.energyType ? row.energyType : '--') },
    { label: '油箱容量', prop: 'fuelTankCap', formatter: (row: any) => (row.fuelTankCap ? row.fuelTankCap : '--') },
    { label: '车辆数量', prop: 'vehicleNum', formatter: (row: any) => (row.vehicleNum ? row.vehicleNum : '--') },
  ];

  // 新增、编辑
  addVisible: boolean = false;
  addTitle: string = '';

  rowData: any = {};

  created() {
    brandAll(null).then((res) => {
      console.log(res);
    });
  }

  brandLoad(val: any) {
    console.log(val);
  }

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      // configInfo({ id: row.id }).then((res) => {
      //   this.rowData = res.entity;
      // });
      // setTimeout(() => {
      //   this.addVisible = true;
      //   this.addTitle = '编辑车系';
      // }, 200);
      console.log('编辑');
    } else if (key === 'delete') {
      console.log('删除');
      // configDelete({ id: row.id }).then((res) => {
      //   if (res.result.resultCode === '0') {
      //     FromTable.reloadTable();
      //     this.$message.success(res.result.resultMessage);
      //   } else {
      //     this.$message.error(res.result.resultMessage);
      //   }
      // });
    }
  }
  addModel() {
    this.addVisible = true;
    this.addTitle = '新增车系';
  }

  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
  }
  // 关闭弹窗时刷新
  refresh(): void {
    this.closeModal();
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
          dataType={'JSON'}
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
