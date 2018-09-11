import { Component, Vue, Emit } from 'vue-property-decorator';
import { Card, Form, FormItem, Input, Row, Col } from 'element-ui';
import { FilterFormList, tableList, Opreat } from '@/interface';
import { terminalInfo } from '@/api/equipment';
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
  tableParams: any = {
    page: true,
    pageNum: 1,
    pageSize: 5,
  }
  defaultPageSize: any = null;
  url: string = '/terminal/ops/list';
  opreat: Opreat[] = [];
  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName', formatter: (row: any) => (row.orgName ? row.orgName : '--') },
    { label: '操作人员', prop: 'opsRealName', formatter: this.opsPerson },
    { label: '操作时间', prop: 'opsRealName', formatter: this.opsPerson },
    { label: '操作时间', prop: 'crtTime', formatter: (row: any) => (row.crtTime ? row.crtTime : '--') },
    { label: '安装图片', prop: 'installUrl', formatter: this.showInstallPic },
    { label: '车架图片', prop: 'vinUrl', formatter: this.showVinPic },
    { label: '操作', prop: 'hostVer', formatter: this.checkLog },
  ];
  created() {
    // id、imei
    this.tableParams = {
      page: true,
      pageNum: 1,
      pageSize: 5,
      terminalId: this.$route.query.id,
    };
    this.defaultPageSize = 5;
    terminalInfo(this.$route.query.id).then((res) => {
      if (res.result.resultCode === '0') {
        this.modelForm = {
          orgName: res.entity.orgName !== null ? res.entity.orgName : '--',
          plateNum: res.entity.plateNum !== null ? res.entity.plateNum : '--',
          vin: res.entity.vin !== null ? res.entity.vin : '--',
        };
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  checkLogVisible: boolean = false;
  checkLogId: any = {};

  opsPerson(row: any) {
    return <div>
      <p>{`${row.opsOrgName}--${row.opsRealName}`}</p>
      <p>{`(${row.opsUsername})`}</p>
    </div>;
  }

  showInstallPic(row: any) {
    if (row.installUrl !== null) {
      const imgArr = row.installUrl.indexOf(',') > 0 ? row.installUrl.split(',') : [row.installUrl];
      return imgArr.map((item: any) => <img alt="安装图片" style="width:60px;maxHeight:36px;marginRight:5px" src={item} />);
    }
    return '暂无安装图片';
  }

  showVinPic(row: any) {
    if (row.vinUrl !== null) {
      const imgArr = row.vinUrl.indexOf(',') > 0 ? row.vinUrl.split(',') : [row.vinUrl];
      return imgArr.map((item: any) => <img alt="安装图片" style="width:60px;maxHeight:36px;marginRight:5px" src={item} />);
    }
    return '暂无车架图片';
  }

  checkLog(row: any) {
    return <a class="check-link" on-click={() => this.checkLogChange(row)}>验收记录</a>;
  }

  checkLogChange(data: any) {
    this.checkLogVisible = true;
    this.checkLogId = data.id;
    const checkModel: any = this.$refs.checkLogModel;
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
              defaultPageSize={this.defaultPageSize}
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
