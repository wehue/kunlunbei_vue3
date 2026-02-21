<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete, Download, Lock, Refresh } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'

const router = useRouter()

const proTableRef = ref()
const dialogVisible = ref(false)
const resetPwdDialogVisible = ref(false)
const formRef = ref()
const isEdit = ref(false)
const resetPwdForm = reactive({
  userId: null,
  userName: '',
  newPassword: '',
  confirmPassword: '',
  isRandom: false,
})

const roleOptions = ref([
  { label: '管理员', value: 'admin' },
  { label: '主管', value: 'supervisor' },
  { label: '设计师', value: 'designer' },
])

const statusOptions = ref([
  { label: '启用', value: '启用' },
  { label: '禁用', value: '禁用' },
  { label: '已删除', value: '已删除' },
])

const mockData = ref([
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'userId', label: '用户ID', search: { el: 'input', key: 'userId' } },
  { prop: 'userName', label: '用户名', search: { el: 'input', key: 'userName' } },
  { prop: 'phone', label: '手机号', search: { el: 'input', key: 'phone' } },
  { prop: 'role', label: '角色', search: { el: 'select', key: 'role' }, enum: roleOptions },
  {
    prop: 'status',
    label: '用户状态',
    search: { el: 'select', key: 'status' },
    enum: statusOptions,
  },
  { prop: 'operation', label: '操作', width: 280, fixed: 'right' },
])

const formData = reactive({
  id: null,
  userId: '',
  userName: '',
  phone: '',
  email: '',
  role: '',
  status: '启用',
  password: '',
})

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
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
  ],
}

const generateUserId = () => {
  const maxId = mockData.value.reduce((max, item) => {
    const id = parseInt(item.userId.replace('U', ''))
    return id > max ? id : max
  }, 0)
  return `U${String(maxId + 1).padStart(3, '0')}`
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    userId: generateUserId(),
    userName: '',
    phone: '',
    email: '',
    role: '',
    status: '启用',
    password: '',
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/user-manage/user-manage-detail/${row.id}`)
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    phone: row.phone,
    email: row.email,
    role: row.role,
    status: row.status,
    password: '',
  })
  dialogVisible.value = true
}

const handleToggleStatus = async (row) => {
  const newStatus = row.status === '启用' ? '禁用' : '启用'
  const actionText = newStatus === '禁用' ? '冻结' : '解冻'

  try {
    await ElMessageBox.confirm(`确定要${actionText}用户"${row.userName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const index = mockData.value.findIndex((item) => item.id === row.id)
    if (index > -1) {
      mockData.value[index].status = newStatus
      ElMessage.success(`${actionText}成功`)
      proTableRef.value?.getTableList()
    }
  } catch {
    // 用户取消
  }
}

const handleResetPwd = (row) => {
  resetPwdForm.userId = row.id
  resetPwdForm.userName = row.userName
  resetPwdForm.newPassword = ''
  resetPwdForm.confirmPassword = ''
  resetPwdForm.isRandom = false
  resetPwdDialogVisible.value = true
}

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  resetPwdForm.newPassword = password
  resetPwdForm.confirmPassword = password
}

const handleResetPwdSubmit = async () => {
  if (!resetPwdForm.isRandom) {
    if (!resetPwdForm.newPassword) {
      ElMessage.warning('请输入新密码')
      return
    }
    if (resetPwdForm.newPassword.length < 6 || resetPwdForm.newPassword.length > 20) {
      ElMessage.warning('密码长度为6-20个字符')
      return
    }
    if (resetPwdForm.newPassword !== resetPwdForm.confirmPassword) {
      ElMessage.warning('两次输入的密码不一致')
      return
    }
  }

  try {
    await ElMessageBox.confirm(`确定要重置用户"${resetPwdForm.userName}"的密码吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    ElMessage.success(`密码重置成功，新密码：${resetPwdForm.newPassword}`)
    resetPwdDialogVisible.value = false
  } catch {
    // 用户取消
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${row.userName}"吗？删除后用户状态将变为"已删除"。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const index = mockData.value.findIndex((item) => item.id === row.id)
    if (index > -1) {
      mockData.value[index].status = '已删除'
      ElMessage.success('删除成功')
      proTableRef.value?.getTableList()
    }
  } catch {
    // 用户取消
  }
}

const handleBatchFreeze = async (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要冻结的用户')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要冻结选中的 ${selectedList.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    selectedList.forEach((item) => {
      const index = mockData.value.findIndex((data) => data.id === item.id)
      if (index > -1) {
        mockData.value[index].status = '禁用'
      }
    })
    ElMessage.success(`成功冻结 ${selectedList.length} 个用户`)
    proTableRef.value?.getTableList()
  } catch {
    // 用户取消
  }
}

const handleBatchUnfreeze = async (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要解冻的用户')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要解冻选中的 ${selectedList.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    selectedList.forEach((item) => {
      const index = mockData.value.findIndex((data) => data.id === item.id)
      if (index > -1) {
        mockData.value[index].status = '启用'
      }
    })
    ElMessage.success(`成功解冻 ${selectedList.length} 个用户`)
    proTableRef.value?.getTableList()
  } catch {
    // 用户取消
  }
}

const handleBatchDelete = async (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedList.length} 个用户吗？删除后用户状态将变为"已删除"。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    selectedList.forEach((item) => {
      const index = mockData.value.findIndex((data) => data.id === item.id)
      if (index > -1) {
        mockData.value[index].status = '已删除'
      }
    })
    ElMessage.success(`成功删除 ${selectedList.length} 个用户`)
    proTableRef.value?.getTableList()
  } catch {
    // 用户取消
  }
}

const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const handleExportCurrent = () => {
  const params = proTableRef.value?.searchParam || {}
  const filteredData = filterData(mockData.value, params)
  const exportData = filteredData.map((item) => ({
    用户ID: item.userId,
    用户名: item.userName,
    手机号: item.phone,
    邮箱: item.email,
    角色: item.role,
    用户状态: item.status,
    注册时间: item.registerTime,
    最后登录时间: item.lastLoginTime,
  }))
  exportToExcel(exportData, `用户数据_${new Date().toLocaleDateString()}`)
  ElMessage.success('导出成功')
}

const handleExportAll = () => {
  const exportData = mockData.value.map((item) => ({
    用户ID: item.userId,
    用户名: item.userName,
    手机号: item.phone,
    邮箱: item.email,
    角色: item.role,
    用户状态: item.status,
    注册时间: item.registerTime,
    最后登录时间: item.lastLoginTime,
  }))
  exportToExcel(exportData, `用户数据_全部_${new Date().toLocaleDateString()}`)
  ElMessage.success('导出成功')
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = mockData.value.findIndex((item) => item.id === formData.id)
        if (index > -1) {
          mockData.value[index] = {
            ...mockData.value[index],
            userName: formData.userName,
            phone: formData.phone,
            email: formData.email,
            role: formData.role,
            status: formData.status,
          }
        }
        ElMessage.success('修改成功')
      } else {
        const maxId = mockData.value.reduce((max, item) => {
          const id = parseInt(item.id)
          return id > max ? id : max
        }, 0)
        const now = new Date()
        const registerTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        mockData.value.push({
          id: maxId + 1,
          userId: formData.userId,
          userName: formData.userName,
          phone: formData.phone,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          registerTime: registerTime,
          lastLoginTime: '-',
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      proTableRef.value?.getTableList()
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const filterData = (data, params) => {
  let filteredData = [...data]

  if (params?.userId) {
    filteredData = filteredData.filter((item) => item.userId.includes(params.userId))
  }

  if (params?.userName) {
    filteredData = filteredData.filter((item) => item.userName.includes(params.userName))
  }

  if (params?.phone) {
    filteredData = filteredData.filter((item) => item.phone.includes(params.phone))
  }

  if (params?.role) {
    filteredData = filteredData.filter((item) => item.role === params.role)
  }

  if (params?.status) {
    filteredData = filteredData.filter((item) => item.status === params.status)
  }

  return filteredData
}

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredData = filterData(mockData.value, params)

      const pageNum = params?.pageNum || 1
      const pageSize = params?.pageSize || 10
      const startIndex = (pageNum - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)

      const dataWithIndex = paginatedData.map((item, index) => ({
        ...item,
        index: startIndex + index + 1,
      }))

      resolve({
        data: {
          list: dataWithIndex,
          total: filteredData.length,
        },
      })
    }, 300)
  })
}
</script>

<template>
  <div class="user-manage-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader="scope">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
        <el-button
          type="warning"
          :disabled="!scope.isSelected"
          @click="handleBatchFreeze(scope.selectedList)"
        >
          批量冻结
        </el-button>
        <el-button
          type="success"
          :disabled="!scope.isSelected"
          @click="handleBatchUnfreeze(scope.selectedList)"
        >
          批量解冻
        </el-button>
        <el-button
          type="danger"
          :disabled="!scope.isSelected"
          @click="handleBatchDelete(scope.selectedList)"
        >
          批量删除
        </el-button>
        <el-button type="success" :icon="Download" @click="handleExportCurrent"
          >导出当前结果</el-button
        >
        <el-button type="success" :icon="Download" @click="handleExportAll">导出全部</el-button>
      </template>

      <template #role="scope">
        <el-tag
          :type="
            scope.row.role === 'admin'
              ? 'danger'
              : scope.row.role === 'supervisor'
                ? 'warning'
                : 'primary'
          "
        >
          {{
            scope.row.role === 'admin'
              ? '管理员'
              : scope.row.role === 'supervisor'
                ? '主管'
                : '设计师'
          }}
        </el-tag>
      </template>

      <template #status="scope">
        <el-tag
          :type="
            scope.row.status === '启用'
              ? 'success'
              : scope.row.status === '禁用'
                ? 'warning'
                : 'danger'
          "
        >
          {{ scope.row.status }}
        </el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button type="warning" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button
          :type="scope.row.status === '启用' ? 'warning' : 'success'"
          link
          :icon="Lock"
          @click="handleToggleStatus(scope.row)"
        >
          {{ scope.row.status === '启用' ? '冻结' : '解冻' }}
        </el-button>
        <el-button type="primary" link :icon="Refresh" @click="handleResetPwd(scope.row)"
          >重置密码</el-button
        >
        <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)"
          >删除</el-button
        >
      </template>
    </ProTable>

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
      class="user-dialog"
    >
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
            <el-select v-model="formData.status" placeholder="请选择用户状态" style="width: 100%">
              <el-option label="启用" value="启用" />
              <el-option label="禁用" value="禁用" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="!isEdit" label="密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog
      v-model="resetPwdDialogVisible"
      title="重置密码"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
      class="reset-pwd-dialog"
    >
      <el-form label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="resetPwdForm.userName" disabled />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="resetPwdForm.isRandom" @change="generateRandomPassword">
            生成随机密码
          </el-checkbox>
        </el-form-item>
        <el-form-item v-if="!resetPwdForm.isRandom" label="新密码">
          <el-input
            v-model="resetPwdForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item v-if="!resetPwdForm.isRandom" label="确认密码">
          <el-input
            v-model="resetPwdForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item v-if="resetPwdForm.isRandom" label="生成的随机密码">
          <el-input v-model="resetPwdForm.newPassword" disabled />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetPwdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleResetPwdSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-manage-container {
  :deep(.table-search) {
    margin-bottom: 10px !important;
  }

  :deep(.el-table) {
    .el-table__body-wrapper {
      .el-table__body {
        .el-table__row {
          .el-table__cell:last-child {
            .cell {
              display: flex;
              flex-wrap: wrap;
              gap: 4px 8px;
              justify-content: flex-start;
              align-items: center;

              .el-button {
                min-width: auto;
                padding: 4px 8px !important;
                margin: 0 !important;

                .el-icon {
                  margin-right: 2px;
                  font-size: 14px;
                }

                span {
                  font-size: 14px;
                  white-space: nowrap;
                }
              }
            }
          }
        }
      }
    }
  }
}

.user-dialog {
  :deep(.el-dialog__header) {
    padding: 14px 21px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 20px;
    border-top: 1px solid #ebeef5;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px 20px;

    :deep(.el-form-item) {
      margin-bottom: 0;

      .el-form-item__label {
        font-size: 16px;
        color: #303133;
        font-weight: 400;
        padding-bottom: 6px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      font-size: 16px;
      padding: 10px 20px;
    }
  }
}

.reset-pwd-dialog {
  :deep(.el-dialog__header) {
    padding: 14px 21px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 20px;
    border-top: 1px solid #ebeef5;
  }
}

@media screen and (max-width: 768px) {
  .user-dialog {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
