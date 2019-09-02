import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import { Tag } from 'element-ui';
import qs from 'qs';
import exportExcel from '@/api/export';
import utils from '@/utils';
import {
  modelInfo, modelDelete, brandAll, seriesAll, allBrandList,
} from '@/api/model';
import AddModel from './components/Addmodel';
@Component({
  components: {
    'el-tag': Tag,
    'add-model': AddModel,
  },
  name: 'CarModel',
})
export default class CarModel extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'brandGroup',
      type: 'cascader',
      label: '品牌',
      placeholder: '品牌车系（全部）',
      options: [],
      props: {},
      filterable: true,
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

  operat: Opreat[] = [
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
    { label: '车型名称', prop: 'name' },
    { label: '车型描述', prop: 'description' },
    { label: '所属车系', prop: 'seriesName', formatter: (row: any) => (row.seriesName ? row.seriesName : '--') },
    { label: '所属品牌', prop: 'brandName', formatter: (row: any) => (row.brandName ? row.brandName : '--') },
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
      '/vehicle/model/edit',
      '/vehicle/model/delete',
      '/vehicle/model/exportExcel',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.operat[0].roles = !!(res[1]);
      this.operat[1].roles = !!(res[2]);
      this.addBtn = !!(res[0]);
      this.exportBtn = !!(res[3]);
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
        res.entity.forEach((item: any, index: number) => {
          this.brandList.push({
            label: item.name,
            name: [],
            value: item.id,
          });
        });
        this.getAllBrand();
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 获取品牌车系信息
  getAllBrand() {
    allBrandList(null).then((res) => {
      if (res.result.resultCode === '0') {
        // item 全部数据
        res.entity.forEach((item: any) => {
          // items 品牌数据
          this.brandList.forEach((items: any) => {
            if (item.id === items.value) {
              if (item.children && item.children.length > 0) {
                item.children.forEach((it: any) => {
                  items.name.push({
                    label: it.name,
                    value: it.id,
                  });
                });
              } else {
                delete items.name;
              }
            }
          });
        });
        this.brandList.unshift({
          id: '',
          label: '品牌车系（全部）',
        });
        this.filterList[0].props = this.props;
        this.filterList[0].options = this.brandList;
        this.brandList.forEach((item: any) => {
          if (item.name) {
            this.brandAddList.push(item);
          }
        });
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
  }

  carModelClickTime: string = '';

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      modelInfo({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          this.rowData = res.entity;
          this.rowData.id = row.id;
          this.carModelClickTime = utils.getNowTime();
          setTimeout(() => {
            this.addVisible = true;
            this.addTitle = '编辑车型';
          }, 20);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
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
    this.carModelClickTime = utils.getNowTime();
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
    }, 100);
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
          operat={this.operat}
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
          carModelTime={this.carModelClickTime}
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
