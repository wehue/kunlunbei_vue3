<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { User, Lock, Key, View, Hide, CircleClose, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useTabsStore } from '@/stores/modules/tabs'
import { useKeepAliveStore } from '@/stores/modules/keepAlive'

const router = useRouter()
const userStore = useUserStore()
const tabsStore = useTabsStore()
const keepAliveStore = useKeepAliveStore()

const loginFormRef = ref()
const loading = ref(false)
const showPassword = ref(false)
const captchaText = ref('')
const captchaInput = ref('')

const loginForm = reactive({
  account: '',
  password: '',
  role: 'designer',
  remember: false,
})

const loginRules = reactive({
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '主管', value: 'supervisor' },
  { label: '设计师', value: 'designer' },
]

const presetAccounts = {
  admin: { password: 'admin@2026', name: '系统管理员', isFirstLogin: false },
}

const mockUsers = {
  supervisor1: { password: 'User@2025', name: '张主管', isFirstLogin: true },
  designer1: { password: 'User@2025', name: '李设计师', isFirstLogin: true },
  designer2: { password: 'User@2025', name: '王设计师', isFirstLogin: true },
}

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = result
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
    if (captchaInput.value.toLowerCase() !== captchaText.value.toLowerCase()) {
      ElMessage.error('验证码错误')
      generateCaptcha()
      captchaInput.value = ''
      return
    }

    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const presetUser = presetAccounts[loginForm.account]
      const mockUser = mockUsers[loginForm.account]

      let user = null
      let isFirstLogin = false

      if (presetUser && presetUser.password === loginForm.password) {
        user = { account: loginForm.account, name: presetUser.name }
        isFirstLogin = presetUser.isFirstLogin
      } else if (mockUser && mockUser.password === loginForm.password) {
        user = { account: loginForm.account, name: mockUser.name }
        isFirstLogin = mockUser.isFirstLogin
      }

      if (!user) {
        ElMessage.error('账号或密码错误')
        generateCaptcha()
        captchaInput.value = ''
        return
      }

      if (loginForm.remember) {
        localStorage.setItem('rememberedAccount', loginForm.account)
        localStorage.setItem('rememberedRole', loginForm.role)
      } else {
        localStorage.removeItem('rememberedAccount')
        localStorage.removeItem('rememberedRole')
      }

      if (isFirstLogin) {
        const { value: newPassword } = await ElMessageBox.prompt(
          '这是您首次登录，请设置新密码。密码要求：8-20位，包含大小写字母、数字和特殊字符',
          '修改密码',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            inputType: 'password',
            inputPlaceholder: '请输入新密码',
            inputValidator: (value) => {
              if (!value) return '请输入新密码'
              const result = validatePassword(value)
              if (!result.valid) return '密码强度不足'
              return true
            },
          },
        ).catch(() => {
          loading.value = false
          return { value: null }
        })

        if (!newPassword) {
          loading.value = false
          return
        }

        mockUsers[loginForm.account].password = newPassword
        mockUsers[loginForm.account].isFirstLogin = false
        ElMessage.success('密码修改成功，请重新登录')
        loading.value = false
        return
      }

      const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      userStore.setToken(token)
      userStore.setUserInfo({
        id: loginForm.account,
        name: user.name,
        role: loginForm.role,
      })

      tabsStore.setTabs([])
      keepAliveStore.setKeepAliveName([])

      const roleHomeMap = {
        admin: '/admin-index',
        supervisor: '/supervisor-index',
        designer: '/designer-index',
      }

      router.push(roleHomeMap[loginForm.role] || '/admin-index')
      ElNotification({
        title: '欢迎登录',
        message: `欢迎回来，${user.name}`,
        type: 'success',
        duration: 3000,
      })
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
  const rememberedAccount = localStorage.getItem('rememberedAccount')
  const rememberedRole = localStorage.getItem('rememberedRole')
  if (rememberedAccount) {
    loginForm.account = rememberedAccount
    loginForm.remember = true
  }
  if (rememberedRole) {
    loginForm.role = rememberedRole
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
                    <el-form-item>
            <el-select v-model="loginForm.role" placeholder="请选择角色" style="width: 100%">
              <el-option
                v-for="item in roleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="account">
            <el-input v-model="loginForm.account" placeholder="请输入账号">
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
              <div class="captcha-box" @click="generateCaptcha">
                {{ captchaText }}
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住账号</el-checkbox>
              <el-link type="primary" :underline="false" @click="goToPasswordFind">忘记密码？</el-link>
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
          还没有账号？<el-link type="primary" :underline="false" @click="goToRegister">立即注册</el-link>
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
