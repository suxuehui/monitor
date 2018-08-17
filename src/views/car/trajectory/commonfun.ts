/**
 * @file 存放公共方法
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */

const commonfun = {
  /**
   * 根据系统要求变更时间格式
   *
   * @param {string} time UNIX时间戳
   * @return {string} 时间 格式：2016-08-19 19:18:15
   */
  getLocalTime(time: string) {
    const d = new Date(parseInt(time, 10) * 1000);
    let month: any = d.getMonth() + 1;
    let day: any = d.getDate();
    let hour: any = d.getHours();
    let minute: any = d.getMinutes();
    let second: any = d.getSeconds();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    hour = hour < 10 ? `0${hour}` : hour;
    minute = minute < 10 ? `0${minute}` : minute;
    second = second < 10 ? `0${second}` : second;
    return `${d.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`;
  },

  /**
   * 获取传入时间当天的0点0分0秒时间
   *
   * @param {Object} time js Date对象
   * @return {string} 时间 格式：2016-08-19 19:18:15
   */
  getStartTime(time: string) {
    const date = new Date(time);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  },

  /**
   * 获取当前日期
   *
   * @param {string} time UNIX时间戳 可选
   * @param {string} type 获取日期格式
   * @return {string} 时间 格式：2016-08-19
   */
  getCurrentDate(e: any, type: string) {
    e = e || new Date();
    const d = e;
    let result = '';
    if (!type) {
      let month = d.getMonth() + 1;
      let day = d.getDate();
      month = month < 10 ? `0${month}` : month;
      day = day < 10 ? `0${day}` : day;
      result = `${d.getFullYear()}-${month}-${day}`;
    } else if (type === 'hh:00') {
      const minute = e.getMinutes();
      if (minute <= 30) {
        e = new Date(e.valueOf() - (60 * 60 * 1000 * 2));
      } else {
        e = new Date(e.valueOf() - (60 * 60 * 1000));
      }
      let hour = e.getHours();
      let month = d.getMonth() + 1;
      let day = d.getDate();
      const year = e.getFullYear();
      hour = hour < 10 ? `0${hour}` : `${hour}`;
      month = month < 10 ? `0${month}` : month;
      day = day < 10 ? `0${day}` : day;
      result = `${e.getFullYear()}-${month}-${day} ${hour}:00`;
    }
    return result;
  },

  /**
   * 从当前url取参数
   *
   * @param {string} 参数名
   * @return {string} 参数值
   */
  getQueryString(name: string) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
    const r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  },
  /**
   * 判断当前设备是否在线，规则是最后上传的轨迹点
   * 时间在当前系统时间十分钟内判断为在线，否则为离线
   *
   * @param {number} time UNIX时间戳
   * @return {number} 在线状态 0在线 1离线
   */
  getOnlineStatus(time: number) {
    let status = 0;
    const timestamp = new Date().getTime() / 1000;
    const timeDiff = (timestamp - time) / 60;
    status = timeDiff >= 10 ? 1 : 0;
    return status;
  },
  /**
   * 判断当前设备是否为静止，规则是速度小于1km/h返回静止，
   * 否则返回速度
   *
   * @param {number} speed 速度 单位为 km/h
   * @return {string} 速度
   */
  getSpeed(speed: number): string {
    let speedDesc;
    if (speed >= 1) {
      speedDesc = `${speed.toFixed(1)}km/h`;
    } else {
      speedDesc = '静止';
    }
    return speedDesc;
  },
  /**
   * 返回当前弹窗中的状态字段数组，
   * 分别为状态、速度、方向
   *
   * @param {number} speed 速度
   * @param {number} time UNIX时间戳
   * @param {number} direction 方向
   *
   * @return {array} 状态
   */
  getInfoWindowStatus(speed: number, time: number, direction: number) {
    const statusArr = [];
    speed = speed || 0;
    if (this.getOnlineStatus(time) === 0) {
      if (this.getSpeed(speed) === '静止') {
        statusArr[0] = '静止（时速不大于1km/h）';
        statusArr[1] = '';
        statusArr[2] = '';
      } else {
        statusArr[0] = '<span class="run">行驶（时速不小于1km/h）</span>';
        statusArr[1] = this.getSpeed(speed);
        statusArr[2] = this.getDirection(direction);
      }
    } else {
      statusArr[0] = '离线（10分钟内无定位点）';
      statusArr[1] = '';
      statusArr[2] = '';
    }

    return statusArr.join(' ');
  },
  /**
   * 返回当前设备运动方向描述，一共分为8种，45度一个
   *
   * @param {number} direction 方向数据
   * @return {string} 方向描述
   */
  getDirection(direction: number) {
    let directionDesc = '';
    direction = direction || 0;
    switch (Math.floor((direction) / 22.5)) {
      case 0:
      case 15:
        directionDesc = '(北)';
        break;
      case 1:
      case 2:
        directionDesc = '(东北)';
        break;
      case 3:
      case 4:
        directionDesc = '(东)';
        break;
      case 5:
      case 6:
        directionDesc = '(东南)';
        break;
      case 7:
      case 8:
        directionDesc = '(南)';
        break;
      case 9:
      case 10:
        directionDesc = '(西南)';
        break;
      case 11:
      case 12:
        directionDesc = '(西)';
        break;
      case 13:
      case 14:
        directionDesc = '(西北)';
        break;
      default:
        directionDesc = '未知';
    }
    return directionDesc;
  },
  /**
   * 返回当前车辆图标方向，一个四种，90度一个
   *
   * @param {number} direction 方向数据
   * @return {number} 方向标识 0上 1右 2下 3左
   */
  getDirectionIcon(direction: number) {
    let directionIcon = 0;
    direction = direction || 0;
    switch (Math.floor((direction) / 45)) {
      case 0:
      case 7:
        directionIcon = 0;
        break;
      case 1:
      case 2:
        directionIcon = 1;
        break;
      case 3:
      case 4:
        directionIcon = 2;
        break;
      case 5:
      case 6:
        directionIcon = 3;
        break;
      default:
        directionIcon = 4;
    }
    return directionIcon;
  },
};


export default commonfun;
