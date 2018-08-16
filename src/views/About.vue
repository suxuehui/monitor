<template>
  <div class="about">
    <filter-table
      :filter-list="filterList"
      :filter-params="filterParams"
      :add-btn="true"
      :out-params="outParams"
      :table-list="tableList"
      :export-btn="true"/>
  </div>
</template>

<script lang="ts">
import { Emit, Vue, Component } from 'vue-property-decorator';
import { FilterFormList, tableList, tableTag } from '@/interface/';

@Component
export default class About extends Vue {
  // data
  filterList: FilterFormList[] = [
    {
      key: 'caName', type: 'input', label: '客户姓名', placeholder: '请输入客户姓名',
    },
    {
      key: 'IMEI', type: 'input', label: 'IMEI', placeholder: '请输入IMEI',
    },
    {
      key: 'levelCode', type: 'levelcode', label: '所属门店', placeholder: '请选择门店', options: [],
    },
  ];
  filterParams: any = {
    caName: '', IMEI: '', levelCode: '', brandName: '', seriesName: '', vmName: '', vin: '',
  };
  outParams: any = { levelCode: '' };
  tableList: tableList[] = [
    {
      label: '品牌', prop: 'brandName',
    },
    { label: '所属门店', prop: 'orgName' },
    {
      label: '车型', prop: 'vmName',
    },
    { label: '车牌', prop: 'plateNumber' },
    { label: '车架号', prop: 'vin' },
    { label: '客户姓名', prop: 'caName' },
    {
      label: '颜色', prop: 'color',
    },
    {
      label: 'IMEI', prop: 'IMEI',
    },
  ];
  deviceOptions: tableTag[] = [
    {
      key: 1, color: 'green', value: 1, label: '待发货',
    },
    {
      key: 2, color: 'blue', value: 2, label: '待安装测试',
    },
    {
      key: 3, color: 'green', value: 3, label: '已绑定待激活',
    },
    {
      key: 4, color: 'blue', value: 4, label: '已激活',
    },
    {
      key: 5, color: 'orange', value: 5, label: '待检测维修',
    },
    {
      key: 6, color: 'red', value: 6, label: '返厂',
    },
  ];
  filterGrade: FilterFormList[] = [
    {
      key: 'caName', type: 'input', label: '客户姓名', placeholder: '请输入客户姓名',
    },
    {
      key: 'IMEI', type: 'input', label: 'IMEI', placeholder: '请输入IMEI',
    },
    {
      key: 'levelCode', type: 'cascader', label: '所属门店', placeholder: '请选择门店', options: [],
    },
    {
      key: 'brandName', type: 'input', label: '品牌', placeholder: '请输入品牌',
    },
    {
      key: 'seriesName', type: 'input', label: '车系', placeholder: '请输入车系',
    },
    {
      key: 'vmName', type: 'input', label: '车型', placeholder: '请输入车型',
    },
    {
      key: 'vin', type: 'input', label: '车架号', placeholder: '请输入车架号',
    },
  ];
  @Emit()
  change() {
    console.log(this.filterList);
  }
}
</script>

<style lang="less" scoped>

</style>

