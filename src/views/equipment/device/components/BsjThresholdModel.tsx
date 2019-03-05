import {
  Component, Prop, Vue,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button, Form, FormItem, Input, InputNumber, Radio, RadioGroup,
} from 'element-ui';

import './BsjThresholdModel.less';

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
    console.log(this.data.imei);
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
        <el-form model={this.modelForm} status-icon ref="modelForm" label-width="90px" class="model">
          <el-form-item label="振动" prop="cfgName">
            <div class="itemOne">
              <el-input-number
                id="cfgName"
                class="itemOneInput"
                v-model={this.modelForm.cfgName}
                placeholder="请输入配置名称"
                controls-position="right"
                min={0}
              />
              <span class="itemOneTitle color909399">震动阀值</span>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="急加速" prop="productCode1">
            <div class="itemOne">
              <el-input-number
                id="cfgName"
                class="itemOneInput"
                v-model={this.modelForm.cfgName}
                placeholder="请输入配置名称"
                controls-position="right"
                min={0}
              />
              <span class="itemOneTitle color909399">加速阀值</span>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="急减速" prop="productCode2">
            <div class="itemOne">
              <el-input-number
                id="cfgName"
                class="itemOneInput"
                v-model={this.modelForm.cfgName}
                placeholder="请输入配置名称"
                controls-position="right"
                min={0}
              />
              <span class="itemOneTitle color909399">减速阀值</span>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="急转弯" prop="productCode3">
            <div class="itemFour">
              <el-col span={6} class="itemFourItem">
                <el-input-number
                  id="cfgName"
                  class="itemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemFourTitle color909399">低速时速</span>
              </el-col>
              <el-col span={6} class="itemFourItem">
                <el-input-number
                  id="cfgName"
                  class="itemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemFourTitle color909399">低速角度</span>
              </el-col>
              <el-col span={6} class="itemFourItem">
                <el-input-number
                  id="cfgName"
                  class="itemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemFourTitle color909399">高速时速</span>
              </el-col>
              <el-col span={6} class="itemFourItem">
                <el-input-number
                  id="cfgName"
                  class="itemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemFourTitle color909399">高速角度</span>
              </el-col>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="碰撞" prop="productCode3">
            <div class="itemFour">
              <el-col span={6} class="itemFourItem">
                <el-input-number
                  id="cfgName"
                  class="itemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemFourTitle color909399">碰撞阀值</span>
              </el-col>
              <el-col span={6} class="itemFourItem">
                <el-input-number
                  id="cfgName"
                  class="itemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemFourTitle color909399">检测时长</span>
              </el-col>
              <el-col span={6} class="itemFourItem">
                <el-input-number
                  id="cfgName"
                  class="itemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemFourTitle color909399">持续时长</span>
              </el-col>
              <el-col span={6} class="itemFourItem">
                <el-input-number
                  id="cfgName"
                  class="itemFourInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemFourTitle color909399">停车时长</span>
              </el-col>
              <el-button type="text" class="btn">默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="翻滚" prop="productCode3">
            <div class="itemThree">
              <el-col span={8} class="itemThreeItem">
                <el-input-number
                  id="cfgName"
                  class="itemThreeInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemThreeTitle color909399">翻滚角度</span>
              </el-col>
              <el-col span={8} class="itemThreeItem">
                <el-input-number
                  id="cfgName"
                  class="itemThreeInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemThreeTitle color909399">翻滚变化</span>
              </el-col>
              <el-col span={8} class="itemThreeItem">
                <el-input-number
                  id="cfgName"
                  class="itemThreeInput"
                  v-model={this.modelForm.cfgName}
                  placeholder="请输入配置名称"
                  controls-position="right"
                  min={0}
                />
                <span class="itemThreeTitle color909399">停车时长</span>
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
        </el-form>
      </el-dialog>
    );
  }
}
