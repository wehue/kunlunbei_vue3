<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import {
  User,
  Lock,
  Key,
  View,
  Hide,
  Iphone,
  CircleClose,
  UserFilled,
} from '@element-plus/icons-vue'
import { getRegisterVerifyCode, registerUser } from '@/api/register'

const router = useRouter()

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeTerms = ref(false)
const countDown = ref(0)
const isCounting = ref(false)

const registerForm = reactive({
  userName: '',
  password: '',
  phone: '',
  role: '',
  email: '',
  verifyCode: '',
})

const validateForm = () => {
  if (!registerForm.userName) {
    ElMessage.warning('请输入用户名')
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
  if (!registerForm.email) {
    ElMessage.warning('请输入邮箱')
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    ElMessage.warning('请输入正确的邮箱地址')
    return false
  }
  if (!registerForm.role) {
    ElMessage.warning('请选择角色')
    return false
  }
  if (!registerForm.verifyCode) {
    ElMessage.warning('请输入邮箱验证码')
    return false
  }
  if (!agreeTerms.value) {
    ElMessage.warning('请阅读并同意用户协议')
    return false
  }
  return true
}

const getEmailVerifyCode = async () => {
  if (!registerForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }

  try {
    isCounting.value = true
    countDown.value = 60

    const timer = setInterval(() => {
      countDown.value--
      if (countDown.value <= 0) {
        clearInterval(timer)
        isCounting.value = false
      }
    }, 1000)

    const result = await getRegisterVerifyCode(registerForm.email)
    console.log('获取注册验证码响应:', result)
    if (result.code === 200) {
      ElMessage.success('验证码已发送，请查收邮箱')
    } else {
      ElMessage.error(result.message || '获取验证码失败')
      isCounting.value = false
      countDown.value = 0
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('网络错误，请稍后重试')
    isCounting.value = false
    countDown.value = 0
  }
}

const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    const result = await registerUser(registerForm)
    if (result.code === 200) {
      ElNotification({
        title: '注册成功',
        message: '请使用新账号登录',
        type: 'success',
        duration: 3000,
      })
      router.push('/login')
    } else {
      ElMessage.error(result.message || '注册失败，请稍后重试')
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const resetForm = () => {
  registerForm.userName = ''
  registerForm.password = ''
  registerForm.phone = ''
  registerForm.role = ''
  registerForm.email = ''
  registerForm.verifyCode = ''
  agreeTerms.value = false
}

onMounted(() => {})
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
            <el-input v-model="registerForm.userName" placeholder="请输入用户名">
              <template #prefix>
                <el-icon class="el-input__icon">
                  <User />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
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
          </el-form-item>
          <el-form-item>
            <el-select v-model="registerForm.role" placeholder="请选择角色">
              <el-option label="主管" value="Supervisor"></el-option>
              <el-option label="设计师" value="Designer"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-input v-model="registerForm.email" placeholder="请输入邮箱">
              <template #prefix>
                <el-icon class="el-input__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0v12H4V6h16zm-2 4-8 5-8-5V8l8 5 8-5v2z"
                    />
                  </svg>
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="captcha-row">
              <el-input v-model="registerForm.verifyCode" placeholder="请输入邮箱验证码">
                <template #prefix>
                  <el-icon class="el-input__icon">
                    <Key />
                  </el-icon>
                </template>
              </el-input>
              <el-button
                type="primary"
                :disabled="
                  isCounting ||
                  !registerForm.email ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)
                "
                @click="getEmailVerifyCode"
              >
                {{ isCounting ? `${countDown}秒后重新获取` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="agreeTerms">
              我已阅读并同意<el-link type="primary" :underline="false">《用户协议》</el-link
              >和<el-link type="primary" :underline="false">《隐私政策》</el-link>
            </el-checkbox>
          </el-form-item>
        </el-form>
        <div class="register-btn">
          <el-button :icon="CircleClose" round size="large" @click="resetForm"> 重置 </el-button>
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
