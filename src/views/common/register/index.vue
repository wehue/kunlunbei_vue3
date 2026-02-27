<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { User, Lock, Key, View, Hide, Iphone, CircleClose, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const captchaText = ref('')
const captchaInput = ref('')
const agreeTerms = ref(false)

const registerForm = reactive({
  account: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) return { level: 0, text: '', color: '' }

  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

  if (score <= 2) return { level: 1, text: '弱', color: '#f56c6c' }
  if (score <= 3) return { level: 2, text: '中', color: '#e6a23c' }
  return { level: 3, text: '强', color: '#67c23a' }
})

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = result
}

const validateForm = () => {
  if (!registerForm.account) {
    ElMessage.warning('请输入账号')
    return false
  }
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(registerForm.account)) {
    ElMessage.warning('账号必须以字母开头，只能包含字母、数字和下划线')
    return false
  }
  if (!registerForm.phone) {
    ElMessage.warning('请输入手机号')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return false
  }
  if (!registerForm.password) {
    ElMessage.warning('请输入密码')
    return false
  }
  if (passwordStrength.value.level < 2) {
    ElMessage.warning('密码强度不足')
    return false
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return false
  }
  if (!captchaInput.value) {
    ElMessage.warning('请输入验证码')
    return false
  }
  if (captchaInput.value.toLowerCase() !== captchaText.value.toLowerCase()) {
    ElMessage.error('验证码错误')
    generateCaptcha()
    captchaInput.value = ''
    return false
  }
  if (!agreeTerms.value) {
    ElMessage.warning('请阅读并同意用户协议')
    return false
  }
  return true
}

const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    ElNotification({
      title: '注册成功',
      message: '请使用新账号登录',
      type: 'success',
      duration: 3000,
    })
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  generateCaptcha()
})
</script>

<template>
  <div class="register-container flx-center">
    <div class="register-box">
      <div class="register-left">
        <img class="register-left-img" src="@/assets/images/login_left.png" alt="register" />
      </div>
      <div class="register-form">
        <div class="register-logo">
          <img class="register-icon" src="@/assets/images/logo.png" alt="昆仑杯" />
          <h2 class="logo-text">注册账号</h2>
        </div>
        <el-form :model="registerForm" size="large">
          <el-form-item>
            <el-input v-model="registerForm.phone" placeholder="请输入手机号">
              <template #prefix>
                <el-icon class="el-input__icon">
                  <Iphone />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="8-20位，包含字母、数字、特殊字符"
              show-password
            >
              <template #prefix>
                <el-icon class="el-input__icon">
                  <Lock />
                </el-icon>
              </template>
            </el-input>
            <div v-if="registerForm.password" class="password-strength">
              <div class="strength-bar">
                <div
                  class="strength-fill"
                  :style="{
                    width: passwordStrength.level * 33.33 + '%',
                    background: passwordStrength.color,
                  }"
                ></div>
              </div>
              <span class="strength-text" :style="{ color: passwordStrength.color }">
                密码强度：{{ passwordStrength.text }}
              </span>
            </div>
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="registerForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入密码"
              show-password
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
              <div class="captcha-box" @click="generateCaptcha">
                {{ captchaText }}
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="agreeTerms">
              我已阅读并同意<el-link type="primary" :underline="false">《用户协议》</el-link>和<el-link type="primary" :underline="false">《隐私政策》</el-link>
            </el-checkbox>
          </el-form-item>
        </el-form>
        <div class="register-btn">
          <el-button :icon="CircleClose" round size="large" @click="captchaInput = ''">
            重置
          </el-button>
          <el-button
            :icon="UserFilled"
            round
            size="large"
            type="primary"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </div>
        <div class="register-footer">
          已有账号？<el-link type="primary" :underline="false" @click="goToLogin">立即登录</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.register-container {
  height: 100%;
  min-height: 550px;
  background-color: #eeeeee;
  background-image: url('@/assets/images/login_bg.svg');
  background-size: 100% 100%;
  background-size: cover;
  .register-box {
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
    .register-left {
      width: 800px;
      margin-right: 10px;
      .register-left-img {
        width: 100%;
        height: 100%;
      }
    }
    .register-form {
      width: 420px;
      padding: 40px 40px 35px;
      background-color: var(--el-bg-color);
      border-radius: 10px;
      box-shadow: rgb(0 0 0 / 10%) 0 2px 10px 2px;
      .register-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 30px;
        .register-icon {
          width: 100px;
          height: 100px;
        }
        .logo-text {
          padding: 0 0 0 20px;
          margin: 0;
          font-size: 32px;
          font-weight: bold;
          color: #34495e;
          white-space: nowrap;
          font-family: 'Courier New', monospace;
        }
      }
      .el-form-item {
        margin-bottom: 18px;
      }
      .password-strength {
        margin-top: 8px;
        .strength-bar {
          height: 4px;
          background: #e4e7ed;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 4px;
          .strength-fill {
            height: 100%;
            transition: all 0.3s ease;
          }
        }
        .strength-text {
          font-size: 12px;
        }
      }
      .captcha-row {
        display: flex;
        gap: 12px;
        width: 100%;
        .el-input {
          flex: 1;
        }
        .captcha-box {
          width: 100px;
          height: 40px;
          background: #f5f5f5;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          font-weight: 600;
          font-family: 'Courier New', monospace;
          letter-spacing: 2px;
          color: #409eff;
          user-select: none;
          &:hover {
            background: #eee;
          }
        }
      }
      .register-btn {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-top: 15px;
        white-space: nowrap;
        .el-button {
          width: 185px;
        }
      }
      .register-footer {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #666;
      }
    }
  }
}

@media screen and (width <= 1250px) {
  .register-left {
    display: none;
  }
}

@media screen and (width <= 600px) {
  .register-form {
    width: 97% !important;
  }
}
</style>
