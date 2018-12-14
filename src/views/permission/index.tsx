import { Component, Vue } from 'vue-property-decorator';

@Component({ name: 'Permission' })
export default class Permission extends Vue {
  render() {
    const { keepList } = this.$store.state.app;
    return (
      <div class="permission-wrap">
        <keep-alive max={20} include={keepList}>
          <router-view />
        </keep-alive>
      </div>
    );
  }
}
