import {
  Component, Vue,
} from 'vue-property-decorator';
import AppMain from '@/components/Layout/AppMain';
import Loader from '@/components/Loader/index.vue';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

import './App.less';
@Component({
  components: {
    loader: Loader,
  },
})
export default class App extends Vue {
  created() {
    this.isMobile();
    window.onresize = () => {
      this.isMobile();
    };
  }

  // 屏幕width 是否 < 768
  isMobile() {
    const { isMobile } = this.$store.state.app;
    const body = document.querySelector('body');
    const bodyWidth = body ? body.offsetWidth : 0;
    if (isMobile && bodyWidth > 768) {
      this.$store.dispatch('ChangeMobile', false);
    } else if (!isMobile && bodyWidth <= 768) {
      this.$store.dispatch('ChangeMobile', true);
    }
  }

  render() {
    const self = this;
    Raven
      .config('https://95130553210b494592fdb8be63b291be@monitor-blacktea.mysirui.com//2')
      .addPlugin(RavenVue, Vue)
      .install();
    return (
      <div id="app">
        <loader spinning={self.$store.getters.spinning} fullScreen></loader>
        <AppMain />
      </div>
    );
  }
}
