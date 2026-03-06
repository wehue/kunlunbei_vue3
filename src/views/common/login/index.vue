<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { User, Lock, Key, View, Hide, CircleClose, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useTabsStore } from '@/stores/modules/tabs'
import { useKeepAliveStore } from '@/stores/modules/keepAlive'
import { userLogin } from '@/api/login'

const router = useRouter()
const userStore = useUserStore()
const tabsStore = useTabsStore()
const keepAliveStore = useKeepAliveStore()

const loginFormRef = ref()
const loading = ref(false)
const showPassword = ref(false)
const captchaCode = ref('')
const captchaImg = ref('')
const captchaInput = ref('')

const loginForm = reactive({
  userName: '',
  password: '',
  remember: false,
})

const loginRules = reactive({
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})

const generateCaptcha = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 120
  canvas.height = 40

  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  captchaCode.value = code.toLowerCase()

  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = 'bold 24px Arial'
  for (let i = 0; i < code.length; i++) {
    ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
    ctx.fillText(code[i], 20 + i * 25, 30)
  }

  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.stroke()
  }

  captchaImg.value = canvas.toDataURL('image/png')
}

const validatePassword = (password) => {
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const lengthValid = password.length >= 8 && password.length <= 20
  const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  return {
    valid: lengthValid && strength >= 3,
    strength,
  }
}

const login = (formEl) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) return

    if (!captchaInput.value) {
      ElMessage.warning('请输入验证码')
      return
    }
    if (captchaInput.value.toLowerCase() !== captchaCode.value) {
      ElMessage.error('验证码错误')
      generateCaptcha()
      captchaInput.value = ''
      return
    }

    loading.value = true
    try {
      // 构建登录请求参数，只传递userName和password
      const loginData = {
        userName: loginForm.userName,
        password: loginForm.password,
      }

      // 调用登录API
      const res = await userLogin(loginData)
      console.log('登录成功响应:', res)

      if (res.data.code === 200) {
        const token = res.data.data.token
        const userInfo = res.data.data.data

        if (loginForm.remember) {
          localStorage.setItem('rememberedUserName', loginForm.userName)
        } else {
          localStorage.removeItem('rememberedUserName')
        }

        // 保存token和用户信息
        userStore.setToken(token)
        userStore.setUserInfo({
          id: userInfo?.id,
          name:
            userInfo?.userName ||
            userInfo?.name ||
            userInfo?.username ||
            loginForm.userName ||
            '用户',
          role: userInfo?.role,
        })

        tabsStore.setTabs([])
        keepAliveStore.setKeepAliveName([])

        const roleHomeMap = {
          Admin: '/admin-index',
          Supervisor: '/supervisor-index',
          Designer: '/designer-index',
          admin: '/admin-index',
          designer: '/designer-index',
          supervisor: '/supervisor-index',
        }

        const userRole = userInfo?.role

        router.push(roleHomeMap[userRole] || '/admin-index')
        ElNotification({
          title: '欢迎登录',
          message: `欢迎回来，${userInfo?.userName || userInfo?.name || userInfo?.username || loginForm.userName || '用户'}`,
          type: 'success',
          duration: 3000,
        })
      } else {
        ElMessage.error(res.message || '登录失败')
        generateCaptcha()
        captchaInput.value = ''
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请稍后重试')
      generateCaptcha()
      captchaInput.value = ''
    } finally {
      loading.value = false
    }
  })
}

const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
  captchaInput.value = ''
}

const goToRegister = () => {
  router.push('/register')
}

const goToPasswordFind = () => {
  router.push('/password-find')
}

onMounted(() => {
  generateCaptcha()
  const rememberedUserName = localStorage.getItem('rememberedUserName')
  if (rememberedUserName) {
    loginForm.userName = rememberedUserName
    loginForm.remember = true
  }

  document.onkeydown = (e) => {
    if (e.code === 'Enter' || e.code === 'enter' || e.code === 'NumpadEnter') {
      if (loading.value) return
      login(loginFormRef.value)
    }
  }
})

onBeforeUnmount(() => {
  document.onkeydown = null
})
</script>

<template>
  <div class="login-container flx-center">
    <div class="login-box">
      <div class="login-left">
        <img class="login-left-img" src="@/assets/images/login_left.png" alt="login" />
      </div>
      <div class="login-form">
        <div class="login-logo">
          <img class="login-icon" src="@/assets/images/logo.png" alt="昆仑杯" />
          <h2 class="logo-text">智造精艺</h2>
        </div>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
          <el-form-item prop="userName">
            <el-input v-model="loginForm.userName" placeholder="请输入用户名">
              <template #prefix>
                <el-icon class="el-input__icon">
                  <User />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              show-password
              autocomplete="new-password"
            >
              <template #prefix>
                <el-icon class="el-input__icon">
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="captcha-row">
              <el-input v-model="captchaInput" placeholder="请输入验证码">
                <template #prefix>
                  <el-icon class="el-input__icon">
                    <Key />
                  </el-icon>
                </template>
              </el-input>
              <img
                :src="captchaImg"
                class="captcha-img"
                @click="generateCaptcha"
                alt="点击刷新验证码"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住账号</el-checkbox>
              <el-link type="primary" underline="never" @click="goToPasswordFind"
                >忘记密码？</el-link
              >
            </div>
          </el-form-item>
        </el-form>
        <div class="login-btn">
          <el-button :icon="CircleClose" round size="large" @click="resetForm(loginFormRef)">
            重置
          </el-button>
          <el-button
            :icon="UserFilled"
            round
            size="large"
            type="primary"
            :loading="loading"
            @click="login(loginFormRef)"
          >
            登录
          </el-button>
        </div>
        <div class="login-footer">
          还没有账号？<el-link type="primary" underline="never" @click="goToRegister"
            >立即注册</el-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  height: 100%;
  min-height: 550px;
  background-color: #eeeeee;
  background-image: url('@/assets/images/login_bg.svg');
  background-size: 100% 100%;
  background-size: cover;
  .login-box {
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 96.5%;
    height: 94%;
    padding: 0 50px;
    background-color: rgb(255 255 255 / 80%);
    border-radius: 10px;
    .login-left {
      width: 800px;
      margin-right: 10px;
      .login-left-img {
        width: 100%;
        height: 100%;
      }
    }
    .login-form {
      width: 420px;
      padding: 50px 40px 45px;
      background-color: var(--el-bg-color);
      border-radius: 10px;
      box-shadow: rgb(0 0 0 / 10%) 0 2px 10px 2px;
      .login-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 45px;
        .login-icon {
          width: 100px;
          height: 100px;
        }
        .logo-text {
          padding: 0 0 0 25px;
          margin: 0;
          font-size: 42px;
          font-weight: bold;
          color: #34495e;
          white-space: nowrap;
          text-align: center;
          font-family: 'Courier New', monospace;
        }
      }
      .el-form-item {
        margin-bottom: 20px;
      }
      .captcha-row {
        display: flex;
        gap: 12px;
        width: 100%;
        .el-input {
          flex: 1;
        }
        .captcha-img {
          height: 40px;
          cursor: pointer;
          border-radius: 4px;
        }
      }
      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      .login-btn {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-top: 20px;
        white-space: nowrap;
        .el-button {
          width: 185px;
        }
      }
      .login-footer {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #666;
      }
    }
  }
}

@media screen and (width <= 1250px) {
  .login-left {
    display: none;
  }
}

@media screen and (width <= 600px) {
  .login-form {
    width: 97% !important;
  }
}
</style>
