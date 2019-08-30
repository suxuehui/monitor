import {
  Component, Prop, Vue, Emit,
} from 'vue-property-decorator';
import {
  Table, TableColumn, Pagination, Dropdown, DropdownItem, DropdownMenu, Tooltip,
} from 'element-ui';
import { tableList, Opreat } from '@/interface';
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
    'el-tooltip': Tooltip,
    'm-spin': Spin,
    'el-dropdown': Dropdown,
    'el-dropdown-item': DropdownItem,
    'el-dropdown-menu': DropdownMenu,
  },
})
export default class MTable extends Vue {
  // 表格列配置参数
  @Prop() private tableList!: tableList[];

  // 请求地址
  @Prop() private url!: string;

  // 请求方式
  @Prop() private dataType!: string;

  // 返回数据格式
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
  @Prop({ default: () => [] }) private operat!: Opreat[];

  // 操作栏width
  @Prop({ default: '100px' }) private opreatWidth!: string;

  // 固定高度--固定表头
  @Prop() private height!: string;

  // 页码按钮数量,当总页数超过该值时会折叠 大于等于 5 且小于等于 21 的奇数
  @Prop() private pagerCount!: number;

  // 最高高度
  @Prop() private maxHeight!: string;

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

  // 分页默认长度
  @Prop({ default: 10 }) private defaultPageSize!: number;

  // 表格头部文字对齐方式
  @Prop({ default: 'center' }) private headerAlign!: string;

  // 表格行是否可点击
  @Prop() private highlightCurrentRow!: boolean;

  @Prop() private treeProps!: any;

  // data
  tableData: any = [];

  // 分页参数
  pageParams: {
    pageSize: number,
    pageNum: number,
    page: boolean,
  } = {
    pageSize: this.defaultPageSize,
    pageNum: 1,
    page: true,
  };

  // 加载状态
  loading: boolean = false;

  // 数据总数
  dataTotal: number = 0;

  created() {
    this.getData();
  }

  returnData() {
    return this.tableData;
  }

  /**
   * @method 重新加载表格数据
   * @param {string} type 是否是删除操作
   */
  reload(type: string) {
    if (type === 'delete' && this.tableData.length === 1) {
      if (this.pageParams.pageNum !== 1) {
        this.pageParams.pageNum = this.pageParams.pageNum - 1;
      }
    }
    this.getData();
  }

  // 恢复当前页到第一页
  clearPageParams() {
    this.pageParams.pageNum = 1;
  }

  // 获取表格数据
  getData(data?: any) {
    this.loading = true;
    request({
      url: this.url,
      method: this.fetchType,
      fetchType: this.dataType,
      data: data || Object.assign(this.tableParams, this.pageParams, this.outParams),
    }).then((res) => {
      this.loading = false;
      const code = this.getValue(this.BackParams.code, res);
      // 判断状态码
      if (code === this.BackParams.codeOK) {
        // 判断是否有数据
        if (!res.entity) {
          this.tableData = [];
          this.dataTotal = 0;
        } else {
          // 总数
          if (this.getValue(this.BackParams.total, res)) {
            this.dataTotal = this.getValue(this.BackParams.total, res);
          } else {
            this.dataTotal = 0;
          }
          // 数据
          if (this.getValue(this.BackParams.data, res)) {
            this.tableData = this.getValue(this.BackParams.data, res);
          } else {
            this.tableData = [];
          }
          this.$emit('pageDataChange', this.tableData);
        }
      } else {
        this.$message.error(this.getValue(this.BackParams.message, res));
      }
    });
  }

  /**
   * @method 根据`entity.list`匹配json对象数据
   * @param {string} position `entity.list`
   * @param {any} data 返回查找到的数据
   */
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

  /**
   * @method 操作栏渲染函数
   * @param {Array} operaList 操作栏配置参数
   * @return JSXElement or null
   */
  showOperate(operaList: any) {
    const optArr: number[] = [];
    operaList.forEach((item: any) => {
      if (item.roles) {
        optArr.push(1);
      }
    });
    if (optArr.length > 0) {
      return <el-table-column width={this.opreatWidth} label="操作" formatter={this.opreatJSX}></el-table-column>;
    }
    return null;
  }

  render() {
    return (
      <div class="m-table" >
        <m-spin show={this.loading} />
        <el-table
          height={this.height}
          max-height={this.maxHeight}
          data={this.tableData}
          on-row-click={this.currentChange}
          on-selection-change={this.selectChange}
          treeProps={this.treeProps}
          highlightCurrentRow={this.highlightCurrentRow}>
          {
            // 循环渲染表格
            this.tableList.map((item, index) => {
              // 不对数据源进行处理的，进行判空和溢出处理
              if (!item.formatter&& !item.hasChildren) {
                item.formatter = (row: any) => (row[item.prop] !== null && row[item.prop] !== ''
                  ? <el-tooltip effect="dark" content={row[item.prop] !== null ? `${row[item.prop]}` : '--'} placement="top">
                    <p class="text-over">{row[item.prop] !== null ? `${row[item.prop]}` : '--'}</p>
                  </el-tooltip> : '--');
              }
              // 对数据源进行处理的
              return <el-table-column
                key={index} {...{ props: item }} align={this.headerAlign}>
              </el-table-column>;
            })
          }
          {
            this.showOperate(this.operat)
          }
        </el-table>
        <el-pagination
          class="pagination"
          pager-count={this.pagerCount}
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

  /**
   * @method 操作栏渲染函数
   * @param {object} row 当前行数据
   * @param {ojbect} column 操作栏列配置参数
   * @param {object} cellValue 当前列匹配数据
   * @param {number} index 当前行序列号
   */
  opreatJSX(row: any, column: string, cellValue: any, index: number) {
    // 操作数达到5个，使用下拉操作
    let num: number = 0;
    this.operat.forEach((item: any) => {
      if (item.roles === true) {
        num += 1;
      }
    });
    if (num > 4) {
      return <el-dropdown on-command={(command: string) => this.menuClick(null, command, row)}>
        <span class="el-dropdown-link">
          下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          {
            this.operat.map((item, indexs) => {
              if (item.roles) {
                return <el-dropdown-item
                  id={`${item.key}`}
                  key={indexs}
                  command={item.key}
                  disabled={item.disabled && item.disabled(row)}
                >
                  {typeof item.text === 'function' ? item.text(row) : item.text}
                </el-dropdown-item>;
              }
              return true;
            })
          }
        </el-dropdown-menu>
      </el-dropdown>;
    }
    return <div class="table-operat">
      {
        this.operat.map((item, indexs) => {
          // 红色和橙色按钮操作有提示
          const whiteList = ['red', 'orange'];
          // 操作权限判断
          if (item.roles) {
            // 禁止状态判断
            if (item.disabled && item.disabled(row)) {
              return <a id={`${item.key}-${row[item.rowKey]}`} key={indexs} class="btn disabled">
                {typeof item.text === 'function' ? item.text(row) : item.text}
              </a>;
            } if (typeof item.color === 'function'
              && whiteList.indexOf(typeof item.color === 'function' ? item.color(row) : item.color) >= 0) { // 操作颜色根据当前行数据匹配
              return <pop-confirm
                keyName={item.key}
                on-confirm={() => this.menuClick(null, item.key, row)}
                title={typeof item.msg === 'function' ? item.msg(row) : item.msg}>
                <a id={`${item.key}-${row[item.rowKey]}`} key={indexs}
                  class={`link-${typeof item.color === 'function' ? item.color(row) : item.color}`}>
                  {typeof item.text === 'function' ? item.text(row) : item.text}
                </a>
              </pop-confirm>;
            } if (typeof item.color === 'string'
              && whiteList.indexOf(item.color) >= 0) { // 判断颜色是否为红和橙色，增加操作提示
              return <pop-confirm
                keyName={item.key}
                on-confirm={() => this.menuClick(null, item.key, row)}
                title={typeof item.msg === 'function' ? item.msg(row) : item.msg}>
                <a id={`${item.key}-${row[item.rowKey]}`} key={indexs} class={`link-${item.color}`}>
                  {typeof item.text === 'function' ? item.text(row) : item.text}
                </a>
              </pop-confirm>;
            }
            // 没有提示的操作
            return <a id={`${item.key}-${row[item.rowKey]}`} class={`link-${typeof item.color === 'function' ? item.color(row) : item.color}`} key={indexs} on-click={(e: any) => this.menuClick(e, item.key, row)}>{typeof item.text === 'function' ? item.text(row) : item.text}</a>;
          }
          return true;
        })
      }
    </div>;
  }

  // 分页大小改变回调事件
  handleSizeChange(val: number) {
    this.pageParams.pageSize = val;
    this.getData();
  }

  // 页数切换回调事件
  handleCurrentChange(val: number) {
    this.pageParams.pageNum = val;
    this.getData();
  }

  // 操作栏点击回调事件
  menuClick(e: any, key: string, row: any) {
    if (e) {
      e.stopPropagation();
    }
    this.$emit('tableClick', key, row);
  }
}
