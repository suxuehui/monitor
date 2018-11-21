import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Car extends Vue {
  render() {
    const { keepList } = this.$store.state.app;
    return (
      <div class="car-wrap">
        <keep-alive max={20} include={keepList}>
          <router-view/>
        </keep-alive>
      </div>
    );
  }
}

