<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const loading = ref(false)
const userData = ref({})
const formData = reactive({})
const formRef = ref()

const roleOptions = ref([
  { label: '管理员', value: 'admin' },
  { label: '主管', value: 'supervisor' },
  { label: '设计师', value: 'designer' },
])

const mockUserData = {
  1: {
    id: 1,
    userId: 'U001',
    userName: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    role: 'admin',
    status: '启用',
    registerTime: '2023-01-15 10:30:00',
    lastLoginTime: '2024-01-15 08:30:25',
  },
  2: {
    id: 2,
    userId: 'U002',
    userName: '李四',
    phone: '13800138002',
    email: 'lisi@example.com',
    role: 'supervisor',
    status: '启用',
    registerTime: '2023-02-20 14:20:00',
    lastLoginTime: '2024-01-15 08:32:10',
  },
  3: {
    id: 3,
    userId: 'U003',
    userName: '王五',
    phone: '13800138003',
    email: 'wangwu@example.com',
    role: 'designer',
    status: '启用',
    registerTime: '2023-03-10 09:15:00',
    lastLoginTime: '2024-01-15 08:35:42',
  },
  4: {
    id: 4,
    userId: 'U004',
    userName: '赵六',
    phone: '13800138004',
    email: 'zhaoliu@example.com',
    role: 'designer',
    status: '禁用',
    registerTime: '2023-04-05 16:45:00',
    lastLoginTime: '2024-01-10 10:20:15',
  },
  5: {
    id: 5,
    userId: 'U005',
    userName: '钱七',
    phone: '13800138005',
    email: 'qianqi@example.com',
    role: 'supervisor',
    status: '启用',
    registerTime: '2023-05-12 11:30:00',
    lastLoginTime: '2024-01-15 09:25:50',
  },
  6: {
    id: 6,
    userId: 'U006',
    userName: '孙八',
    phone: '13800138006',
    email: 'sunba@example.com',
    role: 'designer',
    status: '启用',
    registerTime: '2023-06-18 13:55:00',
    lastLoginTime: '2024-01-15 10:10:45',
  },
  7: {
    id: 7,
    userId: 'U007',
    userName: '周九',
    phone: '13800138007',
    email: 'zhoujiu@example.com',
    role: 'admin',
    status: '启用',
    registerTime: '2023-07-22 15:10:00',
    lastLoginTime: '2024-01-15 10:20:18',
  },
  8: {
    id: 8,
    userId: 'U008',
    userName: '吴十',
    phone: '13800138008',
    email: 'wushi@example.com',
    role: 'designer',
    status: '禁用',
    registerTime: '2023-08-08 08:40:00',
    lastLoginTime: '2024-01-12 14:05:30',
  },
  9: {
    id: 9,
    userId: 'U009',
    userName: '郑十一',
    phone: '13800138009',
    email: 'zheng11@example.com',
    role: 'supervisor',
    status: '启用',
    registerTime: '2023-09-15 10:25:00',
    lastLoginTime: '2024-01-15 11:10:55',
  },
  10: {
    id: 10,
    userId: 'U010',
    userName: '王十二',
    phone: '13800138010',
    email: 'wang12@example.com',
    role: 'designer',
    status: '已删除',
    registerTime: '2023-10-20 12:35:00',
    lastLoginTime: '2024-01-05 09:15:20',
  },
  11: {
    id: 11,
    userId: 'U011',
    userName: '刘明',
    phone: '13800138011',
    email: 'liuming@example.com',
    role: 'designer',
    status: '启用',
    registerTime: '2023-11-05 14:50:00',
    lastLoginTime: '2024-01-15 14:05:12',
  },
  12: {
    id: 12,
    userId: 'U012',
    userName: '陈华',
    phone: '13800138012',
    email: 'chenhua@example.com',
    role: 'supervisor',
    status: '启用',
    registerTime: '2023-12-01 09:20:00',
    lastLoginTime: '2024-01-15 14:15:45',
  },
}

const loadUserData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = mockUserData[id] || mockUserData[1]
    userData.value = { ...data }
    Object.assign(formData, data)
    loading.value = false
  }, 300)
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

  await formRef.value.validate((valid) => {
    if (valid) {
      Object.assign(userData.value, formData)
      mockUserData[userData.value.id] = { ...userData.value }
      ElMessage.success('保存成功')
      isEdit.value = false
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
  status: [{ required: true, message: '请选择用户状态', trigger: 'change' }],
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
                    userData.role === 'admin'
                      ? 'danger'
                      : userData.role === 'supervisor'
                        ? 'warning'
                        : 'primary'
                  "
                  size="default"
                >
                  {{
                    userData.role === 'admin'
                      ? '管理员'
                      : userData.role === 'supervisor'
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
                    userData.status === '启用'
                      ? 'success'
                      : userData.status === '禁用'
                        ? 'warning'
                        : 'danger'
                  "
                  size="default"
                >
                  {{ userData.status }}
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">注册时间</div>
              <div class="info-value">{{ userData.registerTime }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">最后登录时间</div>
              <div class="info-value">{{ userData.lastLoginTime }}</div>
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
              <el-form-item label="用户状态" prop="status">
                <el-select
                  v-model="formData.status"
                  placeholder="请选择用户状态"
                  style="width: 100%"
                >
                  <el-option label="启用" value="启用" />
                  <el-option label="禁用" value="禁用" />
                  <el-option label="已删除" value="已删除" />
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
