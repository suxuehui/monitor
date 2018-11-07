import { Component, Prop, Emit, Vue, Inject, Provide } from 'vue-property-decorator';
import { Popover, Button } from 'element-ui';
import './index.less';

@Component({
  components: {
  'el-popover': Popover,
  'el-button': Button,
  }
  })
export default class Popconfirm extends Vue {
  @Prop({ default: '操作确认！' }) private title!: string;
  @Prop({ default: '取消' }) private cancelText!: string;
  @Prop({ default: '确定' }) private okText!: string;
  @Prop({ default: '160' }) private width!: string;
  @Prop({ default: false }) private disabled!: boolean;
  @Prop() private loading!: boolean;
  visible: boolean = false;

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
  openPop() {
    if (this.loading === undefined) {
      this.visible = false;
    }
    this.$emit('confirm');
  }

  @Emit()
  stopClick(e:any) {
    e.stopPropagation();
  }

  render() {
    return (
      <el-popover
        placement="top"
        width={this.width}
        v-model={this.visible}
        disabled={this.disabled}
        >
        <p class="pop-confirm-text"><i class="el-icon-warning"></i>{this.title}</p>
          <div class="pop-opreat">
            <el-button size="mini" type="text" on-click={this.closePop}>{this.cancelText}</el-button>
            <el-button type="primary" size="mini" loading={this.loading} on-click={this.openPop}>{this.okText}</el-button>
          </div>
          <span on-click={this.stopClick} slot="reference">
            {
              this.$slots.default
            }
          </span>
      </el-popover>
    );
  }
}
