import { Component, Vue } from 'vue-property-decorator';

@Component({ name: 'Message' })
export default class Message extends Vue {
  render() {
    const { keepList } = this.$store.state.app;
    return (
      <div class="message-wrap">
        <keep-alive max={20} include={keepList}>
          <router-view />
        </keep-alive>
      </div>
    );
  }
}
