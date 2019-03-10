import { Component, Vue } from 'vue-property-decorator';

@Component({ name: 'Config' })
export default class Config extends Vue {
  render() {
    const { keepList } = this.$store.state.app;
    return (
      <div class="config-wrap">
        <keep-alive max={20} include={keepList}>
          <router-view />
        </keep-alive>
      </div>
    );
  }
}
