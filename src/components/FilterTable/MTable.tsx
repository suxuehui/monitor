import { Component, Prop, Emit, Vue, Inject, Provide } from 'vue-property-decorator';
import { Table, TableColumn, Pagination, Tag, Dropdown, DropdownItem, DropdownMenu } from 'element-ui';
import { tableList, Opreat, Directives } from '@/interface';
import request from '@/utils/request';
import Popconfirm from '@/components/Popconfirm';
import Spin from '@/components/Spin';
import './MTable.less';

@Component({
  components: {
  'el-table': Table,
  'el-table-column': TableColumn,
  'pop-confirm': Popconfirm,
  'el-pagination': Pagination,
  'm-spin': Spin,
  'el-dropdown': Dropdown,
  'el-dropdown-item': DropdownItem,
  'el-dropdown-menu': DropdownMenu,
  }
  })
export default class MTable extends Vue {
  @Prop() private tableList!: tableList[];
  @Prop() private url!: string;
  @Prop() private dataType!: string;
  @Prop({
    default: () => ({
      code: 'result.resultCode',
      codeOK: '0',
      message: 'result.resultMessage',
      data: 'entity.data',
      total: 'entity.count',
    }),
  }) private BackParams!: {
    code: string,
    message: string,
    data: string,
    codeOK: string | number,
    total: string
  };
  // 行ID
  @Prop({ default: 'id' }) private rowKey!: string;
  // 操作栏数据
  @Prop({ default: () => [] }) private opreat!: Opreat[];
  // 操作栏width
  @Prop({ default: '100px' }) private opreatWidth!: string;
  // 本地存储名称
  @Prop({ default: 'filter-table' }) private localName!: string;
  // 请求报错回调
  @Prop() private fetchError!: Function;
  // 表格列数据
  @Prop() private tableParams!: any;
  // 外部参数
  @Prop() private outParams!: any;
  // 请求类型
  @Prop({ default: 'post' }) private fetchType!: string;
  // 表格分页大小参数
  @Prop({ default: () => [5, 10, 15, 20, 50, 100] }) private pageSizeList!: number[];

  @Prop({ default: 10 }) private defaultPageSize!: number;

  @Prop() private highlightCurrentRow!: boolean;
  // data
  tableData: any = [];
  pageParams: {
    pageSize: number,
    pageNum: number,
    page: boolean,
  } = {
    pageSize: this.defaultPageSize,
    pageNum: 1,
    page: true,
  };
  loading: boolean = false;
  // 数据总数
  dataTotal: number = 0;
  created() {
    this.getData();
  }

  reload() {
    this.getData();
  }

  clearPageParams() {
    this.pageParams.pageNum = 1;
  }

  getData() {
    this.loading = true;
    request({
      url: this.url,
      method: this.fetchType,
      fetchType: this.dataType,
      data: Object.assign(this.tableParams, this.pageParams, this.outParams),
    }).then((res) => {
      this.loading = false;
      const code = this.getValue(this.BackParams.code, res);
      if (code === this.BackParams.codeOK) {
        if (!res.entity) {
          this.tableData = [];
          this.dataTotal = 0;
        } else {
          this.tableData = this.getValue(this.BackParams.data, res);
          this.dataTotal = this.getValue(this.BackParams.total, res);
        }
      } else {
        this.$message.error(this.getValue(this.BackParams.message, res));
      }
    });
  }
  getValue(position: string, data: any) {
    const keyList = position.split('.');
    keyList.forEach((item) => {
      if (data[item]) {
        data = data[item];
      } else {
        data = null;
        return false;
      }
      return true;
    });
    return data;
  }
  // 选择变化
  selectChange(val: any) {
    this.$emit('selectChange', val);
  }
  // 单选
  currentChange(val: any) {
    this.$emit('currentChange', val);
  }

  render() {
    return (
      <div class="m-table" >
        <m-spin show={this.loading} />
        <el-table
          data={this.tableData}
          on-current-change={this.currentChange}
          on-selection-change={this.selectChange}
          highlightCurrentRow={this.highlightCurrentRow}>
          {
            this.tableList.map((item, index) => {
              if (!item.formatter) {
                item.formatter = (row: any) => (row[item.prop] !== null ? row[item.prop] : '--');
              }
              return <el-table-column
                key={index} {...{ props: item }}>
              </el-table-column>;
            })
          }
          {
            this.opreat.length ? <el-table-column width={this.opreatWidth} label="操作" formatter={this.opreatJSX}></el-table-column> : null
          }
        </el-table>
        <el-pagination
          class="pagination"
          on-size-change={this.handleSizeChange}
          on-current-change={this.handleCurrentChange}
          current-page={this.pageParams.pageNum}
          page-sizes={this.pageSizeList}
          page-size={this.pageParams.pageSize}
          layout="total, sizes, prev, pager, next, jumper"
          total={this.dataTotal}>
        </el-pagination>
      </div>
    );
  }

  opreatJSX(row: any, column: string, cellValue: any, index: number) {
    if (this.opreat.length > 4) {
      return <el-dropdown on-command={(command: string) => this.menuClick(command, row)}>
        <span class="el-dropdown-link">
          下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          {
            this.opreat.map((item, indexs) => <el-dropdown-item
              key={indexs}
              command={item.key}
              disabled={item.disabled && item.disabled(row)}
            >
              {typeof item.text === 'function' ? item.text(row) : item.text}
            </el-dropdown-item>)
          }
        </el-dropdown-menu>
      </el-dropdown>;
    }
    return <div class="table-opreat">
      {
        this.opreat.map((item, indexs) => {
          const whiteList = ['red', 'orange'];
          if (item.disabled && item.disabled(row)) {
            return <a id={`${item.key}-${row[item.rowKey]}`} key={indexs} class="btn disabled">
              {typeof item.text === 'function' ? item.text(row) : item.text}
            </a>;
          } else if (typeof item.color === 'function'
            && whiteList.indexOf(typeof item.color === 'function' ? item.color(row) : item.color) >= 0) {
            return <pop-confirm
              on-confirm={() => this.menuClick(item.key, row)}
              title={typeof item.msg === 'function' ? item.msg(row) : item.msg}>
              <a id={`${item.key}-${row[item.rowKey]}`} key={indexs} class={`link-${typeof item.color === 'function' ? item.color(row) : item.color}`}>
                {typeof item.text === 'function' ? item.text(row) : item.text}
              </a>
            </pop-confirm>;
          }
          return <a id={`${item.key}-${row[item.rowKey]}`} class={`link-${typeof item.color === 'function' ? item.color(row) : item.color}`} key={indexs} on-click={() => this.menuClick(item.key, row)}>{typeof item.text === 'function' ? item.text(row) : item.text}</a>;
        })
      }
    </div>;
  }

  handleSizeChange(val: number) {
    this.pageParams.pageSize = val;
    this.getData();
  }

  handleCurrentChange(val: number) {
    this.pageParams.pageNum = val;
    this.getData();
  }

  menuClick(key: string, row: any) {
    this.$emit('tableClick', key, row);
  }
}
