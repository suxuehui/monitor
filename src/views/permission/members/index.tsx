import { Component, Vue } from 'vue-property-decorator';
import qs from 'qs';
import { Tag, Tooltip } from 'element-ui';
import { FilterFormList, tableList, Opreat } from '@/interface';
import { exportExcel } from '@/api/export';
import {
  roleSelect, userLock, userUnlock, userInfo,
} from '@/api/permission';

import AddModal from '@/views/permission/members/components/AddModal';
import './index.less';

interface RoleType { key: number, value: string, label: string }
interface ActiveType { key: any, value: any, label: string }

@Component({
  components: {
    'el-tag': Tag,
    'add-modal': AddModal,
    'el-tooltip': Tooltip,
  },
  name: 'Members',
})
export default class Members extends Vue {
  // data
  // 普通筛选
  filterList: FilterFormList[] = [
    {
      key: 'roleId',
      type: 'select',
      label: '角色类型',
      placeholder: '请选择角色类型',
      options: [],
    },
    {
      key: 'active',
      type: 'select',
      label: '成员状态',
      placeholder: '请选择成员状态',
      options: [],
    },
    {
      key: 'keyword',
      type: 'input',
      label: '成员姓名',
      placeholder: '成员姓名或登录账号',
    },
  ];

  // 高级筛选
  filterGrade: FilterFormList[] = [];

  // 筛选参数
  filterParams: any = {
    roleId: '',
    active: '',
    keyword: '',
  };

  outParams: any = {};

  // 请求地址
  url: string = '/sys/user/list';

  activeTypes: ActiveType[] = [
    { key: null, value: null, label: '全部' },
    { key: 1, value: 1, label: '正常' },
    { key: 2, value: 2, label: '冻结' },
  ]

  mounted() {
    this.filterList[1].options = this.activeTypes;
    roleSelect(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.forEach((item: any) => {
          item.key = parseInt(item.id, 10);
          item.value = item.id;
          item.label = item.roleName;
        });
        this.roleTypeList = res.entity;
        this.roleTypeAddList = res.entity.filter((item: any) => item);
        // 所有品牌
        this.roleTypeList.unshift({
          key: Math.random(),
          value: '',
          label: '所有角色',
        });
        this.filterList[0].options = this.roleTypeList;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  roleTypeList: RoleType[] = []

  roleTypeAddList: RoleType[] = []

  opreat: Opreat[] = [
    {
      key: 'edit',
      rowKey: 'userName',
      color: 'blue',
      text: '编辑',
      roles: true,
      disabled: (row: any) => (row.userName === 'admin'),
    },
    {
      key: 'freeze',
      rowKey: 'userName',
      color: (row: any) => (row.activeStatus === 1 ? 'red' : 'green'),
      text: (row: any) => (row.activeStatus === 1 ? '冻结' : '解冻'),
      msg: (row: any) => (row.activeStatus === 1 ? '是否要冻结？' : '是否要解冻？'),
      roles: true,
      disabled: (row: any) => (row.userName === 'admin'),
    },
  ];

  // 表格参数
  tableList: tableList[] = [
    { label: '成员姓名', prop: 'realName' },
    { label: '登录账号', prop: 'userName' },
    { label: '角色类型', prop: 'roleNames', formatter: this.roleChange },
    { label: '成员描述', prop: 'remark' },
    { label: '添加人', prop: 'remark' },
    {
      label: '添加时间',
      prop: 'crtTime',
      sortable: true,
      sortBy: ['crtTime'],
    },
    {
      label: '最后登录',
      prop: 'lastLoginTime',
      sortable: true,
      sortBy: ['lastLoginTime'],
    },
    { label: '状态', prop: 'activeStatus', formatter: this.statusDom },
  ];

  // 角色
  roleChange(row: any) {
    if (!row.roleNames) {
      return <el-tag type="info" size="medium" style="marginRight:5px">未知</el-tag>;
    }
    const roleTypeOptions: string[] = row.roleNames.indexOf(',') > 0 ? row.roleNames.split(',') : [row.roleNames];
    return <el-tooltip
      class="item"
      effect="dark"
      content={roleTypeOptions.join(', ')}
      placement="top">
      <el-tag type="success">{roleTypeOptions.join(', ')}</el-tag>
    </el-tooltip>;
  }

  statusDom(row: any) {
    const type = row.activeStatus === 1 ? 'success' : 'danger';
    return <el-tag size="medium" type={type}>{row.activeStatus === 1 ? '正常' : '冻结'}</el-tag>;
  }

  // 新增、编辑
  addVisible: boolean = false;

  addTitle: string = '';

  addRoleList: any = [];

  modelForm: any = {};

  // 操作
  menuClick(key: string, row: any) {
    const FromTable: any = this.$refs.table;
    if (key === 'edit') {
      userInfo(row.id).then((res) => {
        if (res.result.resultCode === '0') {
          this.addVisible = true;
          this.addTitle = '编辑成员';
          this.modelForm = row;
          this.modelForm.IdList = res.entity.roleIdList;
        } else {
          this.$message.error(res.result.resultMessage);
        }
      });
    } else if (key === 'freeze') {
      // activeStatus 1 正常 2 冻结
      if (row.activeStatus === 1) {
        // 冻结
        userLock([row.id]).then((res) => {
          if (res.result.resultCode === '0') {
            this.$message.success(res.result.resultMessage);
            FromTable.reloadTable();
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      } else {
        // 解冻
        userUnlock([row.id]).then((res) => {
          if (res.result.resultCode === '0') {
            this.$message.success(res.result.resultMessage);
            FromTable.reloadTable();
          } else {
            this.$message.error(res.result.resultMessage);
          }
        });
      }
    }
  }

  addModel() {
    this.addVisible = true;
    this.modelForm = {};
    this.addTitle = '新增成员';
  }

  // 关闭弹窗
  closeModal(): void {
    this.addVisible = false;
    this.modelForm = {};
    const addBlock: any = this.$refs.addTable;
    setTimeout(() => {
      addBlock.resetData();
    }, 200);
  }

  // 关闭弹窗时刷新
  refresh(): void {
    const FromTable: any = this.$refs.table;
    FromTable.reloadTable();
    this.closeModal();
  }

  downLoad(data: any) {
    const data1 = qs.stringify(data);
    exportExcel(data1, '成员列表', '/sys/user/exportExcel');
  }

  render(h: any) {
    return (
      <div class="member-wrap">
        <filter-table
          ref="table"
          filter-list={this.filterList}
          filter-grade={this.filterGrade}
          filter-params={this.filterParams}
          add-btn={true}
          on-addBack={this.addModel}
          opreat={this.opreat}
          out-params={this.outParams}
          table-list={this.tableList}
          url={this.url}
          localName={'remembers'}
          export-btn={true}
          on-downBack={this.downLoad}
          on-menuClick={this.menuClick}
        />
        <add-modal
          ref="addTable"
          roleIds={this.addRoleList}
          roleAddList={this.roleTypeAddList}
          title={this.addTitle}
          visible={this.addVisible}
          data={this.modelForm}
          on-close={this.closeModal}
          on-refresh={this.refresh}
        ></add-modal>
      </div>
    );
  }
}
