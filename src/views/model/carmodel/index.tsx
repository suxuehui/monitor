import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import qs from 'qs';
import { exportExcel } from '@/api/export';
import { modelInfo, modelDelete, brandAll, seriesAll } from '@/api/model';
import AddModel from './components/Addmodel';
@Component({
  components: {
  'el-tag': Tag,
  'add-model': AddModel,
  }
  })
export default class CarModel extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'brandGroup',
      type: 'cascader',
      label: '品牌',
      placeholder: '请选择品牌车系',
      options: [],
      props: {},
      change: this.brandLoad,
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
    brandGroup: [],
    keyword: '',
  };
  outParams: any = {
    brandId: '',
    seriesId: '',
  };
  // 请求地址
  url: string = '/vehicle/model/list';

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
      disabled: (row: any) => (row.vehicleNum),
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '品牌名称', prop: 'brandName', formatter: (row: any) => (row.brandName ? row.brandName : '--') },
    { label: '车系名称', prop: 'seriesName', formatter: (row: any) => (row.seriesName ? row.seriesName : '--') },
    { label: '车型名称', prop: 'name' },
    { label: '能源类型', prop: 'energyType', formatter: (row: any) => (row.energyType ? row.energyType : '--') },
    { label: '油箱容量', prop: 'fuelTankCap', formatter: this.checkFuelTank },
    { label: '车辆数量', prop: 'vehicleNum', formatter: (row: any) => (row.vehicleNum ? `${row.vehicleNum}辆` : '--') },
  ];

  props: any = {
    value: 'value',
    children: 'name',
  }

  checkFuelTank(row: any) {
    let str: any = '';
    if (row.energyType === '电动') {
      str = '--';
    } else {
      str = `${row.fuelTankCap}L`;
    }
    return str;
  }

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/vehicle/model/add',
      '/vehicle/model/info',
      '/vehicle/model/edit',
      '/vehicle/model/delete',
      '/vehicle/model/exportExcel',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.opreat[0].roles = !!(res[1] && res[2]);
      this.opreat[1].roles = !!(res[3]);
      this.addBtn = !!(res[0]);
      this.exportBtn = !!(res[4]);
    });
  }

  // 新增、导出按钮展示
  addBtn: boolean = true;
  exportBtn: boolean = true

  // 新增、编辑
  addVisible: boolean = false;
  addTitle: string = '';

  rowData: any = {};

  brandList: any = [];
  brandAddList: any = [];

  mounted() {
    brandAll(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.map((item: any, index: number) => {
          this.brandList.push({
            label: item.name,
            name: [],
            value: item.id,
          });
          return true;
        });
        this.filterList[0].props = this.props;
        this.filterList[0].options = this.brandList;
        this.brandAddList = this.brandList.filter((item: any) => item);
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  brandLoad(val: any) {
    this.outParams = {
      brandId: val[0],
      seriesId: val[1] ? val[1] : null,
    };
    const obj = {
      brandId: val[0],
    };
    seriesAll(obj).then((res) => {
      if (res.result.resultCode === '0') {
        this.brandList.map((item: any, index: number) => {
          if (val[0] === item.value) {
            setTimeout(() => {
              this.brandList[index].name = [];
              res.entity.map((items: any) => {
                this.brandList[index].name.push({
                  label: items.name,
                  value: items.id,
                });
                return true;
              });
            }, 200);
          }
          return true;
        });
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      modelInfo({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          this.rowData = res.entity;
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
      setTimeout(() => {
        this.addVisible = true;
        this.addTitle = '编辑车型';
      }, 300);
    } else if (key === 'delete') {
      modelDelete({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          FromTable.reloadTable(key);
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    }
  }
  addModel() {
    this.addVisible = true;
    this.addTitle = '新增车型';
  }

  clear() {
    this.outParams = {};
  }

  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    const addBlock: any = this.$refs.addTable;
    this.rowData = {};
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
    exportExcel(data1, '车型列表', '/vehicle/model/exportExcel');
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
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          dataType={'JSON'}
          localName={'carmodel'}
          export-btn={this.exportBtn}
          on-downBack={this.downLoad}
          on-menuClick={this.menuClick}
          on-clearOutParams={this.clear}
        />
        <add-model
          ref="addTable"
          brandAddList={this.brandAddList}
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
