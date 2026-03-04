<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import {
  getProductionStaffList,
  addProductionStaff,
  updateProductionStaff,
  deleteProductionStaff,
} from '@/api/productionStaff'
import { getDeptOptions } from '@/api/dept'

const router = useRouter()

const proTableRef = ref()
const dialogVisible = ref(false)
const formRef = ref()
const isEdit = ref(false)

const deptOptions = ref([])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'productionStaffId', label: '工号', search: { el: 'input', key: 'productionStaffId' } },
  {
    prop: 'productionStaffName',
    label: '姓名',
    search: { el: 'input', key: 'productionStaffName' },
  },
  {
    prop: 'departmentName',
    label: '所属部门',
    search: { el: 'select', key: 'departmentName' },
    enum: deptOptions,
  },
  { prop: 'position', label: '岗位' },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' },
])

const formData = reactive({
  id: null,
  productionStaffId: '',
  productionStaffName: '',
  departmentId: '',
  position: '',
})

const rules = {
  productionStaffName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入岗位', trigger: 'blur' }],
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    productionStaffId: '',
    productionStaffName: '',
    departmentId: '',
    position: '',
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/operator-manage/operator-manage-detail/${row.id}`)
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    productionStaffId: row.productionStaffId,
    productionStaffName: row.productionStaffName,
    departmentId: row.departmentId || '',
    position: row.position,
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该人员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteProductionStaff(row.productionStaffId)
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
      console.error('删除失败:', error)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const selectedDept = deptOptions.value.find((item) => item.value === formData.departmentId)
        const requestData = {
          id: formData.id,
          productionStaffName: formData.productionStaffName,
          position: formData.position,
          department: {
            id: formData.departmentId,
            departmentName: selectedDept?.label || '',
          },
        }

        if (isEdit.value) {
          await updateProductionStaff(requestData)
          ElMessage.success('修改成功')
        } else {
          await addProductionStaff(requestData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        proTableRef.value?.getTableList()
      } catch (error) {
        ElMessage.error('操作失败，请重试')
        console.error('操作失败:', error)
      }
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const getTableList = async (params) => {
  const res = await getProductionStaffList()
  console.log('操作人员列表信息', res)
  const innerData = res.data.data
  let list = Array.isArray(innerData)
    ? innerData
    : Array.isArray(innerData?.data)
      ? innerData.data
      : (innerData?.list ?? innerData?.records ?? [])

  if (params?.productionStaffId) {
    list = list.filter((item) => item.productionStaffId?.includes(params.productionStaffId))
  }
  if (params?.productionStaffName) {
    list = list.filter((item) => item.productionStaffName?.includes(params.productionStaffName))
  }
  if (params?.departmentName) {
    list = list.filter((item) => {
      const deptName = item.department?.departmentName || ''
      return deptName.includes(params.departmentName)
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
    id: item.id,
    productionStaffId: item.productionStaffId,
    productionStaffName: item.productionStaffName,
    departmentName: item.department?.departmentName || '',
    departmentId: String(item.department?.id || item.department?.departmentId || ''),
    position: item.position,
    index: startIndex + index + 1,
  }))
  return {
    data: {
      list: dataWithIndex,
      total,
    },
  }
}

const fetchDeptOptions = async () => {
  try {
    const res = await getDeptOptions()
    console.log('部门列表', res)

    const data = res.data?.data?.data || []
    deptOptions.value = data.map((item) => ({
      label: item.workingProcedureName,
      value: String(item.id),
    }))
  } catch (error) {
    console.error('获取部门选项失败:', error)
  }
}

onMounted(() => {
  fetchDeptOptions()
})
</script>

<template>
  <div class="operator-manage-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增人员</el-button>
      </template>

      <template #departmentName="scope">
        <el-tag type="success">{{ scope.row.departmentName }}</el-tag>
      </template>

      <template #position="scope">
        <el-tag>{{ scope.row.position }}</el-tag>
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
      :title="isEdit ? '编辑人员' : '新增人员'"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      class="operator-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="工号">
            <el-input v-model="formData.productionStaffId" placeholder="请输入工号" />
          </el-form-item>
          <el-form-item label="姓名" prop="productionStaffName">
            <el-input v-model="formData.productionStaffName" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="所属部门" prop="departmentId">
            <el-select
              v-model="formData.departmentId"
              placeholder="请选择所属部门"
              style="width: 100%"
            >
              <el-option
                v-for="item in deptOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="岗位" prop="position">
            <el-input v-model="formData.position" placeholder="请输入岗位" />
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
.operator-manage-container {
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

.operator-dialog {
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
  .operator-dialog {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
