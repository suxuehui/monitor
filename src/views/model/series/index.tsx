import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag } from 'element-ui';
import { exportExcel } from '@/api/export';
import { seriesDelete, seriesInfo, brandAll } from '@/api/model';
import AddModel from './components/Addmodel';

@Component({
  components: {
  'el-tag': Tag,
  'add-model': AddModel,
  },
  name:'Series'
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
      rowKey: 'name',
      color: 'blue',
      text: '编辑',
      roles: true,
    },
    {
      key: 'delete',
      rowKey: 'name',
      color: (row: any) => (row.available === 1 ? 'red' : 'red'),
      text: (row: any) => (row.available === 1 ? '删除' : '删除'),
      msg: (row: any) => (row.available === 1 ? '是否要删除？' : '是否要删除？'),
      disabled: (row: any) => (row.modelNum > 0 || row.vehicleNum > 0),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '品牌名称', prop: 'brandName', formatter: (row: any) => (row.brandName ? row.brandName : '--') },
    { label: '车系名称', prop: 'name', formatter: (row: any) => (row.name ? row.name : '--') },
    { label: '车系描述', prop: 'description' },
    { label: '车型数量', prop: 'modelNum', formatter: (row: any) => (row.modelNum ? row.modelNum : '--') },
    { label: '车辆数量', prop: 'vehicleNum', formatter: (row: any) => (row.vehicleNum ? `${row.vehicleNum}辆` : '--') },
  ];

  // 新增、导出按钮展示
  addBtn: boolean = true;
  exportBtn: boolean = true;

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/vehicle/series/add',
      '/vehicle/series/info',
      '/vehicle/series/edit',
      '/vehicle/series/delete',
      '/vehicle/series/exportExcel',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.opreat[0].roles = !!(res[1] && res[2]);
      this.opreat[1].roles = !!(res[3]);
      this.addBtn = !!(res[0]);
      this.exportBtn = !!(res[4]);
    });

    brandAll(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.map((item: any) => this.brandList.push({
          key: item.id,
          value: item.id,
          label: item.name,
        }));
      } else {
        this.$message.error(res.result.resultMessage);
      }
      this.brandAddList = this.brandList.filter((item: any) => item);
      // 所有品牌
      this.brandList.unshift({
        key: Math.random(),
        value: null,
        label: '所有品牌',
      });
      this.filterList[0].options = this.brandList;
    });
  }

  // 新增、编辑
  addVisible: boolean = false;
  addTitle: string = '';

  rowData: any = {};
  brandList: any = [];
  brandAddList: any = [];

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      seriesInfo({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          this.rowData = res.entity;
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
      setTimeout(() => {
        this.addVisible = true;
        this.addTitle = '编辑车系';
      }, 200);
    } else if (key === 'delete') {
      seriesDelete({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          this.$message.success(res.result.resultMessage);
          FromTable.reloadTable(key);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    }
  }
  addModel() {
    this.addVisible = true;
    this.addTitle = '新增车系';
  }

  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    this.rowData = {};
    const addBlock: any = this.$refs.addTable;
    setTimeout(() => {
      addBlock.resetData();
    }, 200);
  }
  // 关闭弹窗时刷新
  refresh(): void {
    this.closeModal();
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, '车系列表', '/vehicle/series/exportExcel');
  }

  render(h: any) {
    return (
      <div class="member-wrap">
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          add-btn={this.addBtn}
          opreatWidth={'180px'}
          on-addBack={this.addModel}
          localName={'series'}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          dataType={'JSON'}
          export-btn={this.exportBtn}
          on-downBack={this.downLoad}
          on-menuClick={this.menuClick}
        />
        <add-model
          ref="addTable"
          data={this.rowData}
          brandAddList={this.brandAddList}
          title={this.addTitle}
          visible={this.addVisible}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></add-model>
      </div>
    );
  }
}
