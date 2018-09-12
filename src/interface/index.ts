// 筛选表单
type FilterType = 'input' | 'select' | 'cascader' | 'levelcode' | 'datetime' | 'date' | 'datetimerange' | 'checkboxButton';
export interface FilterFormList {
  key: string;
  type: FilterType;
  label: string;
  placeholder: string | string[];
  props?:any;
  value?: string[];
  filterable?: boolean;
  options?: Array<{ value: any, label: string }>;
  change?: Function;
  itemChange?: Function;
  pickerOptions?: { shortcuts: Array<{ text: string, onClick(picker: any): void }> };
}

export interface TableColumnFilter {
  text: string,
  value: any
}
// 表单样式
export interface tableList {
  type?: string,
  index?: string | Function,
  columnKey?: string,
  label?: string,
  prop: string,
  width?: string,
  minWidth?: string,
  fixed?: string | boolean,
  renderHeader?: Function,
  sortable?: boolean | string,
  sortMethod?: Function,
  sortBy?: string | any | Function,
  sortOrders?: any,
  resizable?: boolean,
  /* Function(row, column, cellValue, index) */
  formatter?: (row: any, cloumn: any, cellValue: any, index: number) => any,
  showOverflowTooltip?: boolean,
  align?: string,
  headerAlign?: string,
  className?: string,
  labelClassName?: string,
  selectable?: Function,
  reserveSelection?: Boolean,
  filters?: TableColumnFilter[],
  filterPlacement?: string,
  filterMultiple?: boolean,
  filterMethod?: Function,
  filteredValue?: any;
  render?: Function;
}
// 操作
export interface Opreat {
  key: string,
  rowKey: string,
  color: Function | string,
  text: Function | string,
  disabled?: Function;
  roles: Function | boolean,
  msg?: Function | string,
}
// 表格数据
export interface tableTag {
  key: number,
  color: string,
  value: number,
  label: string,
}

export interface menuItem {
  id: number,
  title: string,
  url?: string,
  icon?: string,
  permission: string | Array<string> | boolean,
  children?: Array<menuItem>,
}

export interface MockConfig {
  url: string,
  header: object,
  body: string,
}

export interface routerItem {
  name?: string,
  component?: any,
  path: string,
  icon?: string,
  hidden?: boolean,
  permission?: string | string[] | boolean,
  redirect?: string | object,
  children?: routerItem[],
  meta?: any,
}

export interface Directives {
  name: string,
  value: any,
  modifiers: object,
}
type CoordinateSystem = 'bd09ll' | 'gcj02ll';
export interface MapCarData {
  id: string,
  direction: number,
  lat: number,
  lng: number,
  plateNum: string,
  speed: number,
  coordinateSystem: CoordinateSystem,
}
// 坐标
export interface Point {
  lng: number,
  lat: number,
}
