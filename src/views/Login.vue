<template>
  <div class="bg1">
    <video muted autoplay loop>
      <source :src="videoUrl" type="video/mp4" />
    </video>
  </div>
  <div class="bg2">
    <div class="line"></div>
    <div class="textArea">
      <p class="para">欢迎登陆</p>
      <p class="para">后台管理系统</p>
    </div>
    <div class="loginInput">
      <div class="form-control">
          <input v-model="username" type="value" required="">
          <label>
              <span style="transition-delay:0ms">U</span><span style="transition-delay:50ms">s</span><span style="transition-delay:100ms">e</span><span style="transition-delay:150ms">r</span><span style="transition-delay:200ms">n</span><span style="transition-delay:250ms">a</span><span style="transition-delay:300ms">m</span><span style="transition-delay:350ms">e</span>
          </label>
      </div>
      <div class="form-control">
          <input v-model="password" type="value" required="">
          <label>
              <span style="transition-delay:0ms">P</span><span style="transition-delay:50ms">a</span><span style="transition-delay:100ms">s</span><span style="transition-delay:150ms">s</span><span style="transition-delay:200ms">w</span><span style="transition-delay:250ms">o</span><span style="transition-delay:300ms">r</span><span style="transition-delay:350ms">d</span>
          </label>
      </div>
      <div class="remArea">
        <div class="icon">
          <img :src="OffUrl" v-if="!showFirstImage" @click="toggleImage" class="remImage"></img>
          <img :src="OnUrl" v-else @click="toggleImage" class="remImage"></img>
        </div>
        <div class="remText">
          <p class="text1">记住密码</p>
        </div>
      </div>
    </div>
    <div @click="handleLogin" class="loginBtn">
      <p class="text2">登录</p>
    </div>
  </div>
</template>

<script setup>

import videoUrl from "@/assets/video/login_bg_media.mp4";
import OnUrl from "@/assets/image/on.png";
import OffUrl from "@/assets/image/off.png";
import { onMounted, ref } from "vue";
import axios from "axios";

const showFirstImage = ref(0)
const username = ref("")
const password = ref("")
const error = ref(null)
const userStr = localStorage.getItem('user')
// const tokenStr = localStorage.getItem('token')

onMounted(()=>{
  if (userStr) {
    var list = JSON.parse(userStr);  
    console.log(list)
    username.value = list.username
    password.value = list.password
    showFirstImage.value = list.value
  } 
})

const toggleImage = () => {
  showFirstImage.value = !showFirstImage.value
  // if (tokenStr) {  
  //   const token = JSON.parse(tokenStr)
  //   console.log(token)
  // }
}

const handleLogin = async () => {
  if(showFirstImage.value == 1){
    var list = {
      "username": username.value,
      "password": password.value,
      "value" : 1
    }
    localStorage.setItem("user", JSON.stringify(list))
  }else{
    var list = {
      "username": "",
      "password": "",
      "value" : 0
    }
    localStorage.setItem("user", JSON.stringify(list))
  }
  var obj = {
    "username": username.value,
    "password": password.value
  };
  const formData = new FormData();
  Object.keys(obj).map((key) => {
    formData.append(key, obj[key]);
  });
  try {  
    const response = await axios.post('https://eat.vincent.0nline.tech/users/token', formData,
    {  
      headers: {  
        'Content-Type': 'multipartx/form-data'
      } 
  });  
    // 处理登录成功后的逻辑  
    console.log('Login successful', response.data);  
    var jsonObj = {}
    response.data.forEach((value, key) => (jsonObj[key] = value));
    localStorage.setItem('token', jsonObj)
    // 这里可以添加路由跳转等逻辑  


  } catch (error) {  
    if (error.response && error.response.data) {  
      // 假设后端返回了错误信息  
      error.value = error.response.data.message || 'Login failed';  
    } else {  
      error.value = 'An error occurred';  
    }  
  }  
  console.log(error)
}




</script>

<style scoped>
@import url('../assets/main.css');

.bg1 {
  position:absolute;
  height: 100%;
  width: 100%;
  top: 0%;
  left: 0%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: -1;
}

.bg1 video {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.bg2 {
  position: absolute;
  left: 68%;
  top: 17.5%;
  width: 22%;
  height: 65%;
  background-color: white;
  border-radius: 0 0 20px 20px;
  box-shadow: 0px 2px 0px rgba(0,0,0,25%);
  z-index: 1;
}

.line {
  position: relative;
  width: 100%;
  height: 0;
  border: solid 2px rgb(0, 157, 255);
}

.textArea {
  position: absolute;
  top: 15.9%;
  left: 11.5%;
  width: 51.5%;
}

.para {
  font-weight: bold;
  font-size: 29px;
  color: rgb(0, 157, 255);
}

.loginInput {
  position: absolute;
  top: 36%;
  left: 11.2%;
  width: 77.6%;
  height: 26%;
}

.loginBtn {
  position: absolute;
  top: 76.6%;
  left: 23.3%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 53%;
  height: 9.5%;
  background-color: rgb(0, 157, 255);
  border-radius: 20px;
}

.text2 {
  font-weight: bold;
  font-size: 20px;
  color: white;
}

.loginForm {
  position: relative;
  width: 100%;
  height: 29%;
  display: flex;
  align-items: center;
  border: solid 1px rgb(128, 125, 125);
  border-radius: 5px;
}

.form-control {
  position: relative;
  margin: 0 0 25px;
  width: 100%;
}

.form-control input {
  background-color: transparent;
  border: 0;
  border-bottom: 2px rgb(128, 125, 125) solid;
  display: block;
  width: 100%;
  padding: 10px 0;
  font-size: 18px;
  color: black;
}

.form-control input:focus,
.form-control input:valid {
  outline: 0;
  border-bottom-color: rgb(0, 157, 255);
}

.form-control label {
  position: absolute;
  top: 10px;
  left: 0;
  pointer-events: none;
}

.form-control label span {
  display: inline-block;
  font-size: 18px;
  min-width: 5px;
  color: rgb(128, 125, 125);
  transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.form-control input:focus+label span,
.form-control input:valid+label span {
  color: rgb(0, 157, 255);
  transform: translateY(-30px);
}

.remArea {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 110px;
  height: 24px;
}

.icon {
  position: relative;
  width: 24px;
  height: 24px;
}

.remImage {
  width: 24px;
  height: 24px;
}

.remText {
  position: relative;
  left: 5px;
  line-height: 25px;
}

.text1 {
  font-weight: bold;
  color: rgb(128, 125, 125);
}

</style>