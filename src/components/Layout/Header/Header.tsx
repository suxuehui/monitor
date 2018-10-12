import { Component, Prop, Emit, Vue, Watch } from 'vue-property-decorator';
import { Badge, Dropdown, DropdownMenu, DropdownItem, Breadcrumb, BreadcrumbItem, Popover } from 'element-ui';
import { menuItem, routerItem } from '@/interface';
import { noticeNotHandled, getNotHandled } from '@/api/message';
import utils from '@/utils';
import MenuList from '@/components/Layout/Sidebar/MenuList';
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
  }
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

  // 告警、通知
  infoLen: number = 1;
  alarmLen: number = 1;

  created() {
    this.getNotice();
    this.timeGet();
  }

  getNotice() {
    noticeNotHandled({ status: 1 }).then((res) => {
      if (res.result.resultCode === '0') {
        this.infoLen = res.entity;
      }
    });
    getNotHandled({ status: 1 }).then((res) => {
      if (res.result.resultCode === '0') {
        this.alarmLen = res.entity;
      }
    });
  }

  // 每30s拉取一次
  timeGet() {
    setInterval(() => {
      this.getNotice();
    }, 30000);
  }

  @Emit()
  menuClick(type: string): void {
    const self = this;
    switch (type) {
      case '1':
        break;
      case '2':
        break;
      case '3':
        localStorage.removeItem('token');
        window.location.reload();
        break;
      default:
        break;
    }
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
            </el-popover> : <i class={`menu-btn iconfont-${opened ? 'indent' : 'outdent'}`} on-click={this.switchSidebar}></i>
          }
          <el-breadcrumb class="header-bread" separator="/">
            {
              this.breadList.map((item: breadItem) => <el-breadcrumb-item to={item.url ? { path: '/' } : null}>{item.text}</el-breadcrumb-item>)
            }
          </el-breadcrumb>
        </div>
        <ul class="header-menu">
          <li>
            <el-badge value={this.infoLen === 0 ? '' : this.infoLen} max={9} class="item">
              <i class="iconfont-email" on-click={this.checkInfo}></i>
            </el-badge>
          </li>
          <li>
            <el-badge value={this.alarmLen === 0 ? '' : this.alarmLen} max={9} class="item">
              <i class="iconfont-bell" on-click={this.checkAlarm}></i>
            </el-badge>
          </li>
          <li class="user">
            <el-dropdown on-command={this.menuClick} size="medium">
              <span class="el-dropdown-link">
                <p class="name">{this.$store.getters.username}</p>
                <i class="iconfont-user"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="1">个人中心</el-dropdown-item>
                <el-dropdown-item command="2">修改密码</el-dropdown-item>
                <el-dropdown-item command="3" divided><font color="red">退出登录</font></el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </li>
        </ul>
      </header>
    );
  }
}
