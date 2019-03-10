import Vue from 'vue';
import Vuex from 'vuex';
import app from '@/store/modules/app';
import user from '@/store/modules/user';
import infoCount from '@/store/modules/infoCount';
import getters from '@/store/getters';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    user,
    infoCount,
  },
  getters,
});

export default store;
