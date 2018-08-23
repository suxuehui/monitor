<template>
  <div class="loginWrap">
    <h2 class="loginTxt">欢迎使用<br>兴享融管理系统</h2>
    <div class="loginForm">
      <div class="logo">
        <img alt="logo" src="../../assets/logo.svg" >
        <span>{{config.name}}</span>
      </div>
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" size="small">
        <el-form-item prop="username">
          <el-input
            id="username"
            v-model="loginForm.username"
            prefix-icon="iconfont-user"
            placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            id="password"
            v-model="loginForm.password"
            prefix-icon="iconfont-lock"
            type="password"
            placeholder="请输入密码"/>
        </el-form-item>
        <el-form-item prop="captcha">
          <el-input
            id="captcha"
            v-model="loginForm.captcha"
            prefix-icon="iconfont-code"
            placeholder="请输入验证码"
            @keydown.enter="submitForm('ruleForm')"/>
          <img :src="codeImg" class="authcodeImg" alt="" @click="getCodeImg">
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue, Inject, Provide } from 'vue-property-decorator';
import { Form, FormItem, Button, Input } from 'element-ui';
import config from '@/utils/config';
import { login, getAuthCodeToken, getAuthCode } from '@/api/app';

@Component({
  components: {
  'el-form': Form,
  'el-form-item': FormItem,
  'el-button': Button,
  'el-input': Input,
  }
  })
export default class Login extends Vue {
  codeImg = '';
  loginForm: {
    username: string, password: string, captcha: string
  } = { username: '', password: '', captcha: '' };
  loginRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
    ],
    captcha: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
    ],
  };
  config = config;
  imgToken = '';
  created() {
    getAuthCodeToken(null).then((res) => {
      this.imgToken = res.entity;
      this.getCodeImg();
    });
  }
  getCodeImg() {
    getAuthCode({ account: this.imgToken }, this.imgToken).then((response) => {
      if (response.data) {
        this.codeImg = `data:image/png;base64,${response.data}`;
      }
    });
  }
  @Emit()
  submitForm() {
    (this.$refs.loginForm as Form).validate((valid: boolean) => {
      if (valid) {
        login({ ...this.loginForm, flagAuth: true }, this.imgToken).then((res) => {
          const { result: { resultCode, resultMessage }, entity } = res;
          if (resultCode !== '0') {
            this.$message.error(resultMessage);
            this.getCodeImg();
          } else {
            this.$message.success(resultMessage);
            localStorage.setItem('token', entity.token);
            this.$store.dispatch('getUserInfo').then(() => {
              this.$router.push('/');
            }).catch((error) => {
              this.$message.error(error);
            });
          }
        });
        return true;
      }
      return false;
    });
  }
  @Emit()
  resetForm() {
    (this.$refs.loginForm as Form).resetFields();
  }
}
</script>

<style lang="less" scoped>
.loginWrap {
  background: url('../../assets/login-bg.jpg') center no-repeat;
  background-size: cover;
  width: 100%;
  height: 100vh;
  .loginTxt {
    position: absolute;
    left: 30%;
    top: 50%;
    margin-top: -100px;
    font-size: 50px;
    color: #fff;
  }
}
.loginForm {
  position: absolute;
  top: 50%;
  left: 70%;
  margin: -180px 0 0 -160px;
  width: 320px;
  height: 360px;
  padding: 36px;
  box-shadow: 0 0 100px rgba(0,0,0,.08);
  background-color: #fff;
  border-radius: 6px;
  .el-form-item {
    margin-bottom: 26px;
  }
  button {
    width: 100%;
  }

  p {
    color: rgb(204, 204, 204);
    text-align: center;
    margin-top: 16px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
  }
}

.logo {
  text-align: center;
  cursor: pointer;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 46px;
    margin-right: 15px;
  }

  span {
    vertical-align: text-bottom;
    font-size: 16px;
    text-transform: uppercase;
    display: inline-block;
    font-weight: 700;
  }
}

.ant-spin-container,
.ant-spin-nested-loading {
  height: 100%;
}
.authcodeImg {
  position: absolute;
  right: 10px;
  top: 8px;
  width: 60px;
}

@media screen and (max-width: 1400px) {
  .loginWrap {
    .loginTxt {
      left: 20%;
    }
  }
}

@media screen and (max-width: 1200px) {
  .loginWrap {
    .loginTxt {
      left: 10%;
    }
  }
}

@media screen and (max-width: 900px) {
  .loginWrap {
    .loginTxt {
      display: none;
    }
    .loginForm {
      left: 50%;
    }
  }
  .form {
    left: 50%;
  }
}

</style>
