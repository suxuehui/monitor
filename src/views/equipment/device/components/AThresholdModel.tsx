import {
  Component, Prop, Vue, Emit, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button, Form, FormItem, Input, Radio, RadioGroup,
} from 'element-ui';
import utils from '@/utils';
import {
  searchThrDefaultVal, searchThrVal, setThrVal,
} from '@/api/equipment';
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
    'el-radio-group': RadioGroup,
    'el-radio': Radio,
  },
})
export default class BsjThreshold extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private atime: any;

  loading: boolean = false;

  @Watch('atime')
  onTimeChange(data: any) {
    searchThrVal(this.data.imei).then((res: any) => {
      const { entity, result } = res;
      let obj: any = {};
      if (result.resultCode === '0') {
        obj = {
          batchSetting: 'false',
          ...entity,
        };
        this.modelForm = Object.assign(this.modelForm, obj);
      } else {
        this.$message.error(result.resultMessage);
      }
    });
  }

  modelForm: any = {
    cfgName: '',
    batchSetting: '', // 是否批量设置
    accelerationThreshold: 0, // 急加速加速阈值
    collisionAcceleration: 0, // 碰撞加速度阈值
    collisionDetectionDuration: 0, // 碰撞检测时长
    collisionDuration: 0, // 碰撞持续时长
    collisionStopDuration: 0, // 碰撞停车时长
    decelerationThreshold: 0, // 急减速加速阈值
    flipAngularthreshold: 0, // 翻转角速度阈值，
    flipChangeThreshold: 0, // 翻转变化阈值，
    flipParkingDuration: 0, // 翻转停车时长（秒），
    initialMileage: 0, // 初始里程，
    overSpeedDuration: 0, // 超速持续时间,
    overSpeedSpec: 0, // 超速速度阈值,
    sharpAngleSpec: 0, // 急转弯角度阈值，
    sharpHighAngleThreshold: 0, // 急转弯高速角度阈值W2，
    sharpHighThreshold: 0, // 急转弯高速时速阈值V2，
    sharpLowAngleThreshold: 0, // 急转弯低速角度阈值W1，
    sharpLowSpeed: 0, // 急转弯低速时速阈值V1，
    vibrationAcceleration: 0, // 振动加速度阈值
  };

  rules = {
    vibrationAcceleration: [
      {
        validator: this.checkNum, trigger: 'blur',
      },
    ],
    accelerationThreshold: [
      {
        validator: this.checkNum, trigger: 'blur',
      },
    ],
    decelerationThreshold: [
      {
        validator: this.checkNum, trigger: 'blur',
      },
    ],
    sharpAngle: [
      {
        validator: this.sharpAngleNumRule, trigger: 'blur',
      },
    ],
    collision: [
      {
        validator: this.collisionNumRule, trigger: 'blur',
      },
    ],
    flip: [
      {
        validator: this.flipNumRule, trigger: 'blur',
      },
    ],
    batchSetting: [
      { required: true },
    ],
  }

  // 急转弯规则（4个）
  @Emit()
  sharpAngleNumRule(rule: any, value: string, callback: Function) {
    const {
      sharpLowSpeed, sharpLowAngleThreshold,
      sharpHighThreshold, sharpHighAngleThreshold,
    } = this.modelForm;
    if (sharpLowSpeed !== '' && sharpLowAngleThreshold !== ''
      && sharpHighThreshold !== '' && sharpHighAngleThreshold !== '') {
      if (utils.expNum(sharpLowSpeed) && utils.expNum(sharpLowAngleThreshold)
        && utils.expNum(sharpHighThreshold) && utils.expNum(sharpHighAngleThreshold)) {
        callback();
      } else {
        callback(new Error('阈值输入不合法，请重新输入！'));
      }
    } else {
      callback(new Error('阈值设置不能为空白，请检查！'));
    }
  }

  // 碰撞规则（4个）
  @Emit()
  collisionNumRule(rule: any, value: string, callback: Function) {
    const {
      collisionAcceleration, collisionDetectionDuration,
      collisionDuration, collisionStopDuration,
    } = this.modelForm;
    if (collisionAcceleration !== '' && collisionDetectionDuration !== ''
      && collisionDuration !== '' && collisionStopDuration !== '') {
      if (utils.expNum(collisionAcceleration) && utils.expNum(collisionDetectionDuration)
        && utils.expNum(collisionDuration) && utils.expNum(collisionStopDuration)) {
        callback();
      } else {
        callback(new Error('阈值输入不合法，请重新输入！'));
      }
    } else {
      callback(new Error('阈值设置不能为空白，请检查！'));
    }
  }

  // 翻滚规则（4个）
  @Emit()
  flipNumRule(rule: any, value: string, callback: Function) {
    const {
      flipAngularthreshold, flipChangeThreshold, flipParkingDuration,
    } = this.modelForm;
    if (flipAngularthreshold !== '' && flipChangeThreshold !== ''
      && flipParkingDuration !== '') {
      if (utils.expNum(flipAngularthreshold) && utils.expNum(flipChangeThreshold)
        && utils.expNum(flipParkingDuration)) {
        callback();
      } else {
        callback(new Error('阈值输入不合法，请重新输入！'));
      }
    } else {
      callback(new Error('阈值设置不能为空白，请检查！'));
    }
  }

  // 数值是否为正整数
  @Emit()
  checkNum(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value || parseInt(value, 10) === 0) {
        if (utils.expNum(value)) {
          callback();
        } else {
          callback(new Error('阈值输入不合法，请重新输入！'));
        }
      } else {
        callback(new Error('阈值设置不能为空白，请检查！'));
      }
    }, 500);
  }

  closeModal() {
    this.$emit('close');
    this.loading = false;
    setTimeout(() => {
      this.modelForm = {
        cfgName: '',
        batchSetting: '', // 是否批量设置
        accelerationThreshold: 0, // 急加速加速阈值
        collisionAcceleration: 0, // 碰撞加速度阈值
        collisionDetectionDuration: 0, // 碰撞检测时长
        collisionDuration: 0, // 碰撞持续时长
        collisionStopDuration: 0, // 碰撞停车时长
        decelerationThreshold: 0, // 急减速加速阈值
        flipAngularthreshold: 0, // 翻转角速度阈值，
        flipChangeThreshold: 0, // 翻转变化阈值，
        flipParkingDuration: 0, // 翻转停车时长（秒），
        initialMileage: 0, // 初始里程，
        overSpeedDuration: 0, // 超速持续时间,
        overSpeedSpec: 0, // 超速速度阈值,
        sharpAngleSpec: 0, // 急转弯角度阈值，
        sharpHighAngleThreshold: 0, // 急转弯高速角度阈值W2，
        sharpHighThreshold: 0, // 急转弯高速时速阈值V2，
        sharpLowAngleThreshold: 0, // 急转弯低速角度阈值W1，
        sharpLowSpeed: 0, // 急转弯低速时速阈值V1，
        vibrationAcceleration: 0, // 振动加速度阈值
      };
    }, 200);
  }

  onSubmit() {
    const From: any = this.$refs.modelForm;
    this.loading = true;
    const boo: any = this.modelForm.batchSetting;
    for (const key in this.modelForm) {
      if (this.modelForm[key]) {
        this.modelForm[key] = Number(this.modelForm[key]);
      }
    }
    this.modelForm.batchSetting = boo;
    const obj: any = {
      ...this.modelForm,
      modelId: this.data.terminalModelId,
      imei: this.data.imei,
      batchSetting: !(this.modelForm.batchSetting === 'false'),
    };
    From.validate((valid: any) => {
      if (valid) {
        setThrVal(obj).then((res) => {
          if (res.result.resultCode === '0') {
            setTimeout(() => {
              this.$emit('refresh');
              this.loading = false;
              this.$message.success(res.result.resultMessage);
              From.resetFields();
            }, 1500);
          } else {
            setTimeout(() => {
              this.loading = false;
              this.$message.error(res.result.resultMessage);
            }, 1500);
          }
        });
      } else {
        this.loading = false;
        return false;
      }
      return true;
    });
  }

  // 获取默认值
  getDefaultVal(name: string) {
    const obj = {
      terminalModelType: this.data.terminalModel,
      keyword: name,
    };
    searchThrDefaultVal(obj).then((res: any) => {
      const { result, entity } = res;
      if (result.resultCode === '0') {
        this.setDefaultVal(entity);
        this.$message.success(`${name}默认值设置成功`);
      } else {
        this.$message.error(result.resultMessage);
      }
    });
  }

  // 设置默认值：
  setDefaultVal(data: any) {
    if (data) {
      data.forEach((item: any) => {
        this.modelForm[`${item.name}`] = item.enumValue;
      });
    }
  }

  render() {
    return (
      <el-dialog
        width="760px"
        title="阈值设置2a1"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form model={this.modelForm} rules={this.rules} ref="modelForm" label-width="90px" class="fzkBsjModel">
          <el-form-item label="振动" prop="vibrationAcceleration">
            <div class="bItemOne">
              <el-input
                id="vibrationAcceleration"
                class="bItemOneInput"
                v-model={this.modelForm.vibrationAcceleration}
                placeholder="请输入振动阈值"
              />
              <span class="itemTitle color909399">振动阈值</span>
              <span class="star1">*</span>
              <el-button type="text" class="btn" on-click={() => this.getDefaultVal('振动')}>默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="急加速" prop="accelerationThreshold">
            <div class="bItemOne">
              <el-input
                id="accelerationThreshold"
                class="bItemOneInput"
                v-model={this.modelForm.accelerationThreshold}
                placeholder="请输入加速阈值"
              />
              <span class="itemTitle color909399">加速阈值</span>
              <span class="star2">*</span>
              <el-button type="text" class="btn" on-click={() => this.getDefaultVal('急加速')}>默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="急减速" prop="decelerationThreshold">
            <div class="bItemOne">
              <el-input
                id="decelerationThreshold"
                class="bItemOneInput"
                v-model={this.modelForm.decelerationThreshold}
                placeholder="请输入减速阈值"
              />
              <span class="itemTitle color909399">减速阈值</span>
              <span class="star2">*</span>
              <el-button type="text" class="btn" on-click={() => this.getDefaultVal('急减速')}>默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="急转弯" prop="sharpAngle">
            <div class="bItemFour">
              <el-col span={6} class="bItemFourItem">
                <el-input
                  id="sharpLowSpeed"
                  class="bItemFourInput"
                  v-model={this.modelForm.sharpLowSpeed}
                  placeholder="请输入低速时速"
                />
                <span class="itemTitle color909399">低速时速</span>
              </el-col>
              <el-col span={6} class="bItemFourItem">
                <el-input
                  id="sharpLowAngleThreshold"
                  class="bItemFourInput"
                  v-model={this.modelForm.sharpLowAngleThreshold}
                  placeholder="请输入低速角度"
                />
                <span class="itemTitle color909399">低速角度</span>
              </el-col>
              <el-col span={6} class="bItemFourItem">
                <el-input
                  id="sharpHighThreshold"
                  class="bItemFourInput"
                  v-model={this.modelForm.sharpHighThreshold}
                  placeholder="请输入高速时速"
                />
                <span class="itemTitle color909399">高速时速</span>
              </el-col>
              <el-col span={6} class="bItemFourItem">
                <el-input
                  id="sharpHighAngleThreshold"
                  class="bItemFourInput"
                  v-model={this.modelForm.sharpHighAngleThreshold}
                  placeholder="请输入高速角度"
                />
                <span class="itemTitle color909399">高速角度</span>
              </el-col>
              <span class="star1">*</span>
              <el-button type="text" class="btn" on-click={() => this.getDefaultVal('急转弯')}>默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="碰撞" prop="collision">
            <div class="bItemFour">
              <el-col span={6} class="bItemFourItem">
                <el-input
                  id="collisionAcceleration"
                  class="bItemFourInput"
                  v-model={this.modelForm.collisionAcceleration}
                  placeholder="请输入碰撞阈值"
                />
                <span class="itemTitle color909399">碰撞阈值</span>
              </el-col>
              <el-col span={6} class="bItemFourItem">
                <el-input
                  id="collisionDetectionDuration"
                  class="bItemFourInput"
                  v-model={this.modelForm.collisionDetectionDuration}
                  placeholder="请输入检测时长"
                />
                <span class="itemTitle color909399">检测时长</span>
              </el-col>
              <el-col span={6} class="bItemFourItem">
                <el-input
                  id="collisionDuration"
                  class="bItemFourInput"
                  v-model={this.modelForm.collisionDuration}
                  placeholder="请输入持续时长"
                />
                <span class="itemTitle color909399">持续时长</span>
              </el-col>
              <el-col span={6} class="bItemFourItem">
                <el-input
                  id="collisionStopDuration"
                  class="bItemFourInput"
                  v-model={this.modelForm.collisionStopDuration}
                  placeholder="请输入停车时长"
                />
                <span class="itemTitle color909399">停车时长</span>
              </el-col>
              <span class="star2">*</span>
              <el-button type="text" class="btn" on-click={() => this.getDefaultVal('碰撞')}>默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="翻滚" prop="flip">
            <div class="bItemThree">
              <el-col span={8} class="bItemThreeItem">
                <el-input
                  id="flipAngularthreshold"
                  class="bItemThreeInput"
                  v-model={this.modelForm.flipAngularthreshold}
                  placeholder="请输入翻滚角度"
                />
                <span class="itemTitle color909399">翻滚角度</span>
              </el-col>
              <el-col span={8} class="bItemThreeItem">
                <el-input
                  id="flipChangeThreshold"
                  class="bItemThreeInput"
                  v-model={this.modelForm.flipChangeThreshold}
                  placeholder="请输入翻滚变化"
                />
                <span class="itemTitle color909399">翻滚变化</span>
              </el-col>
              <el-col span={8} class="bItemThreeItem">
                <el-input
                  id="flipParkingDuration"
                  class="bItemThreeInput"
                  v-model={this.modelForm.flipParkingDuration}
                  placeholder="请输入停车时长"
                />
                <span class="itemTitle color909399">停车时长</span>
              </el-col>
              <span class="star1">*</span>
              <el-button type="text" class="btn" on-click={() => this.getDefaultVal('翻滚')}>默认值</el-button>
            </div>
          </el-form-item>
          <el-form-item label="批量设置" prop="batchSetting" class="setBtnGroup">
            <el-radio-group v-model={this.modelForm.batchSetting} class="btnGroup">
              <el-radio id="availableY" label="false">不批量设置</el-radio>
              <el-radio id="availableN" class="allSet" label="true">批量设置</el-radio>
            </el-radio-group>
            <div class="noAll color909399">(只对当前设备生效)</div>
            <div class="All color909399">(对同类型的其它设备同时生效)</div>
          </el-form-item>
          <div class="bsjBtn">
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>确定</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </el-form>
      </el-dialog>
    );
  }
}
