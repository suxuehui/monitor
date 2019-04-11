const deviceInfo = {
  state: {
    cimei: 0,
    cid: 0,
  },
  mutations: {
    SVAECID: (state: any, data: any) => {
      state.cid = data.id;
      state.cimei = data.imei;
    },
  },
  actions: {
    // 存储当前设备id和设备imei
    getData: (context: any, data: any) => new Promise((resolve, reject) => {
      context.commit('SVAECID', data);
    }),
  },
};

export default deviceInfo;
