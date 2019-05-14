import { Component, Vue } from 'vue-property-decorator';
import { Button, DatePicker } from 'element-ui';
import {
  getAlarmData, getDrivingData, getOnlineData, getFenceData,
} from '@/api/dashboard';
import './index.less';

@Component({
  components: {
    'el-button': Button,
    'el-date-picker': DatePicker,
  },
  name: 'Dashboard',
})
export default class Dashboard extends Vue {
  // 告警数据
  alarmData: any = [];

  alarmDataChange: boolean = false;

  // 围栏车辆数据
  fenceData: any = {};

  fenceDataChange: boolean = false;

  // G2 对数据源格式的要求，仅仅是 JSON 数组，数组的每个元素是一个标准 JSON 对象。
  // 圆环数据
  circleData: any = [];

  columData: any = [
    { name: '急加速', num: 0 },
    { name: '急减速', num: 0 },
    { name: '急转弯', num: 0 },
    { name: '超速', num: 0 },
    { name: '振动', num: 0 },
    { name: '碰撞', num: 0 },
    { name: '翻滚', num: 0 },
  ];

  columDataChange: boolean = false;

  // 行驶数据
  driveData: any = [
    {
      name: '行驶次数', count: 0, bgColor: '#339999', unit: '次',
    },
    {
      name: '行驶里程', count: 0, bgColor: '#437BBD', unit: 'Km',
    },
    {
      name: '行驶时间', count: 0, bgColor: '#C37F42', unit: '分钟',
    },
    {
      name: '耗油量', count: 0, bgColor: '#9A3FC0', unit: 'L',
    },
    {
      name: '平均油耗', count: 0, bgColor: '#CC5676', unit: 'L/100Km',
    },
  ];

  totalCount: number = 0;

  drivingCount: number = 0;

  helloWord: string = '';

  // 搜索时间范围
  nowDate: any = '';

  defaultTime: any = [
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
    new Date(new Date().getFullYear(), new Date().getMonth(),
      new Date().getDate(), new Date().getHours(), new Date().getMinutes(),
      new Date().getSeconds()),
  ]

  todayActive: boolean = true;

  sevendayActive: boolean = false;

  thirtydayActive: boolean = false;

  allActive: boolean = false;

  toMonitor: boolean = true;

  columnarChart: any = null;

  circleChart: any = null;

  showAlarmData: boolean = false; // 告警

  showOnlineData: boolean = false; // 在线

  showDrivingData: boolean = false; // 行驶

  showFenceData: boolean = false; // 围栏

  created() {
    const getNowRoles: string[] = [
      // 操作
      '/vehicle/monitor/list',
      '/home/report/alarmData', // 告警
      '/home/report/onlineData', // 在线
      '/home/report/drivingData', // 行驶
      '/home/report/fenceData', // 围栏
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.toMonitor = !!(res[0]);
      this.showAlarmData = !!(res[1]);
      this.showOnlineData = !!(res[2]);
      this.showDrivingData = !!(res[3]);
      this.showFenceData = !!(res[4]);
      if (this.showAlarmData) {
        // 获取告警统计数据
        this.GetAlarmData();
      }
      if (this.showFenceData) {
        // 获取围栏车辆数据
        this.GetFenceData();
      }
      if (this.showDrivingData) {
        // 获取行驶统计数据
        this.GetDrivingData();
      }
      if (this.showOnlineData) {
        // 获取车辆统计数据
        this.GetOnlineData();
      }
    });
  }

  mounted() {
    // 时间
    this.nowDate = new Date();// 获取系统当前时间
    const myTime = this.nowDate.getHours() + (this.nowDate.getMinutes() * 0.01);
    this.setHelloWord(myTime);
  }

  resetDriveData() {
    this.driveData = [
      {
        name: '行驶次数', count: 0, bgColor: '#339999', unit: '次',
      },
      {
        name: '行驶里程', count: 0, bgColor: '#437BBD', unit: 'Km',
      },
      {
        name: '行驶时间', count: 0, bgColor: '#C37F42', unit: '分钟',
      },
      {
        name: '耗油量', count: 0, bgColor: '#9A3FC0', unit: 'L',
      },
      {
        name: '平均油耗', count: 0, bgColor: '#CC5676', unit: 'L/100Km',
      },
    ];
  }

  createdDrivingData(time: any, str?: string) {
    getDrivingData(time).then((res) => {
      if (res.result.resultCode === '0') {
        const {
          drivingCount, drivingMileage, drivingMinute, drivingOil,
          avgOilCount, speedUpCount, speedDownCount, sharpTurnCount,
          overSpeed, shockCount, impactCount, overTurn,
        } = res.entity;
        // 行驶数据
        this.resetDriveData();
        this.driveData[0].count = drivingCount || 0; // 行驶次数
        this.driveData[1].count = drivingMileage || 0; // 行驶里程
        this.driveData[2].count = drivingMinute || 0; // 行驶时间
        this.driveData[3].count = drivingOil || 0; // 耗油量
        this.driveData[4].count = avgOilCount ? avgOilCount.toFixed(2) : 0; // 平均油耗
        // 柱状图
        this.columData[0].num = speedUpCount || 0; // 急加速
        this.columData[1].num = speedDownCount || 0; // 急减速
        this.columData[2].num = sharpTurnCount || 0; // 急转弯
        this.columData[3].num = overSpeed || 0; // 超速
        this.columData[4].num = shockCount || 0; // 振动
        this.columData[5].num = impactCount || 0; // 碰撞
        this.columData[6].num = overTurn || 0; // 翻滚
        this.columDataChange = true;
        this.createColumnarChart(str);
      }
    });
  }

  // 获取行驶统计数据
  GetDrivingData() {
    const day: any = new Date();
    const time = {
      endTime: day.Format('yyyy-MM-dd hh:mm:ss'),
      startTime: `${day.Format('yyyy-MM-dd hh:mm:ss').replace(/\s\w+:\w+:\w+/g, '')} 00:00:00`,
    };
    this.createdDrivingData(time);
  }

  // 获取告警统计数据
  GetAlarmData() {
    getAlarmData(null).then((res) => {
      if (res.result.resultCode === '0') {
        res.entity.forEach((item: any) => {
          item.name = item.type;
        });
        this.alarmData = res.entity;
        this.alarmDataChange = true;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 获取围栏内外数据
  GetFenceData() {
    getFenceData(null).then((res) => {
      if (res.result.resultCode === '0') {
        this.fenceData = res.entity;
        this.fenceDataChange = true;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 获取车辆统计数据
  GetOnlineData() {
    getOnlineData(null).then((res) => {
      if (res.result.resultCode === '0') {
        const data: any = JSON.parse(JSON.stringify(res.entity));
        const onlinePercent: number = Number(
          (data.online / (data.online + data.offline)).toFixed(1)
        );
        const obj1 = {
          item: '在线',
          count: data.online,
          percent: onlinePercent,
        };
        const obj2 = {
          item: '离线',
          count: data.offline,
          percent: 1 - onlinePercent,
        };
        this.totalCount = data.moving;
        this.circleData.push(obj1, obj2);
        this.drivingCount = data.offline + data.online;
        // 环状图表
        this.createCircleChart();
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 环状图表
  createCircleChart() {
    if (!this.circleChart) {
      this.circleChart = new window.G2.Chart({
        container: 'mountNode',
        forceFit: false,
        height: 300,
        width: 300,
        animate: true,
      });
    }
    this.circleChart.source(this.circleData, {
      percent: {
        formatter: function formatter(val: any) {
          val = `${val * 100}%`;
          return val;
        },
      },
    });
    this.circleChart.coord('theta', {
      radius: 0.70,
      innerRadius: 0.65,
    });
    this.circleChart.tooltip({
      showTitle: false,
      itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>',
    });
    // 辅助文本
    this.circleChart.guide().html({
      position: ['50%', '50%'],
      html: `<div style="color: #333333;font-size: 14px;text-align: center;width: 10em;">运行车辆<br><span style="color:#333333;font-size:20px">${this.totalCount}</span>台</div>`,
      alignX: 'middle',
      alignY: 'middle',
    });
    this.circleChart.intervalStack()
      .position('percent')
      .color('item', ['#00CA68', '#F25D56'])
      .label('percent', {
        formatter: function formatter(val: any, item: any) {
          return `${item.point.item}`;
        },
      })
      .style({
        lineWidth: 2,
        stroke: '#fff',
      });
    this.circleChart.render();
  }

  // 柱状图表
  createColumnarChart(str?: string) {
    if (!this.columnarChart) {
      this.columnarChart = new window.G2.Chart({
        container: 'columnar',
        forceFit: true,
        height: 400,
        animate: true,
      });
    }
    // 柱状图
    this.columnarChart.source(this.columData);
    this.columnarChart.scale('num', {
      tickInterval: 10,
      alias: '次数',
    });
    this.columnarChart
      .interval()
      .position('name*num');
    if (str) {
      this.columnarChart.changeData(this.columData);
    } else {
      this.columnarChart.render();
    }
  }

  setHelloWord(time: any) {
    if (time > 0 && time < 12) {
      this.helloWord = '早上';
    } else if (time > 12 && time < 19) {
      this.helloWord = '下午';
    } else {
      this.helloWord = '晚上';
    }
  }

  goMonitor() {
    this.$router.push({ name: '车辆监控' });
  }

  cancelAllActive() {
    this.todayActive = false;
    this.sevendayActive = false;
    this.thirtydayActive = false;
    this.allActive = false;
  }

  toDayData() {
    this.cancelAllActive();
    this.todayActive = true;
    const day: any = new Date();
    const startTime = `${day.Format('yyyy-MM-dd hh:mm:ss').replace(/\s\w+:\w+:\w+/g, '')} 00:00:00`;
    const endTime = day.Format('yyyy-MM-dd hh:mm:ss');
    this.defaultTime = [
      new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
      new Date(new Date().getFullYear(), new Date().getMonth(),
        new Date().getDate(), new Date().getHours(), new Date().getMinutes(),
        new Date().getSeconds()),
    ];
    const time = {
      startTime,
      endTime,
    };
    this.createdDrivingData(time, 'refresh');
  }

  unix2time(num: any) {
    const date = new Date(num);
    const Y = `${date.getFullYear()}-`;
    const M = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`;
    const D = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()} `;
    const h = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:`;
    const m = `${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:`;
    const s = (date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds());
    return Y + M + D + h + m + s;
  }

  sevenData() {
    this.cancelAllActive();
    this.sevendayActive = true;
    const day: any = new Date();
    const endTime = day.Format('yyyy-MM-dd hh:mm:ss');
    const oldTimestamp = new Date().getTime() - 6 * 24 * 60 * 60 * 1000;
    this.defaultTime = [
      new Date(oldTimestamp),
      new Date(),
    ];
    const time = {
      startTime: this.unix2time(oldTimestamp),
      endTime,
    };
    this.createdDrivingData(time, 'refresh');
  }

  thirtyData() {
    this.cancelAllActive();
    this.thirtydayActive = true;
    const day: any = new Date();
    const endTime = day.Format('yyyy-MM-dd hh:mm:ss');
    const oldTimestamp = new Date().getTime() - 29 * 24 * 60 * 60 * 1000;
    this.defaultTime = [
      new Date(oldTimestamp),
      new Date(),
    ];
    const time = {
      startTime: this.unix2time(oldTimestamp),
      endTime,
    };
    this.createdDrivingData(time, 'refresh');
  }

  allData() {
    this.cancelAllActive();
    this.allActive = true;
    const day: any = new Date();
    const endTime = day.Format('yyyy-MM-dd hh:mm:ss');
    const oldTimestamp = new Date().getTime() - 89 * 24 * 60 * 60 * 1000;
    this.defaultTime = [
      new Date(oldTimestamp),
      new Date(),
    ];
    const time = {
      startTime: this.unix2time(oldTimestamp),
      endTime,
    };
    this.createdDrivingData(time, 'refresh');
  }

  timeSelect(data: any) {
    this.cancelAllActive();
    if (data) {
      const start = new Date(data[0]).getTime();
      const end = new Date(data[1]).getTime();
      if (end - start < 89 * 24 * 60 * 60 * 1000) {
        const time = {
          startTime: data[0],
          endTime: data[1],
        };
        this.createdDrivingData(time, 'refresh');
      } else {
        this.$message.error('查询时间范围最大为三个月，请重新选择');
      }
    }
  }

  render(h: any) {
    const pickerOptions = {
      disabledDate(time: any) {
        return time.getTime() > Date.now();
      },
    };
    return (
      <div class="fzkContainer">
        {/* 监控统计 */}
        {
          this.showOnlineData ? <div class="monitorArea">
            <div class="mask"></div>
            <div class="monitorCenter">
              <div id="mountNode" class="mountNode"></div>
              {
                this.circleData.length > 0 ? <div class="title">
                  <span style="marginRight:20px">{this.helloWord}好！当前{this.drivingCount}辆车处于监控中</span>
                  {
                    this.toMonitor
                      ? <el-button type="primary" id="goMonitor" plain size="small" class="iconfont iconfont-monitor" on-click={this.goMonitor}>   进入监控</el-button>
                      : null
                  }
                </div> : <div>
                    {
                      this.toMonitor
                        ? <el-button type="primary" id="goMonitor" plain size="small" class="iconfont iconfont-monitor" on-click={this.goMonitor}>   进入监控</el-button>
                        : null
                    }
                  </div>
              }
            </div>
          </div> : <div class="monitorArea">
              <div class="monitorCenter">
                <div class="title">
                  {
                    this.toMonitor
                      ? <el-button type="primary" id="goMonitor" plain size="small" class="iconfont iconfont-monitor" on-click={this.goMonitor}>   进入监控</el-button>
                      : null
                  }
                </div>
              </div>
            </div>
        }
        {/* 行驶统计 */}
        {
          this.showDrivingData ? <div class="driveArea">
            {
              this.columDataChange ? <div>
                <div class="title">
                  行驶数据统计
              </div>
                <div class="timeSet">
                  <ul class="normalTime">
                    <li
                      id="toDay"
                      class={['item', this.todayActive ? 'active' : '']}
                      on-click={this.toDayData}
                    >
                      今天
              </li>
                    <li
                      id="sevenDay"
                      class={['item', this.sevendayActive ? 'active' : '']}
                      on-click={this.sevenData}
                    >
                      近7天
              </li>
                    <li
                      id="thirtyDay"
                      class={['item', this.thirtydayActive ? 'active' : '']}
                      on-click={this.thirtyData}
                    >
                      近30天
              </li>
                    <li
                      id="allDay"
                      class={['item', this.allActive ? 'active' : '']}
                      on-click={this.allData}
                    >
                      全部
              </li>
                  </ul>
                  <el-date-picker
                    id="datePicker"
                    v-model={this.defaultTime}
                    type="datetimerange"
                    class="datePicker"
                    size="mini"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    on-change={(val: any) => this.timeSelect(val)}
                    range-separator="至"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    picker-options={pickerOptions}
                  >
                  </el-date-picker>
                </div>
              </div> : <div class="titleNone"></div>
            }
            <div class="driveBox">
              <div class="leftPart">
                <div id="columnar" class="columnar"></div>
              </div>
              {
                this.columDataChange ? <div>
                  {
                    this.driveData ? <ul class="rightPart">
                      {
                        this.driveData.map((item: any) => <li class="item">
                          <div class="name">
                            {item.name}
                            <span class="arrow arrowColor"></span>
                          </div>
                          <ul class="carList">
                            {
                              item.count !== null ? <span class="noData">{item.count}{item.unit}</span>
                                : <span class="noData">23333</span>
                            }
                          </ul>
                        </li>)
                      }
                    </ul> : null
                  }
                </div> : null
              }
            </div>
          </div> : <div class="driveArea">
            </div>
        }
        {/* 围栏内外 */}
        {
          this.showFenceData
            ? this.fenceDataChange
              ? <ul class="fenceCar">
                <li class="fenceItem">
                  <span>无围栏</span>
                  <span>{this.fenceData.noFence ? this.fenceData.noFence : 0} 辆</span>
                </li>
                <li class="fenceItem">
                  <span>围栏外</span>
                  <span>{this.fenceData.outFence ? this.fenceData.outFence : 0} 辆</span>
                </li>
                <li class="fenceItem">
                  <span>围栏内</span>
                  <span>{this.fenceData.inFence ? this.fenceData.inFence : 0} 辆</span>
                </li>
              </ul> : <ul class="fenceCar"></ul>
            : <ul class="fenceCar"></ul>
        }
        {/* 告警消息 */}
        {
          this.showAlarmData
            ? this.alarmDataChange
              ? <div class="alarmArea">
                <div class="title">
                  告警消息统计
                </div>
                <ul class="alarmData">
                  {
                    this.alarmData.map((item: any) => <li class="alarmItem">
                      <span>{item.name}</span>
                      <span><span style="color:red;marginRight: 3px;">{item.count}</span>次</span>
                    </li>)
                  }
                </ul>
              </div> : <div class="alarmArea"></div>
            : <div class="alarmArea"></div>
        }
      </div >
    );
  }
}
