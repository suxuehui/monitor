import { Component, Vue } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface';
import qs from 'qs';
import { Tag, Tooltip } from 'element-ui';
import { brandDelete, brandInfo } from '@/api/model';
import exportExcel from '@/api/export';
import utils from '@/utils';
import AddModel from './components/Addmodel';

@Component({
  components: {
    'el-tag': Tag,
    'el-tooltip': Tooltip,
    'add-model': AddModel,
  },
  name: 'Brand',
})

export default class Brand extends Vue {
  // 当前页面权限
  nowArr: boolean[] = [];

  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'keyword',
      type: 'input',
      label: '品牌名称',
      placeholder: '请输入品牌名称',
    },
  ];

  // 高级筛选
  filterGrade: FilterFormList[] = [];

  // 筛选参数
  filterParams: any = {
    keyword: '',
  };

  outParams: any = {};

  // 请求地址
  url: string = '/vehicle/brand/list';

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
      disabled: (row: any) => (row.seriesNum > 0 || row.modelNum > 0 || row.vehicleNum > 0),
      roles: true,
    },
  ];

  // 表格参数
  tableList: tableList[] = [
    // { label: '品牌图标', prop: 'logo', formatter: this.showLogo },
    { label: '品牌名称', prop: 'name', formatter: (row: any) => (row.name ? row.name : '--') },
    { label: '品牌描述', prop: 'description' },
    { label: '车系数量', prop: 'seriesNum', formatter: (row: any) => (row.seriesNum ? row.seriesNum : '--') },
    { label: '车型数量', prop: 'modelNum', formatter: (row: any) => (row.modelNum ? row.modelNum : '--') },
    { label: '车辆数量', prop: 'vehicleNum', formatter: (row: any) => (row.vehicleNum ? `${row.vehicleNum}辆` : '--') },
  ];

  // 权限设置
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/vehicle/brand/add',
      '/vehicle/brand/edit',
      '/vehicle/brand/delete',
      '/vehicle/brand/exportExcel',
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

  exportBtn: boolean = true;

  // 新增、编辑
  addVisible: boolean = false;

  addTitle: string = '';

  rowData: any = {};

  showLogo(row: any) {
    return row.logo ? <img alt="品牌图片" style="width:60px;maxHeight:36px" src={row.logo} /> : '暂无图片';
  }

  clickTime: string = ''

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      brandInfo({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          this.rowData = res.entity;
          this.rowData.id = row.id;
          this.addVisible = true;
          this.addTitle = '编辑品牌';
          this.clickTime = utils.getNowTime();
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'delete') {
      brandDelete({ id: row.id }).then((res) => {
        if (res.result.resultCode === '0') {
          FromTable.reloadTable('delete');
          this.$message.success(res.result.resultMessage);
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    }
  }

  addModel() {
    this.addVisible = true;
    this.addTitle = '新增品牌';
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
    exportExcel(data1, `品牌列表${utils.returnNowTime()}`, '/vehicle/brand/exportExcel');
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
          localName={'brand'}
          on-addBack={this.addModel}
          operat={this.operat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          dataType={'JSON'}
          on-downBack={this.downLoad}
          export-btn={this.exportBtn}
          on-menuClick={this.menuClick}
        />
        <add-model
          time={this.clickTime}
          ref="addTable"
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
