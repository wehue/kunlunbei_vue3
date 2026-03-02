<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowLeft } from '@element-plus/icons-vue'
import { getUserDetailById, updateUserInfo } from '@/api/user'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const loading = ref(false)
const userData = ref({})
const formData = reactive({})
const formRef = ref()

const roleOptions = ref([
  { label: '管理员', value: 'Admin' },
  { label: '主管', value: 'Supervisor' },
  { label: '设计师', value: 'Designer' },
])

const statusOptions = ref([
  { label: '启用', value: 'Active' },
  { label: '禁用', value: 'Inactive' },
  { label: '已删除', value: 'Deleted' },
])

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const loadUserData = async () => {
  loading.value = true
  try {
    const userId = route.params.id
    const res = await getUserDetailById(userId)
    console.log('用户详情', res)

    let data = null
    if (res.data.data) {
      if (res.data.data.data) {
        data = res.data.data.data
      } else if (res.data.data.code === 200 && res.data.data.data !== null) {
        data = res.data.data.data
      } else {
        data = res.data.data
      }
    }

    if (data) {
      const mappedData = {
        ...data,
        email: data.email || data.address,
      }
      userData.value = { ...mappedData }
      Object.assign(formData, mappedData)
    }
  } catch (error) {
    console.error('加载用户详情失败:', error)
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  isEdit.value = true
  Object.assign(formData, userData.value)
}

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消编辑吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      isEdit.value = false
      Object.assign(formData, userData.value)
    })
    .catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const updateData = {
          id: formData.id,
          userName: formData.userName,
          phone: formData.phone,
          address: formData.email,
          role: formData.role,
          userStatus: formData.userStatus,
        }
        await updateUserInfo(updateData)
        Object.assign(userData.value, formData)
        ElMessage.success('保存成功')
        isEdit.value = false
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error(error.response?.data?.message || '保存失败')
      }
    }
  })
}

const handleBack = () => {
  router.push('/user-manage/user-manage-info')
}

const rules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  userStatus: [{ required: true, message: '请选择用户状态', trigger: 'change' }],
}

onMounted(() => {
  loadUserData()
})
</script>

<template>
  <div class="user-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ userData.userName }}</h2>
          <span class="page-subtitle">用户详情</span>
        </div>
      </div>
      <div class="header-right">
        <template v-if="!isEdit">
          <el-button type="primary" :icon="Edit" @click="handleEdit">编辑</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </template>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">基本信息</span>
        </div>

        <template v-if="!isEdit">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">用户ID</div>
              <div class="info-value">
                <el-tag size="default">{{ userData.userId }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">用户名</div>
              <div class="info-value">{{ userData.userName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">手机号</div>
              <div class="info-value">{{ userData.phone }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">邮箱</div>
              <div class="info-value">{{ userData.email }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">角色</div>
              <div class="info-value">
                <el-tag
                  :type="
                    userData.role === 'Admin'
                      ? 'danger'
                      : userData.role === 'Supervisor'
                        ? 'warning'
                        : 'primary'
                  "
                  size="default"
                >
                  {{
                    userData.role === 'Admin'
                      ? '管理员'
                      : userData.role === 'Supervisor'
                        ? '主管'
                        : '设计师'
                  }}
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">用户状态</div>
              <div class="info-value">
                <el-tag
                  :type="
                    userData.userStatus === 'Active'
                      ? 'success'
                      : userData.userStatus === 'Inactive'
                        ? 'warning'
                        : 'danger'
                  "
                  size="default"
                >
                  {{
                    userData.userStatus === 'Active'
                      ? '启用'
                      : userData.userStatus === 'Inactive'
                        ? '禁用'
                        : '已删除'
                  }}
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">注册时间</div>
              <div class="info-value">{{ formatDateTime(userData.createTime) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">修改时间</div>
              <div class="info-value">{{ formatDateTime(userData.lastUpdateTime) }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="用户ID">
                <el-input v-model="formData.userId" disabled placeholder="系统自动生成" />
              </el-form-item>
              <el-form-item label="用户名" prop="userName">
                <el-input v-model="formData.userName" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="formData.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="formData.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="角色" prop="role">
                <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
                  <el-option
                    v-for="item in roleOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="用户状态" prop="userStatus">
                <el-select
                  v-model="formData.userStatus"
                  placeholder="请选择用户状态"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in statusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-detail-container {
  padding: 2px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 18px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;

      .title-area {
        .page-title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1.3;
        }

        .page-subtitle {
          font-size: 16px;
          color: #909399;
        }
      }
    }

    .header-right {
      display: flex;
      gap: 12px;

      .el-button {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  }

  .detail-content {
    .section-card {
      background: #fff;
      border-radius: 4px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #ebeef5;

        .section-title {
          font-size: 22px;
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

      .info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        background: #ebeef5;
        padding: 1px;

        .info-item {
          display: flex;
          align-items: stretch;
          background: #fff;
          min-height: 60px;

          .info-label {
            width: 120px;
            padding: 18px 20px;
            background: #fafafa;
            font-size: 18px;
            color: #606266;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            font-weight: 500;
          }

          .info-value {
            flex: 1;
            padding: 18px 20px;
            font-size: 16px;
            color: #303133;
            display: flex;
            align-items: center;
          }
        }
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px 32px;
        padding: 24px;

        :deep(.el-form-item) {
          margin-bottom: 0;

          .el-form-item__label {
            font-size: 18px;
            color: #606266;
            font-weight: 500;
            padding-bottom: 8px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .user-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .form-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .user-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: 1fr;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>
