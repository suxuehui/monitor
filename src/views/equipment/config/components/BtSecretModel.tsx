import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Form, FormItem, Input, Button,
} from 'element-ui';
import {
  setBtName, getBtName,
} from '@/api/equipment';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-tag': Tag,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
  },
})
export default class BtSecretModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private time: any;

  @Watch('time')
  onTimeChange() {
    // 查询蓝牙名称
    getBtName(this.data.imei).then((res: any) => {
      if (res.result.resultCode === '0') {
        this.btSecret = res.entity;
      } else {
        this.$message.error('该设备暂无蓝牙名称');
      }
    });
  }

  btSecret: any = '';

  loading: boolean = false;

  // 重置数据
  resetData() {
    this.btSecret = '';
  }

  closeModal() {
    this.$emit('close');
    this.loading = false;
  }

  onSubmit() {
    this.loading = true;
    const obj: any = {
      imei: this.data.imei,
    };
    setBtName(obj).then((res: any) => {
      if (res.result.resultCode === '0') {
        setTimeout(() => {
          this.loading = false;
          this.btSecret = res.entity;
          this.$message.success(res.result.resultMessage);
        }, 1500);
      } else {
        setTimeout(() => {
          this.loading = false;
          this.$message.error(res.result.resultMessage);
        }, 1500);
      }
    });
  }

  render() {
    return (
      <div>
        <el-dialog
          width="540px"
          title="蓝牙秘钥"
          visible={this.visible}
          before-close={this.closeModal}
          close-on-click-modal={false}
        >
          <div style={{ lineHeight: '50px', fontSize: '16px', minHeight: '50px' }}>
            <p style={{ minHeight: '30px' }}>{this.btSecret ? this.btSecret : '暂无蓝牙秘钥'}</p>
            <div style={{ textAlign: 'center' }}>
              <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>重新生成</el-button>
              <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
            </div>
          </div>
        </el-dialog>
      </div >
    );
  }
}
