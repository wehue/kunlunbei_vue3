<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key, View, Hide, Iphone } from '@element-plus/icons-vue'

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
    ElMessage.success('注册成功！请使用新账号登录')
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
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <img src="@/assets/images/logo.svg" alt="Logo" class="logo" />
        <h1>注册账号</h1>
        <p>创建您的昆仑贝账号</p>
      </div>

      <el-form :model="registerForm" class="register-form" @submit.prevent="handleRegister">
        <div class="form-item">
          <label>账号</label>
          <el-input
            v-model="registerForm.account"
            placeholder="字母开头，3-20位"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </div>

        <div class="form-item">
          <label>手机号</label>
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            size="large"
            :prefix-icon="Iphone"
            clearable
          />
        </div>

        <div class="form-item">
          <label>密码</label>
          <el-input
            v-model="registerForm.password"
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
        </div>

        <div class="form-item">
          <label>确认密码</label>
          <el-input
            v-model="registerForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请再次输入密码"
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

        <div class="form-item">
          <label>验证码</label>
          <div class="captcha-row">
            <el-input
              v-model="captchaInput"
              placeholder="请输入验证码"
              size="large"
              :prefix-icon="Key"
              clearable
              @keyup.enter="handleRegister"
            />
            <div class="captcha-box" @click="generateCaptcha">
              {{ captchaText }}
            </div>
          </div>
        </div>

        <div class="form-item">
          <el-checkbox v-model="agreeTerms">
            我已阅读并同意<el-link type="primary" :underline="false">《用户协议》</el-link>和<el-link type="primary" :underline="false">《隐私政策》</el-link>
          </el-checkbox>
        </div>

        <el-button
          type="primary"
          size="large"
          class="register-btn"
          :loading="loading"
          @click="handleRegister"
        >
          注 册
        </el-button>

        <div class="form-footer">
          已有账号？<el-link type="primary" :underline="false" @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;

  .register-box {
    width: 100%;
    max-width: 420px;
    background: #fff;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .register-header {
      text-align: center;
      margin-bottom: 32px;

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

    .register-form {
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

      .captcha-row {
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
      }

      .toggle-password {
        cursor: pointer;
        color: #999;

        &:hover {
          color: #409eff;
        }
      }

      .register-btn {
        width: 100%;
        height: 44px;
        font-size: 16px;
        margin-top: 8px;
      }

      .form-footer {
        text-align: center;
        margin-top: 16px;
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>
