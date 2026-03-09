<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Phone, Message, Lock, Upload, Check, Edit } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { getUserDetailById, updatePassword, uploadAvatar } from '@/api/user'
import timeFormat from '@/utils/format_time'
import router from '@/router'
import defaultAvatar from '@/assets/images/avatar.gif'

const userStore = useUserStore()
const currentRole = computed(() => userStore.userInfo?.role)

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

const avatarUrl = ref(defaultAvatar)

const editPasswordDialogVisible = ref(false)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordFormRef = ref()

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

const handleAvatarChange = async (uploadFile) => {
  const file = uploadFile.raw || uploadFile

  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    avatarUrl.value = e.target.result
  }
  reader.readAsDataURL(file)

  avatarUploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userStore.userInfo?.id || userInfo.value.userId || '300')

    const res = await uploadAvatar(formData)
    console.log('头像上传完整响应:', res)
    console.log('响应数据:', res.data)

    if (res.data && res.data.code === 200) {
      const newAvatarUrl = res.data.data?.avatarUrl || res.data.avatarUrl
      if (newAvatarUrl) {
        console.log('新头像URL:', newAvatarUrl)
        avatarUrl.value = newAvatarUrl
        if (userStore.userInfo) {
          console.log('更新用户存储前:', userStore.userInfo)
          userStore.setUserInfo({
            ...userStore.userInfo,
            avatar: newAvatarUrl,
          })
          console.log('更新用户存储后:', userStore.userInfo)
        }
        ElMessage.success('头像上传成功')
      } else {
        console.log('响应中没有avatarUrl字段')
        ElMessage.error('头像上传失败：未返回头像地址')
      }
    } else {
      console.log('响应code不是200:', res.data)
      ElMessage.error(res.data?.message || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败')
  } finally {
    avatarUploading.value = false
  }

  return false
}

const handleOpenPasswordDialog = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  editPasswordDialogVisible.value = true
}

const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        })
        if (res.data.code === 200) {
          editPasswordDialogVisible.value = false
          ElMessage.success('密码修改成功，将重新登录')
          // 强制退出登录
          setTimeout(() => {
            userStore.logout()
            router.push('/login')
          }, 1500)
        } else {
          ElMessage.error(res.data.message || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error('密码修改失败')
      } finally {
        loading.value = false
      }
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

const fetchUserDetail = async () => {
  const currentUser = userStore.userInfo
  if (currentUser && currentUser.id) {
    loading.value = true
    try {
      const res = await getUserDetailById(currentUser.id)
      console.log('获取用户详情成功:', res)
      if (res.data.code === 200 && res.data.data.data) {
        const userData = res.data.data.data
        userInfo.value = {
          userId: userData.userId || currentUser.id,
          userName: userData.userName || currentUser.name,
          role: userData.role || currentUser.role,
          roleName: getRoleName(userData.role || currentUser.role),
          registerTime: userData.createTime
            ? timeFormat.formatDate(userData.createTime, 'YYYY-MM-DD HH:mm:ss')
            : userInfo.value.registerTime,
          lastLoginTime: userData.endTime
            ? timeFormat.formatDate(userData.endTime, 'YYYY-MM-DD HH:mm:ss')
            : userInfo.value.lastLoginTime,
          phone: userData.phone
            ? userData.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
            : userInfo.value.phone,
          email: userData.email
            ? userData.email.replace(/(^.{3})[^@]*(@.*$)/, '$1***$2')
            : userInfo.value.email,
          avatar: userData.avatar || userInfo.value.avatar,
        }
        if (userData.avatar) {
          avatarUrl.value = userData.avatar
          // 更新用户存储中的头像
          if (userStore.userInfo) {
            userStore.setUserInfo({
              ...userStore.userInfo,
              avatar: userData.avatar,
            })
          }
        }
      }
    } catch (error) {
      console.error('获取用户详情失败:', error)
      ElMessage.error('获取用户详情失败')
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => {
  if (userStore.userInfo) {
    userInfo.value.userName =
      userStore.userInfo?.userName || userStore.userInfo?.name || userInfo.value.userName
    userInfo.value.role = userStore.userInfo?.role || userInfo.value.role
    userInfo.value.roleName = getRoleName(userInfo.value.role)
    // 从用户存储中获取头像
    if (userStore.userInfo.avatar) {
      avatarUrl.value = userStore.userInfo.avatar
    }
    // 获取用户详细信息
    fetchUserDetail()
  }
})
</script>

<template>
  <div class="personal-center-container">
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
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><Message /></el-icon>
                <span>邮箱</span>
              </div>
              <div class="info-value">
                <span>{{ userInfo.email || '未绑定' }}</span>
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
  padding: 3px;

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
}
</style>
