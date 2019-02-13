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
  },
})
export default class Header extends Vue {
  @Prop() private username!: string;

  // data
  menuData: routerItem[] = [];

  breadList: breadItem[] = [];

  onIndex: number = 0;

  @Watch('$route', { immediate: true, deep: true })
  routeChange(to: any, from: any) {
    const toDepth = utils.routeToArray(to.path);
    this.onIndex = 0;
    this.breadList = [];
    this.routerBread(this.menuData, toDepth.routeArr);
  }

  @Watch('menuData')
  initRouteBread() {
    const toDepth = utils.routeToArray(this.$route.path);
    this.routerBread(this.menuData, toDepth.routeArr);
  }

  @Emit()
  routerBread(data: routerItem[], toDepth: string[]) {
    data.map((item: routerItem) => {
      if (item.path === toDepth[this.onIndex]) {
        this.breadList.push({
          url: item.path,
          text: item.name ? item.name : '',
        });
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
    }, 400);
  }

  pswVisible: boolean = false;

  @Emit()
  menuClick(type: string): void {
    const self = this;
    switch (type) {
      case '1':
        break;
      case '2':
        this.pswVisible = true;
        break;
      case '3':
        localStorage.removeItem('token');
        window.location.reload();
        break;
      default:
        break;
    }
  }

  // 关闭弹窗
  closeModal(): void {
    this.pswVisible = false;
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
              this.showNotice
                ? <li id="noticeList" on-click={this.checkInfo}>
                  <el-badge value={this.$store.getters.noticeCount === 0 ? '' : this.$store.getters.noticeCount} max={9} class="item">
                    <i class="iconfont-email"></i>
                  </el-badge>
                </li> : null
            }
            {
              this.showAlarm
                ? <li id="alarmList" on-click={this.checkAlarm}>
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
        >
        </changePsw-modal>
      </div>
    );
  }
}
