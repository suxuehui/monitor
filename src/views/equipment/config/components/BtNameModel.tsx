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
export default class BtNameModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private time: any;

  @Watch('data')
  onTimeChange() {
    // 查询蓝牙名称
    getBtName(this.data.imei).then((res: any) => {
      if (res.result.resultCode === '0') {
        this.modelForm.btName = res.entity;
      } else {
        this.$message.error('该设备暂无蓝牙名称');
      }
    });
  }

  modelForm: any = {
    btName: '',
  };

  loading: boolean = false;

  rules = {
    btName: [
      { required: true, validator: this.checkBtName, trigger: 'blur' },
    ],
  }

  // 验证理由
  checkBtName(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const exp: any = /^[a-zA-Z0-9]{1,16}/;
        if (exp.test(value)) {
          callback();
        } else {
          callback(new Error('蓝牙名称格式错误，只能为数字和字母且长度最长为16位！！！'));
        }
      } else {
        callback(new Error('请输入蓝牙名称'));
      }
    }, 500);
  }


  // 重置数据
  resetData() {
    this.modelForm = {};
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    setTimeout(() => {
      From.resetFields();
    }, 200);
    this.loading = false;
  }

  onSubmit() {
    this.loading = true;
    const From: any = this.$refs.modelForm;
    const obj: any = {
      imei: this.data.imei,
      bluetoothName: this.modelForm.btName,
    };
    From.validate((valid: any) => {
      if (valid) {
        setBtName(obj).then((res: any) => {
          if (res.result.resultCode === '0') {
            console.log(res);
            this.loading = false;
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
      return false;
    });
  }

  render() {
    return (
      <div>
        <el-dialog
          width="540px"
          title="蓝牙名称"
          visible={this.visible}
          before-close={this.closeModal}
          close-on-click-modal={false}
        >
          <el-form model={this.modelForm} status-icon rules={this.rules} ref="modelForm" label-width="80px" class="fzkBtNameModel">
            <el-form-item label="蓝牙名称" prop="btName">
              <el-input
                id="btName"
                v-model={this.modelForm.btName}
                placeholder="请输入蓝牙名称"
              ></el-input>
            </el-form-item>
          </el-form>
          {
            this.data.online === 1
              ? <div class="bindBtn">
                <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
                <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
              </div> : null
          }
        </el-dialog>
      </div >
    );
  }
}
