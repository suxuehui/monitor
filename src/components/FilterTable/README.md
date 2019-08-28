# FilterTable 组件

## 参数列表

|   参数名称   |   说明  |     类型     |  默认值 | 
|-------------|:--------------:|-------:|-------:|
| filterList |  筛选表单列表参数 | `Array` | -- |
| filterGrade |  高级筛选表单列表参数 | `Array` | -- |
| filterParams | 筛选表单的保存值   | `Object` | -- |
| outParams | 外部请求参数 |    `Object` | -- |
| addBtn | 是否显示新增按钮 |    `Boolean` | false |
| exportBtn | 是否暂时导出按钮 |    `Boolean` | -- |
| onAdd | 新增回调事件 |    `Function` | -- |
| tableList | 表格列的配置描述，具体参考element-ui table组件的[columns](http://element-cn.eleme.io/#/zh-CN/component/table) | -- | -- |
| url | 表格请求地址 |    `Object` | -- |
| dataType | 请求数据类型 | `String` | 'formData' |
| rowKey | 表格行ID | `String` | 'id' |
| operat | 操作栏参数 |    `Object` | -- |
| opreatWidth | 操作栏width |    `string` | -- |
| localName | 本地存储表格配置名称 |    `String` | -- |
| fetchError | 请求数据错误回调事件 |    `Function` | -- |
| defaultPageSize | 默认分页数量 |    `Number` | `10` |
| BackParams | 数据返回格式 |    `Ojbect` | `参考下面BackParams` |
| fetchType | 请求数据方法 |    `string` | `post` |
| menuClick | 操作栏点击回调事件 |    `Function` | -- |
| pageSizeList | 表格分页大小参数 |    `Array` | `[5, 10, 15, 20, 50, 100]` |
| defaultPageSize | 默认分页大小 |    `Number` | `10` |
| highlightCurrentRow | 表格行可点击 |    `Boolean` | `false` |
| headerAlign | 头部文字对齐方式 | `string` | `center` |
| isResetChange | 重置时，是否改变初始值 | `Boolean` | `false` |

### backParamsDefault

```
{
  code: 'result.resultCode',
  codeOK: '0',
  message: 'result.resultMessage',
  data: 'entity.data',
  total: 'entity.count',
}
```