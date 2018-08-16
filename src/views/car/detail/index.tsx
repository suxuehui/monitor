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
    shopName: '',
    brandModel: '',
    energyType: '',
    oilVolume: '',
    protocol: '',
    confName: '',
    confVersion: '',
    hostVersion: '',
    hardwareVersion: '',
    reboot: '',
    cfgParam: '',
    status: '',
  };

  loading: boolean = false;
  customerList: Array<any> = [];
  id: number = 1;
  mounted() {
    getCustomerList(null).then((res) => {
      res.entity.data.forEach((element: any) => {
        this.customerList.push({
          key: element.orgName,
          value: element.id,
          label: element.orgName,
        });
      });
    });
    this.id = parseInt(this.$route.query.id, 10) ? parseInt(this.$route.query.id, 10) : 0;
    if (this.id > 0) {
      vehicleModelInfo({ id: this.id }).then((res) => {
        res.entity.reboot = `${res.entity.reboot}`;
        res.entity.status = `${res.entity.status}`;
        this.modelForm = res.entity;
      });
    }
  }
  // 电动、燃油、混动
  oilType: OilType[] = [
    { key: 1, value: '1', label: '电动' },
    { key: 2, value: '2', label: '燃油' },
    { key: 3, value: '3', label: '混动' },
  ]


  rules = {
    // shopName: [
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
      shopName: this.modelForm.shopName,
      energyType: this.modelForm.energyType,
      // brandName,
      // modelName,
      oilVolume: this.modelForm.oilVolume,
      protocol: this.modelForm.protocol,
      confName: this.modelForm.confName,
      confVersion: this.modelForm.confVersion,
      hostVersion: this.modelForm.hostVersion,
      hardwareVersion: this.modelForm.hardwareVersion,
      reboot: this.modelForm.reboot,
      cfgParam: this.modelForm.cfgParam,
      status: this.modelForm.status,
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
          this.loading=false;
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
                <el-form-item label="所属商户" prop="shopName">
                  <el-select
                    id="shopName"
                    v-model={this.modelForm.shopName}
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
                <el-form-item label="品牌车型" prop="brandName">
                  <el-input
                    id="brandName"
                    v-model={this.modelForm.brandName}
                    placeholder="请选择品牌车型"
                  ></el-input>
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
                <el-form-item label="油箱容量" prop="oilVolume">
                  <el-input
                    id="oilVolume"
                    v-model={this.modelForm.oilVolume}
                    placeholder="请输入油箱容量"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="配置协议" prop="protocol">
                  <el-input
                    id="protocol"
                    v-model={this.modelForm.protocol}
                    placeholder="请选择配置协议"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="配置文件名" prop="confName">
                  <el-input
                    id="confName"
                    v-model={this.modelForm.confName}
                    placeholder="请输入配置文件名"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="配置版本号" prop="confVersion">
                  <el-input
                    id="confVersion"
                    v-model={this.modelForm.confVersion}
                    placeholder="请输入配置版本号"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="主机版本号" prop="hostVersion">
                  <el-input
                    id="hostVersion"
                    v-model={this.modelForm.hostVersion}
                    placeholder="请输入主机版本号"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12}>
                <el-form-item label="硬件版本号" prop="hardwareVersion">
                  <el-input
                    id="hardwareVersion"
                    v-model={this.modelForm.hardwareVersion}
                    placeholder="请输入硬件版本号"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={12} class="radioGroup">
                <el-form-item label="是否重启" prop="reboot">
                  <el-radio v-model={this.modelForm.reboot} id="reboot" label="true">是</el-radio>
                  <el-radio v-model={this.modelForm.reboot} id="reboot" label="false">否</el-radio>
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
                <el-form-item label="是否启用" prop="status">
                  <div class="radioGroup">
                    <el-radio v-model={this.modelForm.status} id="status" label="true">是</el-radio>
                    <el-radio v-model={this.modelForm.status} id="status" label="false">否</el-radio>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        <el-row class="btn">
          <el-col offset={12}>
            <el-button class="btn" id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
          </el-col>
        </el-row>
      </div >
    );
  }
}
