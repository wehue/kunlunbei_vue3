<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Phone, Message, Lock, Edit, Upload, Check } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const currentRole = computed(() => userStore.userInfo.role)

const loading = ref(false)
const avatarUploading = ref(false)

const userInfo = ref({
  userId: 'U001',
  userName: '张三',
  role: 'admin',
  roleName: '管理员',
  registerTime: '2023-06-15 10:30:00',
  lastLoginTime: '2024-01-15 08:30:25',
  phone: '138****5678',
  email: 'zhang***@example.com',
  avatar: '',
})

const avatarUrl = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const editPhoneDialogVisible = ref(false)
const editEmailDialogVisible = ref(false)
const editPasswordDialogVisible = ref(false)

const phoneForm = reactive({
  newPhone: '',
  verifyCode: '',
})

const emailForm = reactive({
  newEmail: '',
  verifyCode: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const phoneFormRef = ref()
const emailFormRef = ref()
const passwordFormRef = ref()

const countdown = ref(0)
const emailCountdown = ref(0)

const phoneRules = {
  newPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' },
  ],
}

const emailRules = {
  newEmail: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' },
  ],
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度为8-20位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const hasLetter = /[a-zA-Z]/.test(value)
        const hasNumber = /\d/.test(value)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
        if (!hasLetter || !hasNumber) {
          callback(new Error('密码必须包含字母和数字'))
        } else if (!hasSpecial) {
          callback(new Error('密码必须包含至少一个特殊字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const handleAvatarChange = (file) => {
  const isJpgOrPng = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  if (!isJpgOrPng) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片')
    return false
  }
  const isLt5M = file.raw.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    avatarUrl.value = e.target.result
  }
  reader.readAsDataURL(file.raw)

  avatarUploading.value = true
  setTimeout(() => {
    avatarUploading.value = false
    ElMessage.success('头像上传成功')
  }, 1000)

  return false
}

const handleOpenPhoneDialog = () => {
  phoneForm.newPhone = ''
  phoneForm.verifyCode = ''
  editPhoneDialogVisible.value = true
}

const handleOpenEmailDialog = () => {
  emailForm.newEmail = ''
  emailForm.verifyCode = ''
  editEmailDialogVisible.value = true
}

const handleOpenPasswordDialog = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  editPasswordDialogVisible.value = true
}

const sendPhoneCode = () => {
  if (!phoneForm.newPhone || !/^1[3-9]\d{9}$/.test(phoneForm.newPhone)) {
    ElMessage.warning('请先输入正确的手机号')
    return
  }
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  ElMessage.success('验证码已发送')
}

const sendEmailCode = () => {
  if (!emailForm.newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
    ElMessage.warning('请先输入正确的邮箱')
    return
  }
  emailCountdown.value = 60
  const timer = setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  ElMessage.success('验证码已发送')
}

const handlePhoneSubmit = async () => {
  if (!phoneFormRef.value) return
  await phoneFormRef.value.validate((valid) => {
    if (valid) {
      userInfo.value.phone = phoneForm.newPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      editPhoneDialogVisible.value = false
      ElMessage.success('手机号修改成功')
    }
  })
}

const handleEmailSubmit = async () => {
  if (!emailFormRef.value) return
  await emailFormRef.value.validate((valid) => {
    if (valid) {
      const emailParts = emailForm.newEmail.split('@')
      userInfo.value.email = emailParts[0].substring(0, 3) + '***@' + emailParts[1]
      editEmailDialogVisible.value = false
      ElMessage.success('邮箱修改成功')
    }
  })
}

const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      editPasswordDialogVisible.value = false
      ElMessage.success('密码修改成功')
    }
  })
}

const getRoleName = (role) => {
  const roleMap = {
    admin: '管理员',
    supervisor: '主管',
    designer: '设计师',
  }
  return roleMap[role] || role
}

onMounted(() => {
  if (userStore.userInfo) {
    userInfo.value.userName = userStore.userInfo.userName || userInfo.value.userName
    userInfo.value.role = userStore.userInfo.role || userInfo.value.role
    userInfo.value.roleName = getRoleName(userInfo.value.role)
  }
})
</script>

<template>
  <div class="personal-center-container">
    <div class="page-header">
      <h2 class="page-title">个人中心</h2>
      <span class="page-subtitle">管理您的个人信息和账户安全</span>
    </div>

    <div class="content-wrapper">
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">基本信息</span>
        </div>
        <div class="section-content">
          <div class="avatar-area">
            <div class="avatar-wrapper">
              <el-avatar :size="100" :src="avatarUrl" />
              <el-upload
                class="avatar-upload"
                :show-file-list="false"
                :before-upload="handleAvatarChange"
                accept=".jpg,.jpeg,.png"
              >
                <div class="upload-overlay">
                  <el-icon v-if="!avatarUploading"><Upload /></el-icon>
                  <el-icon v-else class="is-loading"><Upload /></el-icon>
                </div>
              </el-upload>
            </div>
            <div class="avatar-info">
              <div class="avatar-tips">
                <p>支持 JPG/PNG 格式，文件大小不超过 5MB</p>
              </div>
              <el-upload
                :show-file-list="false"
                :before-upload="handleAvatarChange"
                accept=".jpg,.jpeg,.png"
              >
                <el-button type="primary" :loading="avatarUploading">
                  {{ avatarUploading ? '上传中...' : '更换头像' }}
                </el-button>
              </el-upload>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">
                <el-icon><User /></el-icon>
                <span>用户ID</span>
              </div>
              <div class="info-value">{{ userInfo.userId }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><User /></el-icon>
                <span>用户名</span>
              </div>
              <div class="info-value">{{ userInfo.userName }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><User /></el-icon>
                <span>角色</span>
              </div>
              <div class="info-value">
                <el-tag
                  :type="
                    userInfo.role === 'admin'
                      ? 'danger'
                      : userInfo.role === 'supervisor'
                        ? 'warning'
                        : 'primary'
                  "
                >
                  {{ userInfo.roleName }}
                </el-tag>
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><Check /></el-icon>
                <span>注册时间</span>
              </div>
              <div class="info-value">{{ userInfo.registerTime }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><Check /></el-icon>
                <span>最后登录时间</span>
              </div>
              <div class="info-value">{{ userInfo.lastLoginTime }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">联系方式</span>
        </div>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">
                <el-icon><Phone /></el-icon>
                <span>手机号</span>
              </div>
              <div class="info-value">
                <span>{{ userInfo.phone || '未绑定' }}</span>
                <el-button type="primary" link :icon="Edit" @click="handleOpenPhoneDialog">
                  {{ userInfo.phone ? '修改' : '绑定' }}
                </el-button>
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><Message /></el-icon>
                <span>邮箱</span>
              </div>
              <div class="info-value">
                <span>{{ userInfo.email || '未绑定' }}</span>
                <el-button type="primary" link :icon="Edit" @click="handleOpenEmailDialog">
                  {{ userInfo.email ? '修改' : '绑定' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">安全设置</span>
        </div>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">
                <el-icon><Lock /></el-icon>
                <span>登录密码</span>
              </div>
              <div class="info-value">
                <span>已设置</span>
                <el-button type="primary" link :icon="Edit" @click="handleOpenPasswordDialog">
                  修改密码
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="editPhoneDialogVisible"
      title="修改手机号"
      width="450px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="phoneFormRef" :model="phoneForm" :rules="phoneRules" label-width="100px">
        <el-form-item label="新手机号" prop="newPhone">
          <el-input v-model="phoneForm.newPhone" placeholder="请输入新手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="验证码" prop="verifyCode">
          <div class="verify-code-input">
            <el-input v-model="phoneForm.verifyCode" placeholder="请输入验证码" maxlength="6" />
            <el-button type="primary" :disabled="countdown > 0" @click="sendPhoneCode">
              {{ countdown > 0 ? `${countdown}s后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editPhoneDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePhoneSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editEmailDialogVisible"
      title="修改邮箱"
      width="450px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="emailFormRef" :model="emailForm" :rules="emailRules" label-width="100px">
        <el-form-item label="新邮箱" prop="newEmail">
          <el-input v-model="emailForm.newEmail" placeholder="请输入新邮箱" />
        </el-form-item>
        <el-form-item label="验证码" prop="verifyCode">
          <div class="verify-code-input">
            <el-input v-model="emailForm.verifyCode" placeholder="请输入验证码" maxlength="6" />
            <el-button type="primary" :disabled="emailCountdown > 0" @click="sendEmailCode">
              {{ emailCountdown > 0 ? `${emailCountdown}s后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editEmailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEmailSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editPasswordDialogVisible"
      title="修改密码"
      width="450px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        <div class="password-tips">
          <p>密码复杂度要求：</p>
          <ul>
            <li>长度为8-20位</li>
            <li>必须包含字母和数字</li>
            <li>必须包含至少一个特殊字符（如：!@#$%^&*）</li>
          </ul>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="editPasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.personal-center-container {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .page-subtitle {
      font-size: 14px;
      color: #909399;
      margin-top: 8px;
      display: block;
    }
  }

  .content-wrapper {
    .section-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      overflow: hidden;

      &:last-child {
        margin-bottom: 0;
      }

      .section-header {
        padding: 16px 24px;
        border-bottom: 1px solid #ebeef5;

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          position: relative;
          padding-left: 12px;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 16px;
            background: #409eff;
            border-radius: 2px;
          }
        }
      }

      .section-content {
        padding: 24px;

        .avatar-area {
          display: flex;
          align-items: center;
          gap: 24px;
          padding-bottom: 24px;
          margin-bottom: 24px;
          border-bottom: 1px solid #f0f0f0;

          .avatar-wrapper {
            position: relative;
            flex-shrink: 0;

            .avatar-upload {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              overflow: hidden;

              :deep(.el-upload) {
                width: 100px;
                height: 100px;
                border-radius: 50%;
              }

              .upload-overlay {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                opacity: 0;
                transition: opacity 0.3s;
                cursor: pointer;

                &:hover {
                  opacity: 1;
                }

                .el-icon {
                  font-size: 24px;

                  &.is-loading {
                    animation: rotating 2s linear infinite;
                  }
                }
              }
            }
          }

          .avatar-info {
            display: flex;
            flex-direction: column;
            gap: 12px;

            .avatar-tips {
              p {
                margin: 0;
                font-size: 13px;
                color: #909399;
              }
            }
          }
        }

        .info-grid {
          .info-row {
            display: flex;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            .info-label {
              width: 160px;
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 14px;
              color: #606266;

              .el-icon {
                color: #909399;
              }
            }

            .info-value {
              flex: 1;
              display: flex;
              align-items: center;
              gap: 12px;
              font-size: 14px;
              color: #303133;
            }
          }
        }
      }
    }
  }
}

.verify-code-input {
  display: flex;
  gap: 12px;

  .el-input {
    flex: 1;
  }

  .el-button {
    width: 120px;
  }
}

.password-tips {
  background: #f4f4f5;
  border-radius: 4px;
  padding: 12px 16px;
  margin-left: 100px;

  p {
    margin: 0 0 8px;
    font-size: 13px;
    color: #606266;
    font-weight: 500;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      font-size: 12px;
      color: #909399;
      line-height: 1.8;
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 768px) {
  .personal-center-container {
    .content-wrapper {
      .section-card {
        .section-content {
          .avatar-area {
            flex-direction: column;
            align-items: flex-start;
          }

          .info-grid {
            .info-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;

              .info-label {
                width: auto;
              }

              .info-value {
                width: 100%;
              }
            }
          }
        }
      }
    }
  }

  .password-tips {
    margin-left: 0;
  }
}
</style>
