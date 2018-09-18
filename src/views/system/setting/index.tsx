import { Component, Vue, Emit } from 'vue-property-decorator';
import { Card, Input, Row, Col, Checkbox } from 'element-ui';
import { getAlarmSetting, getAlarmModelList } from '@/api/system';
import './index.less';

@Component({
  components: {
  'el-card': Card,
  'el-input': Input,
  'el-row': Row,
  'el-col': Col,
  'el-checkbox': Checkbox
  }
  })
export default class Setting extends Vue {
  alarmModelList: any = [];
  alarmValueList: any = [];

  created() {
    getAlarmModelList(null).then((res: any) => {
      if (res.result.resultCode === '0') {
        this.alarmModelList = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
    getAlarmSetting(null).then((res) => {
      if (res.result.resultCode === '0') {
        this.alarmValueList = res.entity;
      } else {
        this.$message.error(res.result.resultMessage);
      }
    });
  }

  contentRender(str: string, params: object) {
    const regular = /\[input\(\w*\)\]/g;
    // 分割字符串和替换掉input框
    const content: string[] = str.split(regular);
    // 循环匹配input输入框
    const result: string[] = [];
    let on;
    do {
      on = regular.exec(str);
      if (on != null) {
        result.push(on[0]);
      }
    } while (on != null);
    // 循环字符串，并在字符串中间插入input框
    console.log(result);
    // v-model={params[/\(\w*\)/g.exec(result[index]) ? /\(\w*\)/g.exec(result[index]) : 'null']}
    return content.map((item, index) => (
      <span>
        {item}
        {
          result[index] && (index !== content.length - 1) ? <el-input class="alarm-input"></el-input> : null
        }
      </span>
    ));
  }

  render(h: any) {
    const { alarmModelList, alarmValueList } = this;
    return (
      <div class="container">
        <el-card class="box-card">
          <div class="header">
            <span class="title">告警设置</span>
          </div>
          {
            alarmModelList.length && alarmValueList.length ? alarmModelList.map((item: any, index: number) => <div class="item">
              <el-checkbox checked></el-checkbox> <span class="itemTitle">{item.alarmTypeName}:</span>
              {this.contentRender(item.content, alarmValueList.filter((items: any) =>
                items.field === item.field)[0])
              }
            </div>) : null
          }
        </el-card>
      </div>
    );
  }
}
