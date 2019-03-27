import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Form, FormItem, Input, Button,
} from 'element-ui';
import {
  setBtName,
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

  @Watch('time')
  onTimeChange(data: any) {
    console.log(this.data);
    this.modelForm = {
      vin: this.data.productCode,
    };
  }

  modelForm: any = {
    vin: '',
  };

  loading: boolean = false;

  rules = {
    vin: [
      { required: true, validator: this.checkBtName, trigger: 'blur' },
    ],
  }

  // 验证理由
  checkBtName(rule: any, value: string, callback: Function) {
    setTimeout(() => {
      if (value) {
        const exp: any = /^[a-zA-Z0-9]{1,16}/;
        console.log(exp.test(value));
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
    };
    From.validate((valid: any) => {
      if (valid) {
        console.log(1);
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
            <el-form-item label="蓝牙名称" prop="vin">
              <el-input
                id="vin"
                v-model={this.modelForm.vin}
                placeholder="请输入蓝牙名称"
              ></el-input>
            </el-form-item>
          </el-form>
          <div class="bindBtn">
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </el-dialog>
      </div >
    );
  }
}
