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
    // 获取通知数量
    getNotice: (context: any) => new Promise((resolve, reject) => {
      noticeNotHandled({ status: 0 }).then(({ result, entity }) => {
        if (result.resultCode === '0') {
          context.commit('SVAENOTICE', entity);
        }
      }).catch((error) => {
        context.commit('LOADING', true);
        reject(error);
      });
    }),
    // 获取新的告警消息数量
    getAlarm: (context: any) => new Promise((resolve, reject) => {
      getNotHandled({ status: 0 }).then(({ result, entity }) => {
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
