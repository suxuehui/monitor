import { noticeNotHandled, getNotHandled } from '@/api/message';

const infoCount = {
  state: {
    noticeCount: 0,
    alarmCount: 0,
  },
  mutations: {
    SVAENOTICE: (state: any, data:number) => {
      state.noticeCount = data;
    },
    SVAEALARM: (state: any, data:number) => {
      state.alarmCount = data;
    },
  },
  actions: {
    getNotice: (context: any) => new Promise((resolve, reject) => {
      noticeNotHandled({ status: 1 }).then(({ result, entity }) => {
        if (result.resultCode === '0') {
          context.commit('SVAENOTICE', entity);
        }
      }).catch((error) => {
        context.commit('LOADING', true);
        reject(error);
      });
    }),
    getAlarm: (context: any) => new Promise((resolve, reject) => {
      getNotHandled({ status: 1 }).then(({ result, entity }) => {
        if (result.resultCode === '0') {
          context.commit('SVAEALARM', entity);
        }
      }).catch((error) => {
        context.commit('LOADING', true);
        reject(error);
      });
    }),
  },
};

export default infoCount;
