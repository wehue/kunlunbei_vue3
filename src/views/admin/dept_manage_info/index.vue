<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import { getDeptList, addDept, updateDept, deleteDept } from '@/api/dept'

const router = useRouter()

const proTableRef = ref()
const dialogVisible = ref(false)
const formRef = ref()
const isEdit = ref(false)

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'deptCode', label: '部门编号', search: { el: 'input', key: 'deptCode' } },
  { prop: 'deptName', label: '部门名称', search: { el: 'input', key: 'deptName' } },
  { prop: 'establishDate', label: '成立时间' },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' },
])

const formData = reactive({
  id: null,
  departmentId: '',
  departmentName: '',
})

const rules = {
  departmentName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    departmentId: '',
    departmentName: '',
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/dept-manage/dept-manage-detail/${row.departmentId || row.deptId || row.id}`)
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.departmentId || row.deptId || row.id || null,
    departmentId: row.departmentId || row.deptId || row.deptCode || '',
    departmentName: row.departmentName || row.deptName || row.name || '',
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该部门吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const deptId = row.departmentId || row.deptId || row.id
    await deleteDept(deptId)
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateDept({
            id: formData.id,
            departmentId: formData.departmentId,
            departmentName: formData.departmentName,
          })
          ElMessage.success('修改成功')
        } else {
          await addDept({
            departmentId: formData.departmentId,
            departmentName: formData.departmentName,
          })
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        proTableRef.value?.getTableList()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const handleCancel = () => {
  dialogVisible.value = false
}

const getTableList = async (params) => {
  const res = await getDeptList()
  console.log('部门列表信息', res)
  const innerData = res.data.data
  let list = Array.isArray(innerData)
    ? innerData
    : Array.isArray(innerData?.data)
      ? innerData.data
      : (innerData?.list ?? innerData?.records ?? [])

  if (params?.deptCode) {
    list = list.filter((item) => {
      const code = item.departmentId || item.deptId || item.deptCode || ''
      return code.includes(params.deptCode)
    })
  }
  if (params?.deptName) {
    list = list.filter((item) => {
      const name = item.departmentName || item.deptName || item.name || ''
      return name.includes(params.deptName)
    })
  }

  const total = list.length
  const pageNum = params?.pageNum || 1
  const pageSize = params?.pageSize || 10
  const startIndex = (pageNum - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedList = list.slice(startIndex, endIndex)
  const dataWithIndex = paginatedList.map((item, index) => ({
    ...item,
    id: item.departmentId || item.deptId || item.id,
    deptCode: item.departmentId || item.deptId || item.deptCode || '',
    deptName: item.departmentName || item.deptName || item.name || '',
    establishDate: formatDateTime(item.createTime || item.establishDate || ''),
    index: startIndex + index + 1,
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
  <div class="dept-manage-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增部门</el-button>
      </template>

      <template #operation="scope">
        <!-- <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button> -->
        <el-button type="warning" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)"
          >删除</el-button
        >
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑部门' : '新增部门'"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      class="dept-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="部门编号">
            <el-input v-model="formData.departmentId" placeholder="请输入部门编号" />
          </el-form-item>
          <el-form-item label="部门名称" prop="departmentName">
            <el-input v-model="formData.departmentName" placeholder="请输入部门名称" />
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
  </div>
</template>

<style lang="scss" scoped>
.dept-manage-container {
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
              gap: 8px;
              justify-content: center;
              align-items: center;

              .el-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 4px 8px !important;
                margin: 0 !important;

                .el-icon {
                  margin-right: 4px;
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

.dept-dialog {
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

@media screen and (max-width: 768px) {
  .dept-dialog {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
