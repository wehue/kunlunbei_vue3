<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key, View, Hide, Iphone } from '@element-plus/icons-vue'

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
    ElMessage.success('身份验证通过')
  }, 800)
}

const handleResetPassword = async () => {
  if (!validateStep2()) return

  loading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    ElMessage.success('密码重置成功！')
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
  <div class="password-find-container">
    <div class="find-box">
      <div class="find-header">
        <img src="@/assets/images/logo.svg" alt="Logo" class="logo" />
        <h1>找回密码</h1>
        <p>通过手机验证码重置密码</p>
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

      <el-form v-if="currentStep === 1" :model="findForm" class="find-form" @submit.prevent="handleNextStep">
        <div class="form-item">
          <label>账号</label>
          <el-input
            v-model="findForm.account"
            placeholder="请输入账号"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </div>

        <div class="form-item">
          <label>手机号</label>
          <el-input
            v-model="findForm.phone"
            placeholder="请输入绑定的手机号"
            size="large"
            :prefix-icon="Iphone"
            clearable
          />
        </div>

        <div class="form-item">
          <label>图形验证码</label>
          <div class="captcha-row">
            <el-input
              v-model="captchaInput"
              placeholder="请输入验证码"
              size="large"
              :prefix-icon="Key"
              clearable
            />
            <div class="captcha-box" @click="generateCaptcha">
              {{ captchaText }}
            </div>
          </div>
        </div>

        <div class="form-item">
          <label>短信验证码</label>
          <div class="sms-row">
            <el-input
              v-model="findForm.verifyCode"
              placeholder="请输入短信验证码"
              size="large"
              :prefix-icon="Key"
              clearable
              maxlength="6"
            />
            <el-button
              type="primary"
              size="large"
              :disabled="countdown > 0"
              @click="sendVerifyCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </div>

        <el-button
          type="primary"
          size="large"
          class="next-btn"
          :loading="loading"
          @click="handleNextStep"
        >
          下一步
        </el-button>
      </el-form>

      <el-form v-if="currentStep === 2" :model="findForm" class="find-form" @submit.prevent="handleResetPassword">
        <div class="form-item">
          <label>新密码</label>
          <el-input
            v-model="findForm.newPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="8-20位，包含字母、数字、特殊字符"
            size="large"
            :prefix-icon="Lock"
            clearable
          >
            <template #suffix>
              <el-icon class="toggle-password" @click="showPassword = !showPassword">
                <component :is="showPassword ? View : Hide" />
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
        </div>

        <div class="form-item">
          <label>确认密码</label>
          <el-input
            v-model="findForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入新密码"
            size="large"
            :prefix-icon="Lock"
            clearable
          >
            <template #suffix>
              <el-icon class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                <component :is="showConfirmPassword ? View : Hide" />
              </el-icon>
            </template>
          </el-input>
        </div>

        <el-button
          type="primary"
          size="large"
          class="reset-btn"
          :loading="loading"
          @click="handleResetPassword"
        >
          确认重置
        </el-button>
      </el-form>

      <div class="form-footer">
        <el-link type="primary" :underline="false" @click="goToLogin">返回登录</el-link>
      </div>

      <div class="help-info">
        <p>如手机号已更换，请联系管理员：admin@kunlunbei.com</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.password-find-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;

  .find-box {
    width: 100%;
    max-width: 420px;
    background: #fff;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .find-header {
      text-align: center;
      margin-bottom: 24px;

      .logo {
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
      }

      h1 {
        font-size: 24px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 8px 0;
      }

      p {
        font-size: 14px;
        color: #666;
        margin: 0;
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

    .find-form {
      .form-item {
        margin-bottom: 20px;

        label {
          display: block;
          font-size: 14px;
          color: #333;
          margin-bottom: 8px;
          font-weight: 500;
        }
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

      .toggle-password {
        cursor: pointer;
        color: #999;

        &:hover {
          color: #409eff;
        }
      }

      .next-btn,
      .reset-btn {
        width: 100%;
        height: 44px;
        font-size: 16px;
      }
    }

    .form-footer {
      text-align: center;
      margin-top: 16px;
    }

    .help-info {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      text-align: center;

      p {
        font-size: 12px;
        color: #999;
        margin: 0;
      }
    }
  }
}
</style>
