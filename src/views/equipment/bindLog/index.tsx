import { Component, Vue } from 'vue-property-decorator';
import { Card, Form, FormItem, Input, Row, Col, Tag, Tooltip, Button } from 'element-ui';
import { tableList, Opreat } from '@/interface';
import { terminalInfo } from '@/api/equipment';
import MTable from '@/components/FilterTable/MTable';
import CheckLogModel from '@/views/equipment/bindLog/components/CheckLogModel';
import CheckPicModel from '@/views/equipment/bindLog/components/CheckPicModel';
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
  'el-button' :Button,
  'checkLog-model': CheckLogModel,
  'checkPic-model': CheckPicModel,
  'el-tag': Tag,
  'el-tooltip': Tooltip,
  },
  name:'BindLog'
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
  opreat: Opreat[] = [
    {
      key: 'checkLog',
      rowKey: 'id',
      color: 'blue',
      text: '验收记录',
      roles: true,
    },
  ];
  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName' },
    { label: '操作人员', prop: 'opsRealName', formatter: this.opsPerson },
    { label: '操作类型', prop: 'opsType', formatter: this.typeChange },
    { label: '操作时间', prop: 'crtTime' },
    { label: '安装图片', prop: 'installUrl', formatter: this.showInstallPic },
    { label: '车架图片', prop: 'vinUrl', formatter: this.showVinPic },
  ];

  // 新增、导出按钮展示
  acceptBtn: boolean = true;
  created() {
    const getNowRoles: string[] = [
      // 操作
      '/terminal/accept/list',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.opreat[0].roles = !!(res[0]);
    });
    // id、imei
    this.tableParams = {
      page: true,
      pageNum: 1,
      pageSize: 5,
      imei: this.$route.query.imei,
    };
    this.defaultPageSize = 5;
    if (this.$route.query.id) {
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
  }

  // 验收记录
  checkLogVisible: boolean = false;
  checkLogId: any = {};
  // 查看图片
  checkPicVisible: boolean = false;
  checkPicUrl: string = '';
  checkPicTitle: string = '';

  opsPerson(row: any) {
    const str= `${row.opsOrgName}--${row.opsRealName}--${row.opsUsername}`;
    return row.opsOrgName && row.opsRealName && row.opsUsername ?
      <el-tooltip class="item" effect="dark" content={str} placement="top">
        <div>
          <p>{`${row.opsOrgName}--${row.opsRealName}`}</p>
          <p>{`(${row.opsUsername})`}</p>
        </div>
      </el-tooltip>: '--';
  }

  showInstallPic(row: any) {
    if (row.installUrl !== null) {
      const imgArr = row.installUrl.indexOf(',') > 0 ? row.installUrl.split(',') : [row.installUrl];
      return imgArr.map((item: any, index: number) =>
        <div on-click={() => this.clickInstall(item, index)} class="pic">
          <img alt="安装图片" style="maxHeight:30px;marginRight:5px" src={item} />
        </div>);
    }
    return '暂无安装图片';
  }

  typeChange(row: any) {
    let type;
    switch (row.opsType) {
      case '解绑':
        type = <el-tag type="danger">解绑</el-tag>;
        break;
      case '安绑':
        type = <el-tag type="success">安绑</el-tag>;
        break;
      default:
        type = <el-tag type="info">未知状态</el-tag>;
        break;
    }
    return type;
  }

  showVinPic(row: any) {
    if (row.vinUrl !== null) {
      const imgArr = row.vinUrl.indexOf(',') > 0 ? row.vinUrl.split(',') : [row.vinUrl];
      return imgArr.map((item: any, index: number) =>
        <div on-click={() => this.clickInstall(item, index)} class="pic">
          <img alt="安装图片" style="maxHeight:30px;marginRight:5px" src={item} />
        </div>);
    }
    return '暂无车架图片';
  }

  clickInstall(url: string, key: number) {
    this.checkPicTitle = '查看图片';
    this.checkPicVisible = true;
    this.checkPicUrl = url;
  }

  checkLogChange(data: any) {
    this.checkLogVisible = true;
    this.checkLogId = data.id;
  }

  // 关闭弹窗
  closeModal(): void {
    this.checkLogVisible = false;
    this.checkPicVisible = false;
    setTimeout(() => {
      this.checkLogId = {};
      this.checkPicUrl = '';
      this.checkPicTitle = '';
    }, 200);
  }

  tableClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'checkLog') {
      this.checkLogVisible = true;
      this.checkLogId = row.id;
    }
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
                    placeholder="请选择所属商户"
                    disabled
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={8}>
                <el-form-item label="车牌号" prop="plateNum">
                  <el-input
                    v-model={this.modelForm.plateNum}
                    placeholder="请输入车牌号"
                    disabled
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col span={8}>
                <el-form-item label="车架号" prop="vin">
                  <el-input
                    v-model={this.modelForm.vin}
                    placeholder="请输入车架号"
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
        <checkPic-model
          title={this.checkPicTitle}
          data={this.checkPicUrl}
          visible={this.checkPicVisible}
          on-close={this.closeModal}
        >
        </checkPic-model>
      </div>
    );
  }
}
