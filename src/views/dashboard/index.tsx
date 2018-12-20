import { Component, Vue } from 'vue-property-decorator';
import { Button, DatePicker } from 'element-ui';
import { getAlarmData, getDrivingData, getVehicleData } from '@/api/dashboard';
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
  alarmData: any = []

  // G2 对数据源格式的要求，仅仅是 JSON 数组，数组的每个元素是一个标准 JSON 对象。
  // 圆环数据
  circleData: any = [
    { item: '在线', count: 80, percent: 0.8 },
    { item: '离线', count: 20, percent: 0.2 },
  ];

  columData: any = [
    { name: '急加速', num: 0 },
    { name: '急减速', num: 0 },
    { name: '急转弯', num: 0 },
    { name: '轻震动', num: 0 },
    { name: '轻碰撞', num: 0 },
    { name: '重碰撞', num: 0 },
    { name: '翻滚', num: 0 },
  ];

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

  // 行驶数据排行
  driveRankData: any = [
    { name: '行驶次数', arr: [] },
    { name: '行驶里程', arr: [] },
    { name: '行驶时间', arr: [] },
    { name: '耗油量', arr: [] },
    { name: '平均油耗', arr: [] },
  ];

  totalCount: number = 100;

  drivingCount: number = 100;

  helloWord: string = '';

  // 搜索时间范围
  nowDate: any = '';

  startTime: string = '';

  endTime: string = '';

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

  created() {
    const getNowRoles: string[] = [
      // 操作
      '/vehicle/monitor/list',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.toMonitor = !!(res[0]);
    });
    // 获取告警统计数据
    this.GetAlarmData();
    // 获取车辆统计数据
    // this.GetVehicleData();
    // 获取行驶统计数据
    this.GetDrivingData();
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

  columnarChart: any = null;

  circleChart: any = null;

  createdDrivingData(time: any, str?: string) {
    getDrivingData(time).then((res) => {
      if (res.result.resultCode === '0') {
        this.$message.success('查询成功');
        const {
          drivingCount, mileageCount, drivingTimeCount, oilCount,
          avgOilCons, speedUpCount, speedDownCount, turnCount,
          lightShakeCount, ligntHitCount, heavyHitCount, rollCount,
          avgOilCountTop3, drivingCountTop3, drivingTimeTop3, mileageCountTop3, oilCountTop3,
        } = res.entity;
        // 行驶数据
        this.resetDriveData();
        this.driveData[0].count = drivingCount || 0;
        this.driveData[1].count = mileageCount || 0;
        this.driveData[2].count = drivingTimeCount || 0;
        this.driveData[3].count = oilCount || 0;
        this.driveData[4].count = avgOilCons ? avgOilCons.toFixed(2) : 0;
        // 柱状图
        this.columData[0].num = speedUpCount || 0;
        this.columData[1].num = speedDownCount || 0;
        this.columData[2].num = turnCount || 0;
        this.columData[3].num = lightShakeCount || 0;
        this.columData[4].num = ligntHitCount || 0;
        this.columData[5].num = heavyHitCount || 0;
        this.columData[6].num = rollCount || 0;
        this.createColumnarChart(str);
        // 行驶次数
        if (drivingCountTop3.length > 0) {
          this.driveRankData[0].arr = [];
          drivingCountTop3.forEach((item: any) => {
            this.driveRankData[0].arr.push({
              plateNum: item.platenum,
              count: item.drivingCount,
            });
          });
        } else {
          this.driveRankData[0].arr = [];
        }
        // 行驶里程
        if (mileageCountTop3.length > 0) {
          this.driveRankData[1].arr = [];
          mileageCountTop3.forEach((item: any) => {
            this.driveRankData[1].arr.push({
              plateNum: item.platenum,
              count: item.mileageCount,
            });
          });
        } else {
          this.driveRankData[1].arr = [];
        }
        // 行驶时间
        if (drivingTimeTop3.length > 0) {
          this.driveRankData[2].arr = [];
          drivingTimeTop3.forEach((item: any) => {
            this.driveRankData[2].arr.push({
              plateNum: item.platenum,
              count: item.drivingTimeCount,
            });
          });
        } else {
          this.driveRankData[2].arr = [];
        }
        // 耗油量
        if (oilCountTop3.length > 0) {
          this.driveRankData[3].arr = [];
          oilCountTop3.forEach((item: any) => {
            this.driveRankData[3].arr.push({
              plateNum: item.platenum,
              count: item.oilCount,
            });
          });
        } else {
          this.driveRankData[3].arr = [];
        }
        // 平均油耗
        if (avgOilCountTop3.length > 0) {
          this.driveRankData[4].arr = [];
          avgOilCountTop3.forEach((item: any) => {
            this.driveRankData[4].arr.push({
              plateNum: item.platenum,
              count: item.avgOilCount,
            });
          });
        } else {
          this.driveRankData[4].arr = [];
        }
      } else {
        this.$message.error(res.result.resultMessage);
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
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 获取车辆统计数据
  GetVehicleData() {
    getVehicleData(null).then((res) => {
      if (res.result.resultCode === '0') {
        const data: any = JSON.parse(JSON.stringify(res.entity));
        const onlinePercent = Math.round(
          data.onlineCount / (data.onlineCount + data.offlineCount) * 100,
        ) / 100;
        const offlinePercent = Math.round(
          data.offlineCount / (data.onlineCount + data.offlineCount) * 100,
        ) / 100;
        const obj1 = {
          item: '在线',
          count: data.onlineCount,
          percent: onlinePercent,
        };
        const obj2 = {
          item: '离线',
          count: data.offlineCount,
          percent: offlinePercent,
        };
        this.totalCount = data.count;
        this.circleData.push(obj1, obj2);
        this.drivingCount = data.drivingCount;
        // 环状图表
        this.createCircleChart();
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  // 环状图表
  createCircleChart() {
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
          return `${item.point.item}:${val}`;
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
    // 柱状图
    this.columnarChart.source(this.columData);
    this.columnarChart.scale(this.columData.name, {
      tickInterval: 10,
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

  mounted() {
    // 时间
    this.nowDate = new Date();// 获取系统当前时间
    const myTime = this.nowDate.getHours() + (this.nowDate.getMinutes() * 0.01);
    this.setHelloWord(myTime);
    this.columnarChart = new window.G2.Chart({
      container: 'columnar',
      forceFit: true,
      height: 370,
      animate: true,
    });
    this.circleChart = new window.G2.Chart({
      container: 'mountNode',
      forceFit: false,
      height: 300,
      width: 300,
      animate: true,
    });
    this.createCircleChart();
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
    const oldTimestamp = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
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
    const oldTimestamp = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
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
    const oldTimestamp = new Date().getTime() - 90 * 24 * 60 * 60 * 1000;
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
      if (end - start < 90 * 24 * 60 * 60 * 1000) {
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
    return (
      <div class="container">
        <div class="monitorArea">
          <div class="mask"></div>
          <div class="monitorCenter">
            <div id="mountNode" class="mountNode"></div>
            <div class="title">
              <span style="marginRight:20px">{this.helloWord}好！当前{this.drivingCount}辆车处于监控中</span>
              {
                this.toMonitor
                  ? <el-button type="primary" id="goMonitor" plain size="small" class="iconfont iconfont-monitor" on-click={this.goMonitor}>   进入监控</el-button>
                  : null
              }
            </div>
          </div>
        </div>
        <div class="driveArea">
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
              end-placeholder="结束">
            </el-date-picker>
          </div>
          <div class="driveBox">
            <div class="leftPart">
              <ul class="top">
                {
                  this.driveData.map((item: any) => <li class="item">
                    {item.name}
                    <br />
                    {item.count}{item.unit}
                  </li>)
                }
              </ul>
              <div id="columnar" class="columnar"></div>
            </div>
            <ul class="rightPart">
              {
                this.driveRankData.map((item: any) => <li class="item">
                  <div class="name">
                    {item.name}
                    <span class="arrow arrowColor"></span>
                  </div>
                  <ul class="carList">
                    {
                      item.arr.length > 0
                        ? item.arr.map((data: any) => <li class="carDetail">
                          <span>{data.plateNum}</span>
                          <span>{data.count}</span>
                        </li>) : <span class="noData">暂无数据</span>
                    }
                  </ul>
                </li>)
              }
            </ul>
          </div>
        </div>
        <div class="alarmArea">
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
        </div>
      </div >
    );
  }
}
