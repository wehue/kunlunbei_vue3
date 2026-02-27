<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { User, Lock, Key, View, Hide, Iphone, CircleClose, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const currentStep = ref(1)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const captchaText = ref('')
const captchaInput = ref('')
const countdown = ref(0)

const findForm = reactive({
  account: '',
  phone: '',
  verifyCode: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordStrength = computed(() => {
  const password = findForm.newPassword
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

const sendVerifyCode = () => {
  if (!findForm.phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(findForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (!captchaInput.value) {
    ElMessage.warning('请输入图形验证码')
    return
  }
  if (captchaInput.value.toLowerCase() !== captchaText.value.toLowerCase()) {
    ElMessage.error('验证码错误')
    generateCaptcha()
    captchaInput.value = ''
    return
  }

  countdown.value = 60
  ElMessage.success('验证码已发送')

  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const validateStep1 = () => {
  if (!findForm.account) {
    ElMessage.warning('请输入账号')
    return false
  }
  if (!findForm.phone) {
    ElMessage.warning('请输入手机号')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(findForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return false
  }
  if (!findForm.verifyCode) {
    ElMessage.warning('请输入短信验证码')
    return false
  }
  return true
}

const validateStep2 = () => {
  if (!findForm.newPassword) {
    ElMessage.warning('请输入新密码')
    return false
  }
  if (passwordStrength.value.level < 2) {
    ElMessage.warning('密码强度不足')
    return false
  }
  if (findForm.newPassword !== findForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return false
  }
  return true
}

const handleNextStep = () => {
  if (!validateStep1()) return
  loading.value = true
  setTimeout(() => {
    loading.value = false
    currentStep.value = 2
    ElNotification({
      title: '身份验证通过',
      message: '请设置新密码',
      type: 'success',
      duration: 3000,
    })
  }, 800)
}

const handleResetPassword = async () => {
  if (!validateStep2()) return
  loading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    ElNotification({
      title: '密码重置成功',
      message: '请使用新密码登录',
      type: 'success',
      duration: 3000,
    })
    router.push('/login')
  } catch (error) {
    console.error('密码重置失败:', error)
    ElMessage.error('密码重置失败，请稍后重试')
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
  <div class="password-find-container flx-center">
    <div class="find-box">
      <div class="find-left">
        <img class="find-left-img" src="@/assets/images/login_left.png" alt="find" />
      </div>
      <div class="find-form">
        <div class="find-logo">
          <img class="find-icon" src="@/assets/images/logo.png" alt="昆仑杯" />
          <h2 class="logo-text">找回密码</h2>
        </div>
        <div class="step-indicator">
          <div class="step" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
            <span class="step-num">1</span>
            <span class="step-text">验证身份</span>
          </div>
          <div class="step-line" :class="{ active: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep >= 2 }">
            <span class="step-num">2</span>
            <span class="step-text">重置密码</span>
          </div>
        </div>
        <el-form v-if="currentStep === 1" :model="findForm" size="large">
          <el-form-item>
            <el-input v-model="findForm.account" placeholder="请输入账号">
              <template #prefix>
                <el-icon class="el-input__icon">
                  <User />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="findForm.phone" placeholder="请输入绑定的手机号">
              <template #prefix>
                <el-icon class="el-input__icon">
                  <Iphone />
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
            <div class="sms-row">
              <el-input v-model="findForm.verifyCode" placeholder="请输入短信验证码" maxlength="6">
                <template #prefix>
                  <el-icon class="el-input__icon">
                    <Key />
                  </el-icon>
                </template>
              </el-input>
              <el-button
                type="primary"
                size="large"
                :disabled="countdown > 0"
                @click="sendVerifyCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <div class="find-btn">
              <el-button :icon="CircleClose" round size="large" @click="captchaInput = ''">
                重置
              </el-button>
              <el-button
                :icon="UserFilled"
                round
                size="large"
                type="primary"
                :loading="loading"
                @click="handleNextStep"
              >
                下一步
              </el-button>
            </div>
          </el-form-item>
        </el-form>
        <el-form v-if="currentStep === 2" :model="findForm" size="large">
          <el-form-item>
            <el-input
              v-model="findForm.newPassword"
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
            <div v-if="findForm.newPassword" class="password-strength">
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
              v-model="findForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入新密码"
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
            <div class="find-btn">
              <el-button :icon="CircleClose" round size="large" @click="currentStep = 1">
                上一步
              </el-button>
              <el-button
                :icon="UserFilled"
                round
                size="large"
                type="primary"
                :loading="loading"
                @click="handleResetPassword"
              >
                确认重置
              </el-button>
            </div>
          </el-form-item>
        </el-form>
        <div class="find-footer">
          <el-link type="primary" :underline="false" @click="goToLogin">返回登录</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.password-find-container {
  height: 100%;
  min-height: 550px;
  background-color: #eeeeee;
  background-image: url('@/assets/images/login_bg.svg');
  background-size: 100% 100%;
  background-size: cover;
  .find-box {
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
    .find-left {
      width: 800px;
      margin-right: 10px;
      .find-left-img {
        width: 100%;
        height: 100%;
      }
    }
    .find-form {
      width: 420px;
      padding: 40px 40px 35px;
      background-color: var(--el-bg-color);
      border-radius: 10px;
      box-shadow: rgb(0 0 0 / 10%) 0 2px 10px 2px;
      .find-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 30px;
        .find-icon {
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
      .step-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 32px;
        .step {
          display: flex;
          align-items: center;
          gap: 8px;
          .step-num {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #e4e7ed;
            color: #909399;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 500;
          }
          .step-text {
            font-size: 14px;
            color: #909399;
          }
          &.active {
            .step-num {
              background: #409eff;
              color: #fff;
            }
            .step-text {
              color: #409eff;
            }
          }
          &.done {
            .step-num {
              background: #67c23a;
              color: #fff;
            }
          }
        }
        .step-line {
          width: 60px;
          height: 2px;
          background: #e4e7ed;
          margin: 0 16px;
          &.active {
            background: #67c23a;
          }
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
      .captcha-row,
      .sms-row {
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
        .el-button {
          width: 120px;
        }
      }
      .find-btn {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-top: 15px;
        white-space: nowrap;
        .el-button {
          width: 185px;
        }
      }
      .find-footer {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #666;
      }

    }
  }
}

@media screen and (width <= 1250px) {
  .find-left {
    display: none;
  }
}

@media screen and (width <= 600px) {
  .find-form {
    width: 97% !important;
  }
}
</style>
