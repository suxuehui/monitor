import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Row, Col, Form, FormItem, Input, Select,
  Button, Option, Radio, RadioGroup, Table, TableColumn,
} from 'element-ui';
import {
  attachcfgInsert, attachcfgEdit,
} from '@/api/config';
import { allBrandList, modelAll } from '@/api/model';
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

  @Prop() private time: any;

  modelForm: any = {
    brandId: '', // 品牌
    seriesId: '', // 车系
    modelId: [], // 车型
  };

  // 初始
  cfgParam: any = {
    tag: '',
    param: '',
    desc: '',
  };

  cfgParamAdd: any = [];

  brandArr: any = []; // 品牌列表

  seriesArr: any = []; // 品牌列表

  modelArr: any = []; // 品牌列表

  brandAllArr: any = []; // 所有品牌-车系-车型信息

  loading: boolean = false;

  rules = {

  }

  @Watch('time')
  onDataChange() {
    if (this.data.id > 0) {
      const obj = JSON.parse(JSON.stringify(this.data));
      const objs = {
        brandId: obj.brandId,
        seriesId: obj.seriesId,
      };
      this.getModelAll(objs);
      // 配置参数
      const cfgParamStr = obj.cfgParam.replace(/\["|"]/g, '');
      const cfgParamArr = JSON.parse(cfgParamStr);
      this.cfgParam = {
        tag: cfgParamArr[0].TAG,
        param: cfgParamArr[0].PARAM,
        desc: cfgParamArr[0].DESC,
      };
      if (cfgParamArr.length > 1) {
        const arr = cfgParamArr.slice(1);
        arr.forEach((item: any) => {
          this.cfgParamAdd.push({
            tag: item.TAG,
            param: item.PARAM,
            desc: item.DESC,
          });
        });
      }
      // 回填品牌车系车型
      this.modelForm = {
        brandId: this.data.brandId,
        seriesId: this.data.seriesId !== 0 ? this.data.seriesId : '',
        modelId: this.data.modelId !== 0 ? [this.data.modelId] : '',
      };
      // 车系、车型可修改
      this.seriesAble = false;
      this.modalAble = this.data.seriesId === 0;
      // 设置车系、车系选择
      this.brandAllArr.forEach((item: any) => {
        if (item.id === this.data.brandId) {
          if (item.children && item.children.length > 0) {
            item.children.forEach((items: any) => {
              // 回填车系
              this.seriesArr.push({
                value: items.id,
                label: items.name,
              });
              // items.children && items.children.forEach((it: any) => {
              //   this.modelArr.push({
              //     label: it.name,
              //     value: it.id,
              //   });
              // });
            });
          }
        }
      });
      this.reBootStatus = this.data.enable ? '1' : '2';
    } else {
      this.resetData();
    }
  }

  mounted() {
    // 品牌车系车型
    allBrandList(null).then((res) => {
      if (res.result.resultCode === '0') {
        // item 全部数据
        res.entity.forEach((item: any) => {
          this.brandArr.push({
            label: item.name,
            value: item.id,
            children: item.children,
          });
        });
        this.brandAllArr = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 重置数据
  resetData() {
    this.modelForm = {
      //
    };
  }

  closeModal() {
    this.$emit('close');
    setTimeout(() => {
      this.reBootStatus = '1';
      this.modelForm = {
        brandId: '', // 品牌
        seriesId: '', // 车系
        modelId: [], // 车型
      };
      this.modalAble = true;
      this.seriesAble = true;
      this.seriesArr = [];
      this.modelArr = [];
      this.cfgParamAdd = [];
      this.cfgParam = {
        tag: '',
        param: '',
        desc: '',
      };
    }, 200);
  }

  reBootStatus: string = '1';

  rebootChange(data: any) {
    this.reBootStatus = data;
  }

  seriesAble: boolean = true;

  modalAble: boolean = true;

  // 品牌修改：清空车系，禁用并清空车型
  brandChange(val: any) {
    this.seriesAble = false;
    this.modelForm.seriesId = '';
    this.modelForm.modelId = [];
    this.modalAble = true;
    this.seriesArr = [];
    this.modelForm.brandId = val;
    this.brandArr.forEach((item: any) => {
      if (item.value === val) {
        if (item.children && item.children.length > 0) {
          item.children.forEach((it: any) => {
            this.seriesArr.push({
              label: it.name,
              value: it.id,
              children: it.children,
            });
          });
        }
      }
    });
  }

  // 车系修改：清空车型
  seriesChange(val: any) {
    this.modalAble = false;
    this.modelForm.modelId = [];
    this.modelArr = [];
    const obj = {
      brandId: this.modelForm.brandId,
      seriesId: val,
    };
    this.getModelAll(obj);
  }

  // 根据品牌车系获取车型
  getModelAll(data: any) {
    modelAll(data).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.forEach((it: any) => {
          this.modelArr.push({
            label: it.name,
            value: it.id,
          });
        });
      }
    });
  }

  // 检测是否存在中文
  isHaveChinese(data: any) {
    const flag = false;
  }

  onSubmit() {
    this.loading = true;
    const obj: any = {
      brandId: this.modelForm.brandId,
      cfgs: [],
      enable: this.reBootStatus === '1',
      seriesId: this.modelForm.seriesId,
      modelIds: this.modelForm.modelId.length > 0 ? this.modelForm.modelId : [],
    };
    obj.cfgs.push({
      desc: this.cfgParam.desc,
      param: this.cfgParam.param,
      tag: this.cfgParam.tag,
    });
    let flag = true;
    if (this.cfgParamAdd.length > 0) {
      this.cfgParamAdd.forEach((item: any) => {
        if (item.tag && item.param) {
          obj.cfgs.push(item);
        } else {
          this.loading = false;
          flag = false;
          this.$message.error('填入标签或参数存在空白项,请核对!');
          return false;
        }
      });
    }
    if (this.modelForm.brandId === '') {
      flag = false;
      this.loading = false;
      this.$message.error('品牌不能为空,请选择!');
      return false;
    }
    if (this.cfgParam.tag === '' || this.cfgParam.param === '') {
      flag = false;
      this.loading = false;
      this.$message.error('同一条内容标签、参数必须输入完整!');
      return false;
    }
    let num = 0; // 控制报错只显示一个
    obj.cfgs.forEach((item: any) => {
      if (/[\u4E00-\u9FA5]/g.test(item.tag) || /[\u4E00-\u9FA5]/g.test(item.param)) {
        if (num === 0) {
          num += 1;
          flag = false;
          this.$message.error('标签参数不能填写中文,请修改!');
          return false;
        }
        this.loading = false;
        return false;
      }
    });
    if (!flag) {
      this.loading = false;
      return false;
    }
    console.log(obj.cfgs);
    const From: any = this.$refs.modelForm;
    From.validate((valid: any) => {
      if (valid) {
        if (this.title === '添加配置') {
          attachcfgInsert(obj).then((res: any) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.closeModal();
                this.$emit('refresh');
              }, 500);
            } else {
              setTimeout(() => {
                this.loading = false;
                this.$message.error(res.result.resultMessage);
              }, 500);
            }
          });
        } else {
          obj.cfgId = this.data.id;
          attachcfgEdit(obj).then((res: any) => {
            if (res.result.resultCode === '0') {
              setTimeout(() => {
                this.loading = false;
                this.$message.success(res.result.resultMessage);
                From.resetFields();
                this.closeModal();
                this.$emit('refresh');
              }, 500);
            } else {
              setTimeout(() => {
                this.loading = false;
                this.$message.error(res.result.resultMessage);
              }, 500);
            }
          });
        }
      } else {
        this.loading = false;
        return false;
      }
      return false;
    });
  }

  addCfgParam() {
    this.cfgParamAdd.push({
      tag: '',
      param: '',
      desc: '',
      key: Date.now(),
    });
  }

  deleteCfgParam(key: any) {
    this.cfgParamAdd.splice(key, 1);
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
                  filterable
                  v-model={this.modelForm.brandId}
                  placeholder="选择品牌"
                  style="width:120px"
                  disabled={this.title === '编辑配置'}
                  on-change={this.brandChange}
                >
                  {
                    this.brandArr.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
                <el-select
                  id="seriesId"
                  size="mini"
                  filterable
                  v-model={this.modelForm.seriesId}
                  placeholder="选择车系"
                  style="width:120px;margin: 0 15px"
                  disabled={this.title === '编辑配置' || this.seriesAble}
                  on-change={this.seriesChange}
                >
                  {
                    this.seriesArr.map((item: any) => (
                      <el-option value={item.value} label={item.label} >{item.label}</el-option>
                    ))
                  }
                </el-select>
                <el-select
                  id="modelId"
                  size="mini"
                  filterable
                  multiple={true}
                  v-model={this.modelForm.modelId}
                  placeholder="选择车型"
                  style="width:260px"
                  disabled={this.title === '编辑配置' || this.modalAble}
                >
                  {
                    this.modelArr.map((item: any) => (
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
                      v-model={this.cfgParam.tag}
                    ></el-input>
                  </td>
                  <td class='inputItem'>
                    <el-input
                      v-model={this.cfgParam.param}
                    ></el-input>
                  </td>
                  <td class='inputItem'>
                    <el-input
                      v-model={this.cfgParam.desc}
                    ></el-input>
                  </td>
                  <td>
                    <el-button slot="append" type="text" icon="iconfont-delete icon-close" disabled on-click={() => this.deleteCfgParam(2)}></el-button>
                  </td>
                </tr>
                {
                  this.cfgParamAdd.map((item: any, key: number) => (
                    <tr class='lineItem'>
                      <td class='inputItem'>
                        <el-input
                          v-model={this.cfgParamAdd[key].tag}
                        ></el-input>
                      </td>
                      <td class='inputItem'>
                        <el-input
                          v-model={this.cfgParamAdd[key].param}
                        ></el-input>
                      </td>
                      <td class='inputItem'>
                        <el-input
                          v-model={this.cfgParamAdd[key].desc}
                        ></el-input>
                      </td>
                      <td>
                        <el-button slot="append" type="text" icon="iconfont-delete icon-close" on-click={() => this.deleteCfgParam(key)}></el-button>
                      </td>
                    </tr>
                  ))
                }
              </table>
            </el-col>
            <el-col span={24}>
              <el-form-item label="是否启用" prop="reboot" class="isStart">
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
