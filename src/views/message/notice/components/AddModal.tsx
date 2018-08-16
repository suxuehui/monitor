import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Tag, Dialog, Row, Col, Form, FormItem, Input, Button } from 'element-ui';
import { getUserInfo } from '@/api/permission';
import { noticeAdd } from '@/api/message';
import './AddModal.less';

@Component({
  components: {
  'el-dialog': Dialog,
  'el-row': Row,
  'el-col': Col,
  'el-form': Form,
  'el-form-item': FormItem,
  'el-input': Input,
  'el-button': Button,
  }
  })


export default class AddModal extends Vue {
  // 筛选表单生成参数
  @Prop({ default: false }) private visible !: boolean;
  @Prop() private data: any;

  // 编辑器
  editor: any = null;
  // 登录用户名
  userName: string = '';
  noticeTitle: any = '';
  loading: boolean = false;

  mounted() {
    getUserInfo(null).then((res) => {
      this.userName = res.entity.userName;
    });
  }

  // 重置数据
  resetData() {
    this.noticeTitle = '';
    this.editor.txt.clear();
  }

  closeModal() {
    this.$emit('close');
    const From: any = this.$refs.modelForm;
    From.resetFields();
    setTimeout(() => {
      this.resetData();
    }, 200);
  }

  onSubmit() {
    let obj: any = {};
    obj = {
      content: this.editor.txt.html(),
      publisher: this.userName,
      title: this.noticeTitle,
    };
    this.loading = true;
    const contentLength = this.editor.txt.html().replace(/<[^>]+>/g, '');
    if (contentLength > 0 && this.noticeTitle) {
      noticeAdd(obj).then((res) => {
        if (res.result.resultCode) {
          setTimeout(() => {
            this.loading = false;
            this.resetData();
            this.$message.success(res.result.resultMessage);
            this.$emit('refresh');
          }, 1500);
        } else {
          setTimeout(() => {
            this.loading = false;
            this.$message.error(res.result.resultMessage);
          }, 1500);
        }
      });
    } else {
      this.$message.error('请填写完成');
      this.loading = false;
    }
  }

  render() {
    if (this.visible && !this.editor) {
      setTimeout(() => {
        this.editor = new window.wangEditor('#editor');
        this.editor.customConfig.menus = [
          'head', // 标题
          'bold', // 粗体
          'fontSize', // 字号
          'fontName', // 字体
          'italic', // 斜体
          'underline', // 下划线
          'strikeThrough', // 删除线
          'foreColor', // 文字颜色
          // 'backColor', // 背景颜色
          // 'link', // 插入链接
          'list', // 列表
          'justify', // 对齐方式
          // 'quote', // 引用
          // 'emoticon', // 表情
          // 'image', // 插入图片
          // 'table', // 表格
          // 'video', // 插入视频
          // 'code', // 插入代码
          'undo', // 撤销
          'redo', // 重复
        ];
        this.editor.create();
      }, 100);
    }
    return (
      <el-dialog
        width="800px"
        title="发布消息"
        visible={this.visible}
        before-close={this.closeModal}
        close-on-click-modal={false}
      >
        <el-form ref="modelForm" class="model">
          <el-row>
            <el-col span={24}>
              <el-form-item prop="noticeTitle">
                <el-input
                  v-model={this.noticeTitle}
                  placeholder="请输入标题"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col span={24}>
              <el-form-item prop="content">
                <div id="editor"></div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="btnGroup">
          <el-button size="small" type="primary" loading={this.loading} on-click={this.onSubmit}>提交</el-button>
          <el-button size="small" on-click={this.closeModal}>取消</el-button>
        </div>
      </el-dialog>
    );
  }
}
