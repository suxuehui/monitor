import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { Dialog } from 'element-ui';
import './CheckModel.less';

@Component({
  components: {
    'el-dialog': Dialog,
  },
})


export default class CheckModel extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop() private data: any;

  // 编辑器
  editor: any = null;
  // 登录用户名
  userName: string = '';
  noticeTitle: any = '';
  loading: boolean = false;

  // 重置数据
  resetData() {
    this.data.title = '';
    this.data.content = '';
  }

  closeModal() {
    this.$emit('close');
  }

  render() {
    return (
      <el-dialog
        width="600px"
        title='查看消息'
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <div class="noticeBox">
          <div class="title">{this.data.title}</div>
          <iframe srcdoc={this.data.content} frameborder="0" class="content" width="400" height="300"></iframe>
        </div>
      </el-dialog>
    );
  }
}
