import { Component, Vue } from 'vue-property-decorator';

@Component({name:'Customer'})
export default class Customer extends Vue {
  render() {
    const { keepList } = this.$store.state.app;
    return (
      <div class="customer-wrap">
        <keep-alive max={20} include={keepList}>
          <router-view/>
        </keep-alive>
      </div>
    );
  }
}

