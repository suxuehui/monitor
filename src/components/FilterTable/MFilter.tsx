import { Component, Prop, Emit, Vue } from 'vue-property-decorator';
import {
  Row,
  Col,
  Input,
  Select,
  Form,
  FormItem,
  TimePicker,
  DatePicker,
  Cascader,
  Button,
  Dialog,
  CheckboxGroup,
  Checkbox,
  Option,
  CheckboxButton,
} from 'element-ui';
import { FilterFormList, tableList } from '@/interface';


import './MFilter.less';

@Component({
  components: {
  'el-input': Input,
  'el-option': Option,
  'el-select': Select,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-time-picker': TimePicker,
  'el-date-picker': DatePicker,
  'el-cascader': Cascader,
  'el-row': Row,
  'el-col': Col,
  'el-button': Button,
  'el-dialog': Dialog,
  'el-checkbox-group': CheckboxGroup,
  'el-checkbox': Checkbox,
  'el-checkbox-button': CheckboxButton,
  }
  })
export default class MFilter extends Vue {
  // 筛选表单生成参数
  @Prop()
  private filterList!: FilterFormList[];
  // 筛选表单高级生成参数
  @Prop()
  private filterGrade!: FilterFormList[];
  // 筛选表单存储数据参数
  @Prop({ default: {} }) private filterParams!: any;
  // 是否展示新增按钮
  @Prop({ default: false }) private addBtn!: boolean;
  // 是否展示导出按钮
  @Prop({ default: false }) private exportBtn!: boolean;
  // 导出按钮回调事件
  @Prop({ default: () => { } }) private exportFun!: Function;
  // tablelist 参数
  @Prop() private tableList!: tableList[];
  @Prop({ default: '100px' }) private labelWidth!: string;

  // 按钮是否能点击
  @Prop({ default: true }) private btnFalse!: boolean;

  @Prop() private localName!: string;
  // data
  params: any = JSON.parse(JSON.stringify(this.filterParams));
  // 初始化表格筛选参数
  initParams: any = JSON.parse(JSON.stringify(this.filterParams));
  btnXl: number = 24 - (this.filterList.length * 3);
  btnlg: number = 24 - (this.filterList.length * 3);
  btnmd: number = 24 - (this.filterList.length * 4);
  // 弹出窗开关
  setModel: boolean = false;
  // 表格显示的列表
  checkList: Array<string> = [];
  // 高级搜索开关
  showGrade: boolean = false;
  // 高级筛选高度
  tableMarginTop: number = 0;

  constructor(props: any) {
    super(props);
    const self = this;
    const saveList = window.localStorage.getItem(this.localName);
    if (saveList) {
      this.checkList = saveList.split(',');
    }
  }
  created() {
    if (!this.checkList) {
      this.tableList.map((item) => {
        if (item.prop) {
          this.checkList.push(item.prop);
        }
        return false;
      });
    }
  }

  // methods
  @Emit()
  onSearch(): void {
    this.$emit('search', this.params);
  }
  @Emit()
  reset(): void {
    this.params = JSON.parse(JSON.stringify(this.initParams));
    this.$emit('clearOut');
    this.$emit('search', this.params);
  }
  @Emit()
  levelcodeChange(val: any, key: string): void {
    const value = JSON.parse(JSON.stringify(val));
    this.params[key] = value.pop();
  }
  @Emit()
  openSetting(): void {
    this.setModel = true;
  }
  @Emit()
  closeModal(): void {
    this.setModel = false;
  }
  @Emit()
  gradeSwitch(val: boolean): void {
    this.showGrade = val;
    this.tableMarginTop = val ?
      (this.$refs.filterGrade as Element).clientHeight :
      (this.$refs.filterNormal as Element).clientHeight;
    this.$emit('tableHeight', this.tableMarginTop);
  }
  @Emit()
  addFun(): void {
    this.$emit('addFun');
  }

  formItem(item: FilterFormList, index: number, grade?: boolean) {
    let itemDom = null;
    switch (item.type) {
      case 'input':
        itemDom = <el-input id={item.key} v-model={this.params[item.key]}
          placeholder={item.placeholder}></el-input>;
        break;
      case 'select':
        itemDom = <el-select
          style="width: 100%;"
          id={item.key}
          v-model={this.params[item.key]}
          placeholder={item.placeholder}>
          {
            item.options && item.options.map((items: any, indexs: number) => <el-option
              key={indexs} value={items.value} label={items.label}></el-option>)
          }
        </el-select>;
        break;
      case 'cascader':
        itemDom = <el-cascader style="width: 100%;"
          id={item.key}
          options={item.options}
          v-model={this.params[item.key]}
          placeholder={item.placeholder}
          props={item.props}
          filterable={item.filterable}
          change-on-select
          on-active-item-change={item.itemChange}
          on-change={item.change}></el-cascader>;
        break;
      case 'levelcode':
        itemDom = <el-cascader style="width: 100%;"
          id={item.key}
          props={item.props}
          change-on-select
          filterable={true}
          options={item.options}
          v-model={this.params[`${item.key}Arr`]}
          placeholder={item.placeholder}
          on-change={(e: Array<string>) => this.levelcodeChange(e, item.key)}></el-cascader>;
        break;
      case 'datetime':
        itemDom = <el-date-picker
          id={item.key}
          v-model={this.params[item.key]}
          type="datetime"
          placeholder={item.placeholder}>
        </el-date-picker>;
        break;
      case 'date':
        itemDom = <el-date-picker
          id={item.key}
          v-model={this.params[item.key]}
          type="date"
          placeholder={item.placeholder}>
        </el-date-picker>;
        break;
      case 'datetimerange':
        itemDom = <el-date-picker
          id={item.key}
          v-model={this.params[item.key]}
          type="datetimerange"
          align="right"
          pickerOptions={item.pickerOptions}
          on-change={(e: Array<Date>) => this.rangeChange(e, item.value ? item.value : [])}
          start-placeholder={item.placeholder[0]}
          end-placeholder={item.placeholder[1]}>
        </el-date-picker>;
        break;
      case 'checkboxButton':
        itemDom = <el-checkbox-group
          on-change={item.change}
          v-model={this.params[item.key]}
          size="small">
          {
            item.options && item.options.map((
              items,
              indexs: number,
            ) => <el-checkbox-button
              label={items.value}
              key={indexs}>
                {items.label}
              </el-checkbox-button>)
          }
        </el-checkbox-group>;
        break;
      default: break;
    }
    if (grade) {
      return (
        <el-col span={6} xl={6} lg={6} md={8} sm={8} xs={12} key={index}>
          <el-form-item label={item.label}>
            {itemDom}
          </el-form-item>
        </el-col>
      );
    }
    return (
      <el-col span={4} xl={3} lg={3} md={4} sm={8} xs={12} key={index}>
        <el-form-item>
          {itemDom}
        </el-form-item>
      </el-col>
    );
  }

  // 时间区间赋值操作
  rangeChange(data: Date[], value: string[]) {
    this.params[value[0]] = data[0].Format('yyyy-MM-dd hh:mm:ss');
    this.params[value[1]] = data[1].Format('yyyy-MM-dd hh:mm:ss');
  }

  render() {
    const { isMobile } = this.$store.state.app;
    return (
      <div class={`filter-wrap ${this.showGrade ? 'showGrade' : ''}`}>
        <div class="filter-mormal" ref="filterNormal">
          <el-form model={this.params} size="mini">
            <el-row gutter={20}>
              {
                this.filterList.map((item, index) => this.formItem(item, index))
              }
              <el-col class="btn-wrap" xl={this.btnXl} lg={this.btnlg} md={this.btnmd ? this.btnmd : 24} sm={24} xs={24}>
                {this.btnElement(true)}
              </el-col>
            </el-row>
          </el-form>
        </div>
        {
          this.filterGrade.length ?
            <div class="filter-grade" ref="filterGrade" id="filter-grade">
              <el-form model={this.params} size="mini" label-width={isMobile ? '' : this.labelWidth}>
                <el-row gutter={20}>
                  {
                    this.filterGrade.map((item, index) => this.formItem(item, index, true))
                  }
                  <el-col class="btn-wrap" span={24} sm={24} xs={24}>
                    {this.btnElement(false)}
                  </el-col>
                </el-row>
              </el-form>
            </div> : null
        }
        <el-dialog id="tableSet" width="500px" title="表格设置" visible={this.setModel} close-on-click-modal={false} on-close={this.closeModal}>
          <el-checkbox-group class="checkbox-list" v-model={this.checkList}>
            {
              this.tableList.map((item, index) => <el-checkbox key={index} label={item.prop}>
                {item.label}</el-checkbox>)
            }
            <div class="dialog-footer">
              <el-button size="mini" on-click={this.closeModal}>取 消</el-button>
              <el-button size="mini" type="primary" disabled={!this.btnFalse} on-click={this.setTable}>保 存</el-button>
            </div>
          </el-checkbox-group>
        </el-dialog>
      </div>
    );
  }

  setTable() {
    if (this.checkList.length > 0) {
      window.localStorage.setItem(this.localName, this.checkList.join(','));
      this.$emit('setTable', this.checkList);
      this.setModel = false;
    } else {
      this.$message.error('表格不能为空，请重新选择');
    }
  }

  btnElement(isNormal: boolean): JSX.Element {
    return (
      <div>
        <el-button type="primary" on-click={this.onSearch} size="mini" id="tableSearch" icon="el-icon-search">搜索</el-button>
        <el-button type="primary" on-click={this.reset} size="mini" id="tableReset" icon="el-icon-refresh">重置</el-button>
        {
          this.filterGrade.length ? <a on-click={() => this.gradeSwitch(isNormal)} class="grade-btn">{isNormal ? '普通' : '高级'}搜索{isNormal ? <i class="iconfont-down"></i> : <i class="iconfont-up"></i>}</a> : null
        }
        <div class="right-btn">
          {
            this.addBtn ? <el-button on-click={this.addFun} id={isNormal ? 'tableAdd' : 'tableAdd2'} size="mini" icon="el-icon-plus">新增</el-button> : null
          }
          {
            this.exportBtn ? <el-button on-click={this.addFun} id={isNormal ? 'tableExport' : 'tableExport2'} size="mini" icon="el-icon-download" circle></el-button> : null
          }
          <el-button on-click={this.openSetting} id="tableSet" icon="el-icon-setting" size="mini" circle></el-button>
        </div>
      </div>
    );
  }
}
