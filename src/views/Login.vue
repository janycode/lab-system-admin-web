<template>
  <vue-particles
    id="tsparticles"
    @particles-loaded="particlesLoaded"
    :options="tsparticlesConfig"
  />
  <div class="formContainer">
    <h3>智慧实验室平台管理系统</h3>
    <!-- el-form 中的 @submit.prevent 和 el-button 中的 native-type 可以让 button监听回车提交事件  -->
    <el-form
      ref="ruleFormRef"
      style="max-width: 600px"
      :model="ruleForm"
      :rules="rules"
      label-width="120px"
      class="ruleForm"
      status-icon
      @submit.prevent="submitForm(ruleFormRef)" 
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="ruleForm.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="ruleForm.password" type="password" />
      </el-form-item>

      <el-form-item>
        <!-- <el-button type="primary" @click="submitForm(ruleFormRef)"> 登陆 </el-button> -->
        <el-button type="primary" native-type="submit"> 登陆 </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"
import { useUserStore } from "../store/useUserStore"
import { reactive, ref } from "vue"
import { tsparticlesConfig } from '../util/tsparticlesConfig'
import { ElMessage } from "element-plus"
import axios from 'axios'

const particlesLoaded = async container => {
    console.log("粒子库 Particles container loaded", container);
};

// ref 获取表单对象
const ruleFormRef = ref()
const ruleForm = reactive({
  username: "",
  password: "",
})
const rules = reactive({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
})

const router = useRouter()
const userStore = useUserStore()

// 登陆回调
const submitForm = async formEl => {
  if (!formEl) return
  await formEl.validate( async (valid, fields) => {
    if (valid) {
      const res = await axios.post("/admin/users/login", ruleForm)
      let {code, data} = res.data
      if (code === 0) {
        userStore.changeUser(data)
        router.push("/")
      } else {
        ElMessage.error("用户名或密码不匹配！")
      }
    } else {
      console.log("错误提交!", fields)
    }
  })
}

</script>

<style lang="scss" scoped>
.formContainer {
  width: 500px;
  height: 300px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: yellow;
  text-shadow: 2px 2px 5px black;
  text-align: center;
  z-index: 100;
  .ruleForm {
    margin-top: 50px;
  }
  h3 {
    font-size: 35px;
  }
  :deep(.el-form-item__label) {
    color: white;
    font-weight: bold;
    font-size: 18px;
  }
}
</style>
