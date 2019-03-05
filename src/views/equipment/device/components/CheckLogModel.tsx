import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Dialog, Row, Col, Button, Form, FormItem, Input,
} from 'element-ui';
import { tableList, Opreat } from '@/interface';
import MTable from '@/components/FilterTable/MTable';
@Component({
  components: {
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-input': Input,
    'el-form-item': FormItem,
    'el-button': Button,
    'm-table': MTable,
  },
})
export default class CheckLogModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private time: any;

  loading: boolean = false;

  modelForm: any = {
  };
  tableParams: any = {
    page: true,
    pageNum: 1,
    pageSize: 5,
  }

  defaultPageSize: any = null;

  url: string = '/terminal/ops/list';

  opreat: Opreat[] = [
    
  ];

  created() {
    // id、imei
    this.tableParams = {
      page: true,
      pageNum: 1,
      pageSize: 5,
      imei: this.$route.query.imei,
    };
    this.defaultPageSize = 5;
  }

  // 表格参数
  tableList: tableList[] = [
    { label: '所属商户', prop: 'orgName' },
    { label: '操作人员', prop: 'opsRealName' },
    { label: '操作类型', prop: 'opsType'},
    { label: '操作时间', prop: 'crtTime' },
    { label: '安装图片', prop: 'installUrl' },
    { label: '车架图片', prop: 'vinUrl'},
  ];

  closeModal() {
    this.$emit('close');
    setTimeout(() => {
      this.modelForm = {
        mainAddress: '',
        secondAddress: '',
      };
    }, 200);
  }

  tableClick(key: string, row: any) { }

  render() {
    return (
      <el-dialog
        width="660px"
        title="设备日志"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
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
      </el-dialog>
    );
  }
}
