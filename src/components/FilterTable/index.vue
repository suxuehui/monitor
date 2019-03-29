<template>
  <div class="filter-table">
    <m-filter
      ref="MFilter"
      :filter-list="filterList"
      :filter-grade="filterGrade"
      :filter-params="filterParams"
      :table-list="defalutTableList"
      :add-btn="addBtn"
      :export-btn="exportBtn"
      :local-name="localName"
      :is-reset-change="isResetChange"
      @search="searchFun"
      @clearOut="clearFun"
      @export="exportBack"
      @setTable="setTable"
      @addFun="addBack"
      @downloadFun="downBack"
      @tableHeight="tableHeight"
    />
    <m-table
      ref="MTable"
      :table-list="changeTableList"
      :url="url"
      :data-type="dataType"
      :row-key="rowKey"
      :opreat="opreat"
      :opreat-width="opreatWidth"
      :back-params="BackParams"
      :header-align="headerAlign"
      :fetch-type="fetchType"
      :fetch-error="fetchError"
      :table-params="tableParams"
      :page-size-list="pageSizeList"
      :out-params="outParams"
      :default-page-size="defaultPageSize"
      :highlight-current-row="highlightCurrentRow"
      @tableClick="tableClick"
      @selectChange="selectChange"
      @currentChange="currentChange"
    />
  </div>
</template>

<script lang="ts">
import {
  Prop, Emit, Vue, Component,
} from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface/index';
import MFilter from './MFilter';
import MTable from './MTable';

@Component({
  components: {
    'm-filter': MFilter,
    'm-table': MTable,
  },
})
export default class FilterTable extends Vue {
  // 筛选表单生成参数
  @Prop() private filterList!: FilterFormList[];

  // 筛选表单高级生成参数
  @Prop() private filterGrade!: FilterFormList[];

  // 筛选表单存储数据参数
  @Prop({ default: {} })
  private filterParams!: any;

  // 外部参数
  @Prop({ default: {} })
  private outParams!: any;

  // 表格分页大小参数
 @Prop({ default: () => [5, 10, 15, 20, 50, 100] }) private pageSizeList!: number[];


  // 是否展示新增按钮
  @Prop() private addBtn!: boolean;

  // 是否展示导出按钮
  @Prop() private exportBtn!: boolean;

  // 表格参数
  @Prop() private tableList!: tableList[];

  // 请求数据地址
  @Prop() private url!: string;

  // 请求数据类型
  @Prop({ default: 'formData' })
  private dataType!: string;

  // 表格行ID
  @Prop() private rowKey!: string;

  // 操作参数
  @Prop() private opreat!: Opreat[];

  // 操作栏width
  @Prop() private opreatWidth!: string;

  // 本地存储字段名
  @Prop({ default: 'filterTable' }) private localName!: string;

  // 请求错误回调事件
  @Prop() private fetchError!: string;

  // 默认分页数量
  @Prop() private defaultPageSize!: number;

  // 数据返回格式
  @Prop() private BackParams!: object;

  // 请求数据方法
  @Prop() private fetchType!: string;

  // 头部对齐方式
  @Prop({ default: 'center' }) private headerAlign!: string;

  // 表格行是否可点击
  @Prop({ default: false })
  private highlightCurrentRow!: boolean;

  // 重置时，是否改变初始值
  @Prop({ default: false }) private isResetChange!: boolean;

  // 初始化请求参数
  tableParams: any = Object.assign(this.filterParams, this.outParams);

  defalutTableList: tableList[] = this.tableList.filter(item => true);

  changeTableList: tableList[];

  constructor(props: any) {
    super(props);
    const self = this;
    // 获取本地表格配置缓存
    const saveList = window.localStorage.getItem(this.localName);
    // 判断是否有值
    if (saveList) {
      const checkList = saveList.split(',');
      // 根据换成过滤表格配置
      const filterList = this.defalutTableList.filter(
        (item, index) => checkList.indexOf(item.prop) > -1,
      );
      // 保存改变后的tableList
      this.changeTableList = filterList;
    } else {
      // 没有就默认全部展示
      this.changeTableList = this.tableList.filter(item => true);
    }
  }

  /**
   * @method 重新加载数据
   * @param {string} type delete 或者其他字符串，用于当前页只有一条数据，并点击了删除，要回退到上一页
   */
  reloadTable(type?: string) {
    const table: any = this.$refs.MTable;
    // 延迟100ms加载数据
    setTimeout(() => {
      table.reload(type);
    }, 50);
  }

  /**
   * @method 获取当前页数据
   */
  getCurrentPageData() {
    const table: any = this.$refs.MTable;
    return table.returnData();
  }

  /**
   * @method 搜索回调事件
   */
  @Emit()
  searchFun(params: any) {
    this.tableParams = params;
    const table: any = this.$refs.MTable;
    // 恢复当前页面到第一页
    table.clearPageParams();
    // 延迟100ms加载数据
    setTimeout(() => {
      table.reload();
    }, 100);
  }

  /**
   * @method 重置按钮点击回调事件
   */
  @Emit()
  clearFun(callBack: Function) {
    this.$emit('clearOutParams', callBack);
  }

  /**
   * @method 新增回调事件
   */
  @Emit()
  addBack() {
    this.$emit('addBack');
  }

  @Emit()
  downBack(data: any) {
    this.$emit('downBack', data);
  }

  /**
   * @method 点击高级搜索时-设置表格样式
   */
  @Emit()
  tableHeight(params: any) {
    const table: any = this.$refs.MTable;
    table.$el.style.marginTop = `${params - 48}px`;
  }

  /**
   * @method 导出回调事件
   */
  @Emit()
  exportBack() {
    this.$emit('exportBack');
  }

  /**
   * @method 表格列配置函数
   * @param {array} list 列id数组
   */
  @Emit()
  setTable(list: Array<string>) {
    const filterList = this.defalutTableList.filter(
      (item, index) => list.indexOf(item.prop) > -1,
    );
    this.changeTableList = filterList;
  }

  /**
   * @method 操作栏回调事件
   */
  @Emit()
  tableClick(key: string, row: any) {
    this.$emit('menuClick', key, row);
  }

  /**
   * @method select回调事件
   */
  @Emit()
  selectChange(val: any) {
    this.$emit('selectChange', val);
  }

  /**
   * @method 点击行回调事件
   */
  @Emit()
  currentChange(val: any) {
    this.$emit('currentChange', val);
  }
}
</script>

<style lang="less" scoped>
.filter-table {
  overflow: hidden;
  min-height: e("calc(100vh - 100px)");
}
</style>
