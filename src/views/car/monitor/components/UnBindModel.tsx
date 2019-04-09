import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import {
  Tag, Dialog, Row, Col, Form, FormItem, Input, Button, Checkbox, CheckboxGroup,
} from 'element-ui';
import { unbindTerminal, findBindTerminalList } from '@/api/car';
import './UnBindModel.less';

@Component({
  components: {
    'el-dialog': Dialog,
    'el-tag': Tag,
    'el-row': Row,
    'el-col': Col,
    'el-form': Form,
    'el-form-item': FormItem,
    'el-input': Input,
    'el-button': Button,
    'el-checkbox': Checkbox,
    'el-checkbox-group': CheckboxGroup,
  },
})
export default class BindModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;

  @Prop() private data: any;

  @Prop() private time: any;

  @Watch('time')
  onDataChange() {
    this.allTerminals = [];
    // 获取设备列表
    findBindTerminalList(this.data.id).then((res: any) => {
      const { entity, result } = res;
      if (result.resultCode === '0') {
        this.allTerminals = JSON.parse(JSON.stringify(entity));
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  allTerminals: any = [];

  loading: boolean = false;

  rules = {
    imei: [
      { required: true, message: '请输入imei号', trigger: 'blur' },
    ],
  }

  closeModal() {
    this.$emit('close');
    this.loading = false;
    this.allTerminals = [];
  }

  onSubmit() {
    this.loading = true;
    const imeiList: any = [];
    this.allTerminals.forEach((item: any) => {
      if (item.checked === true) {
        imeiList.push(item.imei);
      }
    });
    const obj: any = {
      imeiList,
    };
    unbindTerminal(obj).then((res) => {
      if (res.result.resultCode === '0') {
        setTimeout(() => {
          this.$message.success(res.result.resultMessage);
          this.closeModal();
          this.$emit('refresh');
          this.$emit('getTerminal', {
            id: this.data.id,
          });
        }, 1500);
      } else {
        setTimeout(() => {
          this.loading = false;
          this.$message.error(res.result.resultMessage);
        }, 1500);
      }
    });
  }

  checkBoxChange(e: any, data: any, indx: number) {
    this.allTerminals.forEach((item: any) => {
      if (data.imei === item.imei) {
        item.checked = e;
      }
    });
  }

  render() {
    return (
      <div>
        <el-dialog
          width="500px"
          title="解绑设备"
          visible={this.visible}
          before-close={this.closeModal}
          close-on-click-modal={false}
        >
          <div class="boxGroup">
            {
              this.allTerminals.length ? this.allTerminals.map((item: any, index: number) => <div class="boxItem">
                <el-checkbox
                  style={{ marginRight: '10px' }}
                  id={item.field}
                  on-change={(e: any) => this.checkBoxChange(e, item, index)}
                ></el-checkbox><span class="itemTitle">{item.wireless === 0 ? '有线设备' : '无线设备'} {item.terminalModel} {item.imei}</span>
              </div>) : <div style={{ lineHeight: '50px', fontSize: '20px', textAlign: 'center' }}>暂无设备信息</div>
            }
          </div>
          <div style={{ textAlign: 'center' }}>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.onSubmit}>保存</el-button>
            <el-button size="small" id="cancel" on-click={this.closeModal}>取消</el-button>
          </div>
        </el-dialog>
      </div >
    );
  }
}
