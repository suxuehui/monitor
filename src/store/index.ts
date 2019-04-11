import Vue from 'vue';
import Vuex from 'vuex';
import app from '@/store/modules/app';
import user from '@/store/modules/user';
import infoCount from '@/store/modules/infoCount';
import deviceInfo from '@/store/modules/deviceInfo';
import getters from '@/store/getters';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    user,
    infoCount,
    deviceInfo,
  },
  getters,
});

export default store;
