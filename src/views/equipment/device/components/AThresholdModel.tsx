import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button, Form, FormItem, Input, InputNumber, Radio, RadioGroup,
} from 'element-ui';

import './AThresholdModel.less';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-input': Input,
    'el-form-item': FormItem,
    'el-button': Button,
    'el-input-number': InputNumber,
    'el-radio-group': RadioGroup,
    'el-radio': Radio,
  },
})
export default class BsjThreshold extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  loading: boolean = false;

  modelForm: any = {
    cfgName: '',
    reboot: '1',
    cfgParam: '',
    cfgParamAdd: [],
    remark: '',
    productCode: '',
    terminalStatus: '',
  };

  rules = []

  closeModal() {
    this.$emit('close');
  }

  onSubmit() {
    // this.loading = true;
    const obj: any = {
      imei: this.data.imei,
    };
    console.log(111);
  }

  render() {
    return (
      <el-dialog
        width="760px"
        title="阈值设置"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} status-icon ref="modelForm" label-width="90px" class="fzkAModel">
          <el-form-item label="里程" prop="cfgName">
            <div class="aItemOne">
              <el-input
                id="cfgName"
                class="aItemOneInput"
                v-model={this.modelForm.cfgName}
                placeholder="请输入配置名称"
              />
              <span class="aItemTitle color909399">初始里程</span>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="超速" prop="productCode3">
            <div class="aItemTwo">
              <el-col span={12} class="aItemTwoItem">
                <el-input
                  id="cfgName"
                  class="aItemTwoInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">超速阀值</span>
              </el-col>
              <el-col span={12} class="aItemTwoItem">
                <el-input
                  id="cfgName"
                  class="aItemTwoInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">持续时间</span>
              </el-col>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="振动" prop="cfgName">
            <div class="aItemOne">
              <el-input
                id="cfgName"
                class="aItemOneInput"
                v-model={this.modelForm.cfgName}
                placeholder="请输入配置名称"
              />
              <span class="aItemTitle color909399">震动阀值</span>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="急加速" prop="productCode1">
            <div class="aItemOne">
              <el-input
                id="cfgName"
                class="aItemOneInput"
                v-model={this.modelForm.cfgName}
                placeholder="请输入配置名称"
              />
              <span class="aItemTitle color909399">加速阀值</span>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="急减速" prop="productCode2">
            <div class="aItemOne">
              <el-input
                id="cfgName"
                class="aItemOneInput"
                v-model={this.modelForm.cfgName}
                placeholder="请输入配置名称"
              />
              <span class="aItemTitle color909399">减速阀值</span>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="急转弯" prop="productCode3">
            <div class="aItemFive">
              <el-col class="aItemFiveItem">
                <el-input
                  id="cfgName"
                  class="aItemFiveInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">转弯阀值</span>
              </el-col>
              <el-col class="aItemFiveItem">
                <el-input
                  id="cfgName"
                  class="aItemFiveInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">低速时速</span>
              </el-col>
              <el-col class="aItemFiveItem">
                <el-input
                  id="cfgName"
                  class="aItemFiveInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">低速角度</span>
              </el-col>
              <el-col class="aItemFiveItem">
                <el-input
                  id="cfgName"
                  class="aItemFiveInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">高速时速</span>
              </el-col>
              <el-col class="aItemFiveItem">
                <el-input
                  id="cfgName"
                  class="aItemFiveInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">高速角度</span>
              </el-col>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="碰撞" prop="productCode3">
            <div class="aItemFour">
              <el-col span={6} class="aItemFourItem">
                <el-input
                  id="cfgName"
                  class="aItemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">碰撞阀值</span>
              </el-col>
              <el-col span={6} class="aItemFourItem">
                <el-input
                  id="cfgName"
                  class="aItemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">检测时长</span>
              </el-col>
              <el-col span={6} class="aItemFourItem">
                <el-input
                  id="cfgName"
                  class="aItemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">持续时长</span>
              </el-col>
              <el-col span={6} class="aItemFourItem">
                <el-input
                  id="cfgName"
                  class="aItemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                />
                <span class="aItemTitle color909399">停车时长</span>
              </el-col>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="批量设置" prop="terminalStatus" class="setBtnGroup">
            <el-radio-group v-model={this.modelForm.terminalStatus} class="btnGroup">
              <el-radio id="availableY" label="3">不批量设置</el-radio>
              <el-radio id="availableN" class="allSet" label="4">批量设置</el-radio>
            </el-radio-group>
            <div class="noAll color909399">(只对当前设备生效)</div>
            <div class="All color909399">(对同类型的其它设备同时生效)</div>
          </el-form-item>
          <div class="Abtn">
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </el-form>
      </el-dialog>
    );
  }
}
