<template>
  <el-upload
    :action="url"
    :headers="headers"
    :on-success="handleSuccess"
    :on-remove="handleRemove"
    :on-exceed="handleExceed"
    :limit="limitNum"
    :file-list="logoUrl"
    list-type="picture-card"
  >
    <i class="el-icon-plus" />
  </el-upload>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { FilterFormList, tableList, Opreat } from '@/interface/index';
import { Upload } from 'element-ui';

@Component({
  components: {
  "el-upload": Upload,
  }
  })
export default class FilterTable extends Vue {
  // 请求数据地址
  @Prop() private url!: string;
  // 验证token
  @Prop() private headers!: Object;
  // 上传最大数量
  @Prop({ default: 1 })
  private limitNum!: number;

  // 图片地址
  @Prop() private logoUrl!: any;

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
}
</script>

<style scoped lang="less">
</style>
