import { Component, Vue } from 'vue-property-decorator';
import {
  Card, Input, Row, Form, Col, Checkbox, Button, FormItem,
} from 'element-ui';
import { getAlarmSetting, getAlarmModelList, saveAlarmModelList } from '@/api/system';
import './index.less';

@Component({
  components: {
    'el-card': Card,
    'el-input': Input,
    'el-row': Row,
    'el-col': Col,
    'el-checkbox': Checkbox,
    'el-button': Button,
    'el-form': Form,
    'el-form-item': FormItem,
  },
  name: 'Setting',
})
export default class Setting extends Vue {
  alarmModelList: any = [];

  alarmValueList: any = [];

  loading: boolean = false;

  // 编辑按钮
  saveBtn: boolean = true;

  // 权限设置
  created() {
    this.initData();
    const getNowRoles: string[] = [
      // 操作
      '/system/cfg/save',
    ];
    this.$store.dispatch('checkPermission', getNowRoles).then((res) => {
      this.saveBtn = !!(res[0]);
    });
  }

  initData() {
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

  contentRender(field: string, str: string, ind: number) {
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
    return content.map((item, index) => {
      let val: any = '';
      if (index !== content.length - 1) {
        val = /\(\w*\)/g.exec(result[index]);
        val = val ? val[0] : '';
      }
      return (
        <span>
          {item}
          {
            result[index] && (index !== content.length - 1) ? <input
              type="number"
              value={this.alarmValueList[ind][val.substring(1, val.length - 1)]}
              onInput={
                (e: any) => this.inputChange(e, ind, val.substring(1, val.length - 1), str)
              }
              class="alarm-input"></input> : null
          }
        </span>
      );
    });
  }

  btnDisable: boolean = false;

  inputChange(e: any, ind: number, key: string, str: string) {
    // 是否是电压
    if (str.indexOf('电压') > -1) {
      if (key === 'fieldThreshold') {
        if (parseFloat(e.target.value) < 0) {
          this.btnDisable = true;
          this.$message.error('输入错误，请重新输入！');
        } else {
          this.btnDisable = false;
          this.alarmValueList[ind][key] = parseFloat(e.target.value);
        }
      } else if (parseInt(e.target.value, 10) < 0) {
        this.btnDisable = true;
        this.$message.error('输入错误，请重新输入！');
      } else {
        this.btnDisable = false;
        this.alarmValueList[ind][key] = parseInt(e.target.value, 10);
      }
    } else if (parseInt(e.target.value, 10) < 0) {
      this.btnDisable = true;
      this.$message.error('输入错误，请重新输入！');
    } else if (Number(e.target.value) < 0) {
      this.btnDisable = true;
      this.$message.error('输入错误，请重新输入！');
    } else {
      this.btnDisable = false;
      this.alarmValueList[ind][key] = parseInt(e.target.value, 10);
    }
  }

  checkBoxChange(e: any, data: any, indx: number) {
    this.alarmValueList.forEach((item: any) => {
      if (item.alarmCfgModelId === data.id) {
        item.enable = e;
      }
    });
  }

  findValue(id: number, value: string) {
    const line = this.alarmValueList.filter((item: any) => item.alarmCfgModelId === id);
    return line[0][value];
  }

  onSubmit() {
    this.loading = true;
    const alarmConfigDTOS: any = [];
    const obj: any = {};
    this.alarmValueList.forEach((item: any) => {
      alarmConfigDTOS.push({
        alarmCfgModelId: item.alarmCfgModelId,
        enable: item.enable,
        fieldThreshold: item.fieldThreshold,
        fqcy: item.fqcy,
        field: item.field,
        maxFqcy: item.maxFqcy,
      });
    });
    obj.alarmConfigDTOS = alarmConfigDTOS;
    saveAlarmModelList(obj).then((res) => {
      if (res.result.resultCode === '0') {
        setTimeout(() => {
          this.loading = false;
          this.initData();
          this.$message.success(res.result.resultMessage);
        }, 1500);
      } else {
        setTimeout(() => {
          this.loading = false;
          this.$message.error(res.result.resultMessage);
        }, 1500);
      }
    });
  }

  render(h: any) {
    const { alarmModelList, alarmValueList } = this;
    return (
      <div class="fzk-sys-container">
        <el-card class="box-card" shadow="never">
          <div class="header">
            <span class="title">告警设置</span>
          </div>
          {
            alarmModelList.length && alarmValueList.length ? alarmModelList.map((item: any, index: number) => <div class="item">
              <el-checkbox
                id={item.field}
                on-change={(e: any) => this.checkBoxChange(e, item, index)}
                checked={this.findValue(item.id, 'enable')}
              ></el-checkbox> <span class="itemTitle">{item.alarmTypeName}:</span>
              {
                alarmValueList.map((items: any, indexs: number) => {
                  if (items.alarmCfgModelId === item.id) {
                    return this.contentRender(item.field, item.content, indexs);
                  }
                  return '';
                })
              }
            </div>) : null
          }
          {
            this.saveBtn
              ? <div class="bottom-btn">
                <el-button id="button" on-click={this.onSubmit} disabled={this.btnDisable} loading={this.loading} type="primary">保存</el-button>
              </div> : null
          }
        </el-card>
      </div>
    );
  }
}
