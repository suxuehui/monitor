import { Component, Emit, Vue, Prop } from 'vue-property-decorator';
import { Menu, Submenu, MenuItemGroup, MenuItem } from 'element-ui';
import { routerItem } from '@/interface';
import './MenuList.less';

@Component({
  components: {
  'el-menu': Menu,
  'el-submenu': Submenu,
  'el-menu-item-group': MenuItemGroup,
  'el-menu-item': MenuItem,
  }
  })
export default class MenuList extends Vue {
  @Prop({ default: '#010101' }) private bgColor!: string;
  @Prop({ default: '#fff' }) private txtColor!: string;
  @Emit()
  handleOpen(key: string, keyPath: string) {
    const self = this;
    console.log(key, keyPath);
  }
  @Emit()
  handleClose(key: string, keyPath: string) {
    const self = this;
    console.log(key, keyPath);
  }
  render() {
    const { menuData, sidebar: { opened } } = this.$store.state.app;
    return (
      <el-menu
        collapse={!opened}
        default-active="2"
        class="left-menu"
        background-color={this.bgColor}
        text-color={this.txtColor}
        unique-opened={true}
        active-text-color="#1890ff"
        on-open={this.handleOpen}
        on-close={this.handleClose}>
        {menuData ? this.renderMenu(menuData) : null}
      </el-menu>
    );
  }
  renderMenu(menuData: routerItem[], parentPath?: string): (JSX.Element | null)[] {
    return menuData.map((item: routerItem) => {
      if (item.children) {
        let isEmpty = true;
        item.children.forEach((items: routerItem) => {
          if (!items.hidden) {
            isEmpty = false;
          }
        });
        if (isEmpty) {
          return <el-menu-item
            id={item.path}
            on-click={() => this.openPage(
              `${parentPath ? `${parentPath}/${item.path}` : item.path}`,
              item.name,
            )} index={`${item.path}`}>
            <i class={`iconfont-${item.icon}`}></i>
            <span slot="title">{item.name}</span>
          </el-menu-item>;
        }
        return <el-submenu
          id={item.path}
          index={item.path}>
          <template slot="title">
            <i class={`iconfont-${item.icon}`}></i>
            <span slot="title">{item.name}</span>
          </template>
          {this.renderMenu(item.children, parentPath ? `${parentPath}/${item.path}` : item.path)}
        </el-submenu>;
      } else if (item.hidden) {
        return null;
      }
      return <el-menu-item
        id={item.path}
        on-click={() => this.openPage(
          `${parentPath ? `${parentPath}/${item.path}` : item.path}`,
          item.name,
        )} index={`${item.path}`}>
        <i class={`iconfont-${item.icon}`}></i>
        <span slot="title">{item.name}</span>
      </el-menu-item>;
    });
  }
  openPage(path: string, name: string | undefined) {
    this.$router.push(path);
  }
}
