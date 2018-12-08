import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Model extends Vue {
  render() {
    const { keepList } = this.$store.state.app;
    return (
      <div class="modal-wrap">
        <keep-alive max={20} include={keepList}>
          <router-view/>
        </keep-alive>
      </div>
    );
  }
}

