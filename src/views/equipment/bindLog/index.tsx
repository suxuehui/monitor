import { Component, Vue, Emit } from 'vue-property-decorator';
import { Card, Form, FormItem, Input, Row, Col } from 'element-ui';
import { FilterFormList, tableList, Opreat } from '@/interface';
import MTable from '@/components/FilterTable/MTable';
import CheckLogModel from '@/views/equipment/bindLog/components/CheckLogModel';
import './index.less';

const noPic = require('@/assets/noPic.png');
@Component({
  components: {
  'el-card': Card,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-input': Input,
  'el-row': Row,
  'el-col': Col,
  "m-table": MTable,
  'checkLog-model': CheckLogModel
  }
  })
export default class BindLog extends Vue {
  modelForm: any = {}
  tableParams: any = {}
  url: string = '/terminal/ops/list';
  opreat: Opreat[] = [];
  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName', formatter: (row: any) => (row.orgName ? row.orgName : '--') },
    { label: '安绑员', prop: 'opsRealName', formatter: this.opsPerson },
    { label: '安绑时间', prop: 'crtTime', formatter: (row: any) => (row.crtTime ? row.crtTime : '--') },
    { label: '安装拍照', prop: 'installUrl', formatter: this.showInstallPic },
    { label: '车架拍照', prop: 'vinUrl', formatter: this.showVinPic },
    { label: '验收记录', prop: 'hostVer', formatter: this.checkLog },
  ];
  created() {
    // 所属商户、车牌号、车架号
    this.modelForm = this.$route.params;
    this.modelForm.orgName = this.modelForm.orgName !== null ? this.modelForm.orgName : '--';
    this.modelForm.plateNum = this.modelForm.plateNum !== null ? this.modelForm.plateNum : '--';
    this.modelForm.vin = this.modelForm.vin !== null ? this.modelForm.vin : '--';
    // id、imei
    this.tableParams = {
      page: true,
      pageNum: 1,
      pageSize: 10,
      terminalId: this.$route.query.id,
    };
  }

  checkLogVisible: boolean = false;
  checkLogId: any = {};

  opsPerson(row: any) {
    return <div>
      <p>{`${row.opsOrgName}+${row.opsRealName}`}</p>
      <p>{`(${row.opsUsername})`}</p>
    </div>;
  }

  showInstallPic(row: any) {
    const imgArr = row.installUrl.indexOf(',') > 0 ? row.installUrl.split(',') : [row.installUrl];
    return imgArr.map((item: any) => <img alt="安装图片" style="width:60px;maxHeight:36px;marginRight:5px" src={item} />);
  }

  showVinPic(row: any) {
    const imgArr = row.vinUrl.indexOf(',') > 0 ? row.vinUrl.split(',') : [row.vinUrl];
    return imgArr.map((item: any) => <img alt="安装图片" style="width:60px;maxHeight:36px;marginRight:5px" src={item} />);
  }

  checkLog(row: any) {
    return <a class="check-link" on-click={() => this.checkLogChange(row)}>查看</a>;
  }

  checkLogChange(data: any) {
    this.checkLogVisible = true;
    this.checkLogId = data.id;
    // this.$refs.checkLogModel.$refs.reload();
  }

  // 关闭弹窗
  closeModal(): void {
    this.checkLogVisible = false;
  }

  tableClick() { }

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
                    placeholder="请选择所属商户"
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
          <div class="table">
            <m-table
              ref="MTable"
              class="mTable"
              table-list={this.tableList}
              table-params={this.tableParams}
              url={this.url}
              row-key="rowKey"
              fetchType='post'
              dataType={'JSON'}
              opreat={this.opreat}
              opreat-width={'180px'}
              on-tableClick={this.tableClick}
            />
          </div>
        </el-card>
        <checkLog-model
          ref="checkLogModel"
          data={this.checkLogId}
          visible={this.checkLogVisible}
          on-close={this.closeModal}
        >
        </checkLog-model>
      </div>
    );
  }
}
