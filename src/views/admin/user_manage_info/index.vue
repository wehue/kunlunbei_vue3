<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete, Download, Lock, Refresh } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { getUserList, createUser, updateUserInfo, deleteUser } from '@/api/user'

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
  { label: '管理员', value: 'Admin' },
  { label: '主管', value: 'Supervisor' },
  { label: '设计师', value: 'Designer' },
])

const statusOptions = ref([
  { label: '启用', value: 'Active' },
  { label: '禁用', value: 'Inactive' },
  { label: '已删除', value: 'Deleted' },
])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'userId', label: '用户ID', search: { el: 'input', key: 'userId' } },
  { prop: 'userName', label: '用户名', search: { el: 'input', key: 'userName' } },
  { prop: 'phone', label: '手机号', search: { el: 'input', key: 'phone' } },
  { prop: 'role', label: '角色', search: { el: 'select', key: 'role' }, enum: roleOptions },
  {
    prop: 'userStatus',
    label: '用户状态',
    search: { el: 'select', key: 'userStatus' },
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
  userStatus: 'Active',
  password: '',
})

const validateUserName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
    return
  }
  if (value.length < 2 || value.length > 20) {
    callback(new Error('用户名长度应在2-20个字符之间'))
    return
  }
  callback()
}

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号'))
    return
  }
  if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
    return
  }
  callback()
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
    return
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
    return
  }
  callback()
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }
  if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度为6-20个字符'))
    return
  }
  if (!/[a-zA-Z]/.test(value)) {
    callback(new Error('密码必须包含字母'))
    return
  }
  if (!/\d/.test(value)) {
    callback(new Error('密码必须包含数字'))
    return
  }
  callback()
}

const rules = {
  userName: [{ required: true, validator: validateUserName, trigger: 'blur' }],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  email: [{ required: true, validator: validateEmail, trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  userStatus: [{ required: true, message: '请选择用户状态', trigger: 'change' }],
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    userId: '',
    userName: '',
    phone: '',
    email: '',
    role: '',
    userStatus: 'Active',
    password: '',
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/user-manage/user-manage-detail/${row.userId || row.id}`)
}

const handleEdit = (row) => {
  if (row.role === 'Admin') {
    ElMessage.warning('不能编辑管理员用户')
    return
  }
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    phone: row.phone,
    email: row.email || row.address,
    role: row.role,
    userStatus: row.userStatus,
    password: '',
  })
  dialogVisible.value = true
}

const handleToggleStatus = async (row) => {
  if (row.role === 'Admin') {
    ElMessage.warning('不能冻结管理员用户')
    return
  }
  const newStatus = row.userStatus === 'Active' ? 'Inactive' : 'Active'
  const actionText = newStatus === 'Inactive' ? '冻结' : '解冻'

  try {
    await ElMessageBox.confirm(`确定要${actionText}用户"${row.userName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    ElMessage.success(`${actionText}成功`)
    proTableRef.value?.getTableList()
  } catch {
    // 用户取消
  }
}

const handleResetPwd = (row) => {
  if (row.role === 'Admin') {
    ElMessage.warning('不能重置管理员密码')
    return
  }
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
  if (row.role === 'Admin') {
    ElMessage.warning('不能删除管理员用户')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${row.userName}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    await deleteUser(row.userId)
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

const handleBatchFreeze = async (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要冻结的用户')
    return
  }
  const adminUsers = selectedList.filter((item) => item.role === 'Admin')
  if (adminUsers.length > 0) {
    ElMessage.warning('不能冻结管理员用户')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要冻结选中的 ${selectedList.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
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
  const adminUsers = selectedList.filter((item) => item.role === 'Admin')
  if (adminUsers.length > 0) {
    ElMessage.warning('不能删除管理员用户')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedList.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
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

const handleExportBatch = (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  const exportData = selectedList.map((item) => ({
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
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          const updateData = {
            id: formData.id,
            userName: formData.userName,
            phone: formData.phone,
            address: formData.email,
            role: formData.role,
            userStatus: formData.userStatus,
          }
          await updateUserInfo(updateData)
          ElMessage.success('修改成功')
        } else {
          const userData = {
            userId: formData.userId,
            userName: formData.userName,
            phone: formData.phone,
            address: formData.email,
            role: formData.role,
            userStatus: formData.userStatus,
          }
          console.log('新增的用户数据:', userData)
          await createUser(userData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        proTableRef.value?.getTableList()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(error.response?.data?.message || '操作失败')
      }
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const getTableList = async (params) => {
  const res = await getUserList()
  const innerData = res.data.data
  let list = Array.isArray(innerData?.data)
    ? innerData.data
    : (innerData?.list ?? innerData?.records ?? [])

  if (params?.userId) {
    list = list.filter((item) => item.userId?.includes(params.userId))
  }
  if (params?.userName) {
    list = list.filter((item) => item.userName?.includes(params.userName))
  }
  if (params?.phone) {
    list = list.filter((item) => item.phone?.includes(params.phone))
  }
  if (params?.role) {
    list = list.filter((item) => item.role === params.role)
  }
  if (params?.userStatus) {
    list = list.filter((item) => item.userStatus === params.userStatus)
  }

  const total = list.length
  const pageNum = params?.pageNum || 1
  const pageSize = params?.pageSize || 10
  const startIndex = (pageNum - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedList = list.slice(startIndex, endIndex)
  const dataWithIndex = paginatedList.map((item, index) => ({
    ...item,
    index: startIndex + index + 1,
    email: item.email || item.address,
  }))
  return {
    data: {
      list: dataWithIndex,
      total,
    },
  }
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
        <el-button
          type="success"
          :icon="Download"
          :disabled="!scope.isSelected"
          @click="handleExportBatch(scope.selectedList)"
        >
          批量导出
        </el-button>
      </template>

      <template #role="scope">
        <el-tag
          :type="
            scope.row.role === 'Admin'
              ? 'danger'
              : scope.row.role === 'Supervisor'
                ? 'warning'
                : 'primary'
          "
        >
          {{
            scope.row.role === 'Admin'
              ? '管理员'
              : scope.row.role === 'Supervisor'
                ? '主管'
                : '设计师'
          }}
        </el-tag>
      </template>

      <template #userStatus="scope">
        <el-tag
          :type="
            scope.row.userStatus === 'Active'
              ? 'success'
              : scope.row.userStatus === 'Inactive'
                ? 'warning'
                : 'danger'
          "
        >
          {{
            scope.row.userStatus === 'Active'
              ? '启用'
              : scope.row.userStatus === 'Inactive'
                ? '禁用'
                : '已删除'
          }}
        </el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <template v-if="scope.row.role !== 'Admin'">
          <el-button type="warning" link :icon="Edit" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            :type="scope.row.userStatus === 'Active' ? 'warning' : 'success'"
            link
            :icon="Lock"
            @click="handleToggleStatus(scope.row)"
          >
            {{ scope.row.userStatus === 'Active' ? '冻结' : '解冻' }}
          </el-button>
          <el-button type="primary" link :icon="Refresh" @click="handleResetPwd(scope.row)"
            >重置密码</el-button
          >
          <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
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
            <el-input v-model="formData.userId" />
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
              <el-option label="正常" value="Active" />
              <el-option label="冻结" value="Inactive" />
              <!-- <el-option label="已删除" value="Deleted" /> -->
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
