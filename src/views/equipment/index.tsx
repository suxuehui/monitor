import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Customer extends Vue {
  render() {
    return (
      <div class="customer-wrap">
        <router-view></router-view>
      </div>
    );
  }
}

