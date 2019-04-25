import {
  Component, Prop, Emit, Vue, Watch,
} from 'vue-property-decorator';
import {
  Badge, Dropdown, DropdownMenu, DropdownItem, Breadcrumb, BreadcrumbItem, Popover,
} from 'element-ui';
import { routerItem } from '@/interface';
import utils from '@/utils';
import MenuList from '@/components/Layout/Sidebar/MenuList';
import ChangePswModal from './ChangePawModal';
import ExitModel from './ExitModel';
import './Header.less';

interface breadItem {
  url: string,
  text: string,
}

@Component({
  components: {
    'el-badge': Badge,
    'el-dropdown': Dropdown,
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem,
    'el-breadcrumb': Breadcrumb,
    'el-breadcrumb-item': BreadcrumbItem,
    'el-popover': Popover,
    'menu-list': MenuList,
    'changePsw-modal': ChangePswModal,
    'exit-modal': ExitModel,
  },
})
export default class Header extends Vue {
  @Prop() private username!: string;

  // 菜单数据
  menuData: routerItem[] = [];

  // 面包屑数据
  breadList: breadItem[] = [];

  // 用于判断面包屑匹配层级
  onIndex: number = 0;

  /**
   * @method 深度监听路由变化，更新面包屑
   */
  @Watch('$route', { immediate: true, deep: true })
  routeChange(to: any, from: any) {
    const toDepth = utils.routeToArray(to.path);
    this.onIndex = 0;
    this.breadList = [];
    this.routerBread(this.menuData, toDepth.routeArr);
  }

  /**
   * @method 初始化面包屑
   */
  @Watch('menuData')
  initRouteBread() {
    const toDepth = utils.routeToArray(this.$route.path);
    this.routerBread(this.menuData, toDepth.routeArr);
  }

  /**
   * @method 更新面包屑函数
   * @param {Array} data 菜单数据
   * @param {Array} toDepth 当前路由数组
   */
  @Emit()
  routerBread(data: routerItem[], toDepth: string[]) {
    data.map((item: routerItem) => {
      // 匹配路由path值
      if (item.path === toDepth[this.onIndex]) {
        this.breadList.push({
          url: item.path,
          text: item.name ? item.name : '',
        });
        // 判断是否还有子路由，有就进行递归操作，层级+1
        if (item.children && (toDepth.length - 1) >= this.onIndex) {
          this.onIndex += 1;
          this.routerBread(item.children, toDepth);
        }
      }
      return true;
    });
  }

  // 通知、告警按钮展示
  showNotice: boolean = true;

  showAlarm: boolean = true;

  created() {
    const getNowRoles: string[] = [
      '/message/notice/list',
      '/message/alarm/list',
    ];
    setTimeout(() => {
      // 判断是否有通知公告和告警消息的权限
      this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
        this.showNotice = !!(res[0]);
        this.showAlarm = !!(res[1]);
        if (res[0]) {
          this.$store.dispatch('getNotice');
        }
        if (res[1]) {
          this.$store.dispatch('getAlarm');
        }
      });
    }, 1000);
  }

  pswVisible: boolean = false;

  exitVisible: boolean = false;

  /**
   * @method 下拉菜单回调事件
   * @param {string} type 下拉菜单回调参数
   */
  @Emit()
  menuClick(type: string): void {
    const self = this;
    switch (type) {
      case '1':
        break;
      case '2':
        // 修改密码
        this.pswVisible = true;
        break;
      case '3':
        // 退出登录
        this.exitVisible = true;
        break;
      default:
        break;
    }
  }

  // 关闭弹窗
  closeModal(): void {
    this.pswVisible = false;
    this.exitVisible = false;
  }

  checkInfo() {
    this.$router.push({ name: '通知公告' });
  }

  checkAlarm() {
    this.$router.push({ name: '告警消息' });
  }

  @Emit()
  switchSidebar(): void {
    this.$store.dispatch('ToggleSideBar');
  }

  render() {
    const { menuData, sidebar: { opened }, isMobile } = this.$store.state.app;
    this.menuData = menuData;
    return (
      <div>
        <header class="header-wrap">
          <div class="header-left">
            {
              isMobile ? <el-popover
                placement="bottom"
                title=""
                width="300"
                trigger="click">
                <menu-list bgColor="#fff" txtColor="#898989" />
                <i slot="reference" class="menu-btn iconfont-listMenu"></i>
              </el-popover> : <i class={`menu-btn iconfont-${!opened ? 'indent' : 'outdent'}`} on-click={this.switchSidebar}></i>
            }
            <el-breadcrumb class="header-bread" separator="/">
              {
                this.breadList.map((item: breadItem) => <el-breadcrumb-item to={item.url ? { path: '/' } : null}>{item.text}</el-breadcrumb-item>)
              }
            </el-breadcrumb>
          </div>
          <ul class="header-menu">
            {
              this.showNotice ? <li id="noticeList" on-click={this.checkInfo}>
                <el-badge value={this.$store.getters.noticeCount === 0 ? '' : this.$store.getters.noticeCount} max={9} class="item">
                  <i class="iconfont-email"></i>
                </el-badge>
              </li> : null
            }
            {
              this.showAlarm ? <li id="alarmList" on-click={this.checkAlarm}>
                <el-badge value={this.$store.getters.alarmCount === 0 ? '' : this.$store.getters.alarmCount} max={9} class="item">
                  <i class="iconfont-bell"></i>
                </el-badge>
              </li> : null
            }
            <li class="user" id="userList">
              <el-dropdown on-command={this.menuClick} size="medium">
                <span class="el-dropdown-link">
                  <p class="name">{this.$store.getters.username}</p>
                  <i class="iconfont-user"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  {/* <el-dropdown-item command="1">个人中心</el-dropdown-item> */}
                  <el-dropdown-item command="2" id="changePsw">修改密码</el-dropdown-item>
                  <el-dropdown-item command="3" divided>
                    <font color="red" id="exit">退出登录</font>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </li>
          </ul>
        </header>
        <changePsw-modal
          ref="changePsw"
          title="修改密码"
          visible={this.pswVisible}
          on-close={this.closeModal}
        />
        <exit-modal
          visible={this.exitVisible}
          on-close={this.closeModal}
        />
      </div>
    );
  }
}
