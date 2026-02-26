<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, Key, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const userStore = useUserStore()

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

const handleLogin = async () => {
  if (!loginForm.account) {
    ElMessage.warning('请输入账号')
    return
  }
  if (!loginForm.password) {
    ElMessage.warning('请输入密码')
    return
  }
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
        }
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

    ElMessage.success('登录成功')

    const roleHomeMap = {
      admin: '/admin-index',
      supervisor: '/supervisor-index',
      designer: '/designer-index',
    }

    router.push(roleHomeMap[loginForm.role] || '/admin-index')
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
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
})
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/images/logo.png" alt="Logo" class="logo" />
        <h1>昆仑贝</h1>
        <p>制造工艺管理系统</p>
      </div>

      <el-form :model="loginForm" class="login-form" @submit.prevent="handleLogin">
        <div class="form-item">
          <label>账号</label>
          <el-input
            v-model="loginForm.account"
            placeholder="请输入账号"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </div>

        <div class="form-item">
          <label>密码</label>
          <el-input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            clearable
            @keyup.enter="handleLogin"
          >
            <template #suffix>
              <el-icon class="toggle-password" @click="showPassword = !showPassword">
                <component :is="showPassword ? View : Hide" />
              </el-icon>
            </template>
          </el-input>
        </div>

        <div class="form-item">
          <label>角色</label>
          <el-select v-model="loginForm.role" size="large" style="width: 100%">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
              @keyup.enter="handleLogin"
            />
            <div class="captcha-box" @click="generateCaptcha">
              {{ captchaText }}
            </div>
          </div>
        </div>

        <div class="form-options">
          <el-checkbox v-model="loginForm.remember">记住账号</el-checkbox>
          <el-link type="primary" :underline="false" @click="goToPasswordFind">忘记密码？</el-link>
        </div>

        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登 录
        </el-button>

        <div class="form-footer">
          还没有账号？<el-link type="primary" :underline="false" @click="goToRegister">立即注册</el-link>
        </div>
      </el-form>

      <div class="demo-accounts">
        <div class="demo-title">测试账号</div>
        <div class="demo-list">
          <div class="demo-item">
            <span class="label">管理员：</span>
            <span class="value">admin / admin@2026</span>
          </div>
          <div class="demo-item">
            <span class="label">主管：</span>
            <span class="value">supervisor1 / User@2025</span>
          </div>
          <div class="demo-item">
            <span class="label">设计师：</span>
            <span class="value">designer1 / User@2025</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;

  .login-box {
    width: 100%;
    max-width: 420px;
    background: #fff;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .login-header {
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

    .login-form {
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

      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .login-btn {
        width: 100%;
        height: 44px;
        font-size: 16px;
      }

      .form-footer {
        text-align: center;
        margin-top: 16px;
        font-size: 14px;
        color: #666;
      }
    }

    .demo-accounts {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #eee;

      .demo-title {
        font-size: 13px;
        color: #999;
        margin-bottom: 12px;
      }

      .demo-list {
        .demo-item {
          font-size: 12px;
          color: #666;
          margin-bottom: 6px;

          .label {
            color: #999;
          }

          .value {
            font-family: 'Courier New', monospace;
          }
        }
      }
    }
  }
}
</style>
