import { Component, Vue } from 'vue-property-decorator';

@Component({ name: 'System' })
export default class System extends Vue {
  render() {
    const { keepList } = this.$store.state.app;
    return (
      <div class="system-wrap">
        <keep-alive max={20} include={keepList}>
          <router-view/>
        </keep-alive>
      </div>
    );
  }
}
