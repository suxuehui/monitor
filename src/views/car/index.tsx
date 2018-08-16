import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Monitor extends Vue {
  render() {
    return (
      <div class="car-wrap">
        <router-view></router-view>
      </div>
    );
  }
}

