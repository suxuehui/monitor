import { Component, Vue } from 'vue-property-decorator';

@Component({ name: 'Data' })
export default class Data extends Vue {
  render() {
    const { keepList } = this.$store.state.app;
    return (
      <div class="data-wrap">
        <keep-alive max={20} include={keepList}>
          <router-view/>
        </keep-alive>
      </div>
    );
  }
}
