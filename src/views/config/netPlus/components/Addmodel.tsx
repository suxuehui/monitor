import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Row, Col, Form, FormItem, Input, Select, Button, Option, Radio, RadioGroup, Table, TableColumn
} from 'element-ui';

import './Addmodel.less';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-tag': Tag,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-select': Select,
    'el-button': Button,
    'el-option': Option,
    'el-radio': Radio,
    'el-radio-group': RadioGroup,
    'el-table': Table,
    'el-table-column': TableColumn,
  },
})
export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop({ default: '' }) private title!: string;

  @Prop() private data: any;

  modelForm: any = {
    brandId: '', // 品牌
    seriesId: '', // 车系
    modalId: [], // 车型
    cfgParamAdd: [{
      name1: '',
      name2: '',
      name3: '',
    },
    {
      name1: '',
      name2: '',
      name3: '',
    }, {
      name1: '',
      name2: '',
      name3: '',
    }, {
      name1: '',
      name2: '',
      name3: '',
    },],
    cfgParam: {
      name1: '',
      name2: '',
      name3: '',
    },
  };

  loading: boolean = false;

  rules = {

  }

  @Watch('data')
  onDataChange(data: any) {
    if (this.data.id > 0) {

    } else {
      this.resetData();
    }
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      // 
    };
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    this.modelForm = {
      brandId: '', // 品牌
      seriesId: '', // 车系
      modalId: [], // 车型
    }
    this.loading = false;
  }

  reBootStatus: string = '1';

  rebootChange(data: any) {
    this.reBootStatus = data;
  }

  brandList: any = [{
    value: '1',
    label: '1'
  }, {
    value: '2',
    label: '2'
  }];

  seriesList: any = [{
    value: '3',
    label: '3'
  }, {
    value: '4',
    label: '4'
  },];

  modalList: any = [{
    value: '5',
    label: '5'
  }, {
    value: '6',
    label: '6'
  }];

  seriesAble: boolean = true;

  modalAble: boolean = true;

  // 品牌修改：清空车系，禁用并清空车型
  brandChange(val: any) {
    console.log(val)
    this.seriesAble = false;
    this.modelForm.seriesId = '';
    this.modelForm.modalId = [];
    this.modalAble = true;
  }

  // 车系修改：清空车型
  seriesChange(val: any) {
    console.log(val)
    this.modalAble = false;
    this.modelForm.modalId = [];
  }

  tableData: any = [{
    date: '2016-05-02',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1518 弄'
  }, {
    date: '2016-05-04',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1517 弄'
  }, {
    date: '2016-05-01',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1519 弄'
  }, {
    date: '2016-05-03',
    name: '王小虎',
    address: '上海市普陀区金沙江路 1516 弄'
  }]

  onSubmit() {
    console.log(this.modelForm)
    // this.loading = true;
    // const From: any = this.$refs.modelForm;
    // From.validate((valid: any) => {
    //   if (valid) {
    //     if (this.title === '新增配置') {
    //       console.log('新增')
    //     } else {
    //       console.log('编辑')
    //     }
    //   } else {
    //     this.loading = false;
    //     return false;
    //   }
    //   return false;
    // });
  }

  addCfgParam() {
    this.modelForm.cfgParamAdd.push({
      name1: '',
      name2: '',
      name3: '',
      key: Date.now(),
    });
  }

  deleteCfgParam(key: any) {
    this.modelForm.cfgParamAdd.splice(key, 1);
  }

  render() {
    return (
      <el-dialog
        width="720px"
        title={this.title}
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="90px" class="fzkAddConfigModel">
          <el-row>
            <el-col span={24}>
              <el-form-item label="配置车型" prop="cfgName">
                <el-select
                  id="brandId"
                  size="mini"
                  v-model={this.modelForm.brandId}
                  placeholder="选择品牌"
                  style="width:120px"
                  on-change={this.brandChange}
                >
                  {
                    this.brandList.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
                <el-select
                  id="seriesId"
                  size="mini"
                  v-model={this.modelForm.seriesId}
                  placeholder="选择车系"
                  style="width:120px;margin: 0 15px"
                  disabled={this.seriesAble}
                  on-change={this.seriesChange}
                >
                  {
                    this.seriesList.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
                <el-select
                  id="modalId"
                  size="mini"
                  multiple={true}
                  v-model={this.modelForm.modalId}
                  placeholder="选择车型"
                  style="width:240px"
                  disabled={this.modalAble}
                >
                  {
                    this.modalList.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <table class='customers'>
                <tr class='tableTitle'>
                  <th class='tableTitleItem wid80'>标签</th>
                  <th class='tableTitleItem'>参数</th>
                  <th class='tableTitleItem'>备注</th>
                  <th class='tableTitleItem wid50'>
                    <el-button slot="append" icon="iconfont-plus icon-plus" type="text" on-click={this.addCfgParam}></el-button>
                  </th>
                </tr>
                <tr class='lineItem'>
                  <td class='inputItem'>
                    <el-input
                      v-model={this.modelForm.cfgParam.name1}
                    ></el-input>
                  </td>
                  <td class='inputItem'>
                    <el-input
                      v-model={this.modelForm.cfgParam.name2}
                    ></el-input>
                  </td>
                  <td class='inputItem'>
                    <el-input
                      v-model={this.modelForm.cfgParam.name3}
                    ></el-input>
                  </td>
                  <td>
                    <el-button slot="append" type="text" icon="iconfont-delete icon-close" disabled on-click={() => this.deleteCfgParam(2)}></el-button>
                  </td>
                </tr>
                {
                  this.modelForm.cfgParamAdd.map((item: any, key: number) => {
                    return (
                      <tr class='lineItem'>
                        <td class='inputItem'>
                          <el-input
                            v-model={this.modelForm.cfgParamAdd[key].name1}
                          ></el-input>
                        </td>
                        <td class='inputItem'>
                          <el-input
                            v-model={this.modelForm.cfgParamAdd[key].name2}
                          ></el-input>
                        </td>
                        <td class='inputItem'>
                          <el-input
                            v-model={this.modelForm.cfgParamAdd[key].name3}
                          ></el-input>
                        </td>
                        <td>
                          <el-button slot="append" type="text" icon="iconfont-delete icon-close" on-click={() => this.deleteCfgParam(key)}></el-button>
                        </td>
                      </tr>
                    )
                  })
                }
              </table>
            </el-col>
            <el-col span={24}>
              <el-form-item label="是否重启" prop="reboot" class="isStart">
                <div class="radioGroup">
                  <el-radio-group v-model={this.reBootStatus} on-change={this.rebootChange}>
                    <el-radio id="availableY" label="1">是</el-radio>
                    <el-radio id="availableN" label="2">否</el-radio>
                  </el-radio-group>
                </div>
                <p class="reStart">( 只有启用的配置才生效 )</p>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div style={{ textAlign: 'center' }}>
          <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
          <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
        </div>
      </el-dialog>
    );
  }
}
