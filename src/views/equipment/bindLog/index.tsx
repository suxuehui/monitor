import { Component, Vue, Emit } from 'vue-property-decorator';
import { Card, Form, FormItem, Input, Row, Col } from 'element-ui';
import { FilterFormList, tableList, Opreat } from '@/interface';
import MTable from '@/components/FilterTable/MTable';
import { getOpsList } from '@/api/equipment';
import './index.less';

@Component({
  components: {
  'el-card': Card,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-input': Input,
  'el-row': Row,
  'el-col': Col,
  "m-table": MTable
  }
  })
export default class BindLog extends Vue {
  modelForm: any = {}
  tableParams: any = {}
  // 请求地址
  url: string = `/device/terminal/log/${this.tableParams.imei}`;
  // 表格数据返回格式
  tableBackData: object = {
    code: 'result.resultCode',
    codeOK: '0',
    message: 'result.resultMessage',
    data: '',
    total: '',
  }
  opreat: Opreat[] = [];
  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName', formatter: this.opsPerson },
    { label: '安绑员', prop: 'opsRealName' },
    { label: '安绑时间', prop: 'imei' },
    { label: '安装拍照', prop: 'cfgVer' },
    { label: '车架拍照', prop: 'hardVer' },
    { label: '验收记录', prop: 'hostVer' },
  ];
  mounted() {
    this.modelForm = this.$route.params;
    this.tableParams = this.$route.query;
    const obj: any = {
      page: false,
      pageNum: 0,
      pageSize: 10,
      terminalId: this.tableParams.id,
    };
    getOpsList(obj).then((res) => {
      if (res.result.resultCode==='0') {
        console.log(res.entity);
        // this.tableBackData ={
        //   data: res.entity.data,
        //   total: res.entity.total,
        // };
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  opsPerson(row:any) {
    return 1;
  }

  tableClick() {
    console.log(1);
  }
  render(h: any) {
    return (
      <div class="container">
        <el-card class="box-card">
          <el-form model={this.modelForm} ref="modelForm" label-width="100px" class="model">
            <div class="header">
              <span class="title">当前安绑车辆</span>
            </div>
            <el-row>
              <el-col span={8}>
                <el-form-item label="所属商户" prop="orgName">
                  <el-input
                    v-model={this.modelForm.orgName}
                    placeholder="请选择品牌车型"
                    disabled
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={8}>
                <el-form-item label="车牌号" prop="plateNum">
                  <el-input
                    v-model={this.modelForm.plateNum}
                    placeholder="请选择品牌车型"
                    disabled
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={8}>
                <el-form-item label="车架号" prop="vin">
                  <el-input
                    v-model={this.modelForm.vin}
                    placeholder="请选择品牌车型"
                    disabled
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="header">
            <span class="title">历史安绑记录</span>
          </div>
          <m-table
            ref="MTable"
            class="mTable"
            table-list={this.tableList}
            url={this.url}
            row-key="rowKey"
            fetchType='get'
            opreat={this.opreat}
            opreat-width={'180px'}
            BackParams={this.tableBackData}
            table-params={this.tableParams}
            on-tableClick={this.tableClick}
          />
        </el-card>
      </div>
    );
  }
}
