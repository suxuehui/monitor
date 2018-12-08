import { Component, Vue } from 'vue-property-decorator';

@Component({name:'Equipment'})
export default class Equipment extends Vue {
  render() {
    const { keepList } = this.$store.state.app;
    return (
      <div class="equipment-wrap">
        <keep-alive max={20} include={keepList}>
          <router-view/>
        </keep-alive>
      </div>
    );
  }
}

