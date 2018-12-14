import {
  Component, Prop, Emit, Vue, Inject, Provide,
} from 'vue-property-decorator';
import {
  Popover, Button, Dialog, Row, Col,
} from 'element-ui';
import './index.less';

@Component({
  components: {
    'el-popover': Popover,
    'el-button': Button,
    'el-dialog': Dialog,
    'el-row': Row,
    'el-col': Col,
  },
})
export default class Popconfirm extends Vue {
  @Prop({ default: '操作确认！' }) private title!: string;

  @Prop({ default: '取消' }) private cancelText!: string;

  @Prop({ default: '确定' }) private okText!: string;

  @Prop({ default: '160' }) private width!: string;

  @Prop() private keyName!: string;

  @Prop({ default: false }) private disabled!: boolean;

  visible: boolean = false;

  loading: boolean = false;

  @Emit()
  closeModel() {
    this.visible = false;
  }

  @Emit()
  closePop() {
    this.visible = false;
    this.$emit('cancel');
  }

  @Emit()
  openPop(e: any) {
    this.loading = true;
    e.stopPropagation();
    setTimeout(() => {
      this.$emit('confirm');
      this.loading = false;
      this.visible = false;
    }, 1500);
  }

  @Emit()
  stopClick(e: any) {
    if (!this.disabled) {
      this.visible = true;
      e.stopPropagation();
    }
  }

  checkOptName(name: String) {
    let str: String = '';
    if (name === 'delete') {
      str = '删除';
    } else if (name === 'unbind') {
      str = '解绑';
    } else if (name === 'freeze') {
      str = '冻结';
    } else if (name === 'forbid') {
      str = '禁用';
    } else if (name === '续期') {
      str = '续期';
    }
    return str;
  }

  render() {
    return (
      <span>
        <span on-click={this.stopClick} slot="reference">
          {
            this.$slots.default
          }
        </span>
        <el-dialog
          top='20vh'
          width="430px"
          title="操作"
          visible={this.visible}
          before-close={this.closePop}
          close-on-click-modal={false}
        >
          <div class="box">
            <p>确定是否进行<span class="info"> {this.checkOptName(this.keyName)} </span>操作？</p>
          </div>
          <div>
            <el-button size="small" type="primary" id="submit" loading={this.loading} on-click={this.openPop}>{this.okText}</el-button>
            <el-button size="small" id="cancel" on-click={this.closePop}>{this.cancelText}</el-button>
          </div>
        </el-dialog>
      </span>
    );
  }
}
