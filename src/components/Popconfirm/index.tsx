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
  visable: boolean = false;

  @Emit()
  closePop() {
    this.visable = false;
    this.$emit('cancel');
  }
  @Emit()
  openPop() {
    this.visable = false;
    this.$emit('confirm');
  }
  render() {
    return (
      <el-popover
        placement="top"
        width="160"

        v-model={this.visable}
        >
        <p class="pop-confirm-text"><i class="el-icon-warning"></i>{this.title}</p>
          <div class="pop-opreat">
            <el-button size="mini" type="text" on-click={this.closePop}>{this.cancelText}</el-button>
            <el-button type="primary" size="mini" on-click={this.openPop}>{this.okText}</el-button>
          </div>
          <span slot="reference">
            {
              this.$slots.default
            }
          </span>
      </el-popover>
    );
  }
}
