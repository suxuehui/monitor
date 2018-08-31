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
export default class Series extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'brandId',
      type: 'select',
      label: '品牌',
      placeholder: '请选择品牌',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '车系名称',
      placeholder: '请输入车系名称',
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
  url: string = '/vehicle/series/list';

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
    { label: '车系名称', prop: 'name', formatter: (row: any) => (row.name ? row.name : '--') },
    { label: '车系描述', prop: 'description', formatter: (row: any) => (row.description ? row.description : '--') },
    { label: '车型数量', prop: 'modelNum', formatter: (row: any) => (row.modelNum ? row.modelNum : '--') },
    { label: '车辆数量', prop: 'vehicleNum', formatter: (row: any) => (row.vehicleNum ? row.vehicleNum : '--') },
  ];

  // 新增、编辑
  addVisible: boolean = false;
  addTitle: string = '';

  rowData: any = {};
  brandList: any = [];

  created() {
    brandAll(null).then((res) => {
      res.entity.map((item: any) => this.brandList.push({
        key: item.id,
        value: item.id,
        label: item.name,
      }));
      // 所有品牌
      this.brandList.unshift({
        key: Math.random(),
        value: null,
        label: '所有品牌',
      });
      this.filterList[0].options = this.brandList;
    });
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
