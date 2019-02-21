import {
  Component, Prop, Emit, Vue, Watch, Provide,
} from 'vue-property-decorator';
import { Tabs, TabPane } from 'element-ui';
import config from '@/utils/config';
import { menuItem } from '@/interface';

import Header from '@/components/Layout/Header/Header';
import Sidebar from '@/components/Layout/Sidebar/Sidebar';
import './AppMain.less';

@Component({
  components: {
    'el-tabs': Tabs,
    'el-tab-pane': TabPane,
  },
})
export default class AppMain extends Vue {
  @Prop() private menuData!: menuItem[];

  // data
  onTabs: any = '1';

  /**
   * @method 监听路由变化，调用新增tab方法
  * */
  @Watch('$route', { immediate: true, deep: true })
  routeChange(to: any, from: any) {
    this.$store.dispatch('AddTabPane', to.path);
  }

  /**
   * @method 移除tab函数
  * */
  @Emit()
  removeTab(index: string) {
    this.$store.dispatch('RemoveTab', index);
  }

  /**
   * @method tab-change事件，匹配路由数据，触发TabChange事件
  * */
  @Emit()
  tabChange(index: any) {
    // 循环tab路由数据，匹配当前点击tab的name值，跳转路由，触发TabChange事件
    this.tabList.forEach((item: any, indexs: number) => {
      if (item.name === index.name) {
        this.$router.push({ name: item.name, params: { id: item.params }, query: item.query });
        this.$store.dispatch('TabChange', index.name);
      }
    });
  }

  tabList = [];

  render() {
    const {
      sidebar: { opened }, tabList, tabActiveKey, keepList, isMobile,
    } = this.$store.state.app;
    this.onTabs = tabActiveKey; // 激活状态保存
    this.tabList = tabList; // 保存tabList数据到本组件
    // 判断是否是独立页面，不渲染头部和菜单
    if (config.openPages.indexOf(this.$route.path) > -1) {
      return (
        <div class="app-one">
          <router-view />
        </div>
      );
    }
    return (
      <div class={`app-main ${opened ? '' : 'sideLayout'}`}>
        {
          isMobile ? null : <Sidebar />
        }
        <div class="page-content">
          <Header />
          <el-tabs class="page-tabs" v-model={this.onTabs} type="card" closable={tabList.length > 1} on-tab-click={this.tabChange} on-tab-remove={this.removeTab}>
            {
              tabList.map((item: any, index: number) => <el-tab-pane key={item.path}
              label={item.name} name={item.name}>
              </el-tab-pane>)
            }
          </el-tabs>
          <div class="page-wrap">
            <keep-alive max={20} include={keepList}>
              <router-view/>
            </keep-alive>
          </div>
        </div>
      </div>
    );
  }
}
