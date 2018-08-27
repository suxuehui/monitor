import { Component, Vue } from 'vue-property-decorator';
import { Card, Button, Row, Form, Col, FormItem, Input, Select, Option, Radio } from 'element-ui';
import { getCustomerList } from '@/api/customer';
import { vehicleModelAdd, vehicleModelUpdate, vehicleModelInfo } from '@/api/car';
import './index.less';

interface OilType { key: any, value: any, label: string }

@Component({
  components: {
  'el-card': Card,
  'el-button': Button,
  'el-row': Row,
  'el-col': Col,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-input': Input,
  'el-select': Select,
  'el-option': Option,
  'el-radio': Radio,
  }
  })

export default class Detail extends Vue {
  modelForm: any = {
    levelcode: '',
    brandModel: '',
    energyType: '',
    fuelTankCap: '',
    cfgVer: '',
    cfgName: '',
    hostVer: '',
    hardWareVer: '',
    reboot: '',
    protocolName: '',
    cfgParam: '',
    available: '',
  };

  loading: boolean = false;
  customerList: Array<any> = [];
  id: number = 0;
  mounted() {
    getCustomerList(null).then((res) => {
      console.log(res);
      // res.entity.data.forEach((element: any) => {
      //   this.customerList.push({
      //     key: element.orgName,
      //     value: element.id,
      //     label: element.orgName,
      //   });
      // });
    });
    this.id = parseInt(this.$route.query.id, 10) ? parseInt(this.$route.query.id, 10) : 0;
    if (this.id > 0) {
      vehicleModelInfo({ id: this.id }).then((res) => {
        res.entity.reboot = `${res.entity.reboot}`;
        res.entity.available = `${res.entity.available}`;
        this.modelForm = res.entity;
      });
    }
  }
  // 电动、燃油、混动
  oilType: OilType[] = [
    { key: 1, value: '1', label: '燃油' },
    { key: 2, value: '2', label: '电动' },
    { key: 3, value: '3', label: '混动' },
    { key: 4, value: '4', label: '汽油' },
  ]

  rules = {
    // levelcode: [
    //   { required: true, message: '请输入角色名称', trigger: 'blur' },
    // ],
    // cfgParam: [
    //   { required: true, message: '请输入职能描述', trigger: 'blur' },
    // ],
  }

  onSubmit() {
    let obj: any = {};
    const From: any = this.$refs.modelForm;
    obj = {
      levelcode: this.modelForm.levelcode,
      cfgName: this.modelForm.cfgName,
      cfgVer: this.modelForm.cfgVer,
      hostVer: this.modelForm.hostVer,
      hardWareVer: this.modelForm.hardWareVer,
      protocolName: this.modelForm.protocolName,
      // brandId,
      // modelId,
      energyType: this.modelForm.energyType,
      fuelTankCap: this.modelForm.fuelTankCap,
      reboot: this.modelForm.reboot,
      cfgParam: this.modelForm.cfgParam,
      available: this.modelForm.available,
    };
    if (this.id > 0) {
      // 编辑
      From.validate((valid: any) => {
        if (valid) {
          console.log('编辑');
        } else {
          return false;
        }
        return false;
      });
    } else {
      // 新增
      From.validate((valid: any) => {
        if (valid) {
          console.log('新增');
        } else {
          this.loading = false;
          return false;
        }
        return false;
      });
    }
  }

  render() {
    return (
      <div class="container">
        <el-card class="box-card">
          <el-form model={this.modelForm} rules={this.rules} ref="modelForm" label-width="100px" class="model">
            <div class="header">
              <span class="title">基本配置</span>
            </div>
            <el-row>
              <el-col span={12}>
                <el-form-item label="所属商户" prop="levelcode">
                  <el-select
                    id="levelcode"
                    v-model={this.modelForm.levelcode}
                    filterable={true}
                    placeholder="请选择商户"
                    style="width:100%"
                  >
                    {
                      this.customerList.map((item: any) => (
                        <el-option value={item.value} label={item.label} >{item.label}</el-option>
                      ))
                    }
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                {/* <el-form-item label="品牌车型" prop="brandName">
                  <el-input
                    id="brandName"
                    v-model={this.modelForm.brandName}
                    placeholder="请选择品牌车型"
                  ></el-input>
                </el-form-item> */}
                 <el-form-item label="品牌车型" prop="brandName">
                  <el-select
                    id="brandName"
                    v-model={this.modelForm.brandName}
                    filterable={true}
                    placeholder="请选择品牌车型"
                    style="width:100%"
                  >
                    {
                      this.oilType.map((item: any) => (
                        <el-option value={item.value} label={item.label} >{item.label}</el-option>
                      ))
                    }
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="能源类型" prop="energyType">
                  <el-select
                    id="energyType"
                    v-model={this.modelForm.energyType}
                    filterable={true}
                    placeholder="请选择能源类型"
                    style="width:100%"
                  >
                    {
                      this.oilType.map((item: any) => (
                        <el-option value={item.value} label={item.label} >{item.label}</el-option>
                      ))
                    }
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="油箱容量" prop="fuelTankCap">
                  <el-input
                    id="fuelTankCap"
                    v-model={this.modelForm.fuelTankCap}
                    placeholder="请输入油箱容量"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="配置协议" prop="protocolName">
                  <el-input
                    id="protocolName"
                    v-model={this.modelForm.protocolName}
                    placeholder="请选择配置协议"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="配置文件名" prop="cfgName">
                  <el-input
                    id="cfgName"
                    v-model={this.modelForm.cfgName}
                    placeholder="请输入配置文件名"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="配置版本号" prop="cfgVer">
                  <el-input
                    id="cfgVer"
                    v-model={this.modelForm.cfgVer}
                    placeholder="请输入配置版本号"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="主机版本号" prop="hostVer">
                  <el-input
                    id="hostVer"
                    v-model={this.modelForm.hostVer}
                    placeholder="请输入主机版本号"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="硬件版本号" prop="hardWareVer">
                  <el-input
                    id="hardWareVer"
                    v-model={this.modelForm.hardWareVer}
                    placeholder="请输入硬件版本号"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12} class="radioGroup">
                <el-form-item label="是否重启" prop="reboot">
                  <el-radio v-model={this.modelForm.reboot} id="rebootY" label="true">是</el-radio>
                  <el-radio v-model={this.modelForm.reboot} id="rebootN" label="false">否</el-radio>
                  <p class="reStart">( 设备下发配置成功后是否重启设备 )</p>
                </el-form-item>
              </el-col>
            </el-row>
            <div class="header">
              <span class="title">参数配置</span>
            </div>
            <el-row>
              <el-col span={24}>
                <el-form-item label="配置参数" prop="cfgParam">
                  <el-input
                    id="cfgParam"
                    v-model={this.modelForm.cfgParam}
                    placeholder="请输入配置参数"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={24}>
                <el-form-item label="是否启用" prop="available">
                  <div class="radioGroup">
                    <el-radio v-model={this.modelForm.available} id="availableY" label="true">是</el-radio>
                    <el-radio v-model={this.modelForm.available} id="availableN" label="false">否</el-radio>
                  </div>
                </el-form-item>
              </el-col>
              <el-col offset={12} class="btn">
                <el-button id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div >
    );
  }
}
