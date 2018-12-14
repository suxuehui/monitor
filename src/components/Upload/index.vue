<template>
  <el-upload
    ref="upload"
    :action="url"
    :headers="headers"
    :name="name"
    :auto-upload="autoUpload"
    :limit="limitNum"
    :file-list="logoUrl"
    :show-file-list="showList"
    :list-type="listType"
    :before-upload="handleBeforeUpload"
    :on-success="handleSuccess"
    :on-remove="handleRemove"
    :on-exceed="handleExceed"
  >
    <i v-if="showUpBtn" class="el-icon-plus"/>
  </el-upload>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Emit,
} from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface/index';
import { Upload } from 'element-ui';
import './index.less';
@Component({
  components: {
    'el-upload': Upload,
  },
})
export default class FilterTable extends Vue {
  // 请求数据地址
  @Prop() private url!: string;

  // 验证token
  @Prop() private headers!: Object;

  // 上传最大数量
  @Prop({ default: 1 }) private limitNum!: number;

  // 默认文件名
  @Prop({ default: 'file' }) private name!: string;

  // 图片地址
  @Prop() private logoUrl!: any;

  // 自动上传
  @Prop({ default: true }) private autoUpload!: boolean;

  // 是否显示已上传文件列表
  @Prop({ default: true }) private showList!: boolean;

  // 是否显示上传按钮
  @Prop({ default: true }) private showUpBtn!: boolean;

  // 文件列表类型 text/picture/picture-card
  @Prop({ default: 'picture-card' }) private listType!: string;

  @Emit()
  handleRemove(file: any, fileList: any) {
    this.$emit('removeBack', file, fileList);
  }

  @Emit()
  handleSuccess(response: any, file: any, fileList: any) {
    this.$emit('successBack', response, file, fileList);
  }

  @Emit()
  handleExceed(file: any, fileList: any) {
    this.$emit('exceesBack', file, fileList);
  }

  @Emit()
  handleBeforeUpload(file: any) {
    this.$emit('beforeUpload', file);
  }
}
</script>

<style scoped lang="less">

</style>
