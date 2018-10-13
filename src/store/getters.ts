const getters = {
  sidebar: (state: any) => state.app.sidebar,
  roles: (state: any) => state.user.roles,
  permission_routers: (state: any) => state.user.routers,
  spinning: (state: any) => state.user.spinning,
  username: (state: any) => state.user.users.username,
  noticeCount: (state: any) => state.infoCount.noticeCount,
  alarmCount: (state: any) => state.infoCount.alarmCount,
};
export default getters;
