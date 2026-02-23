<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'

const router = useRouter()

const proTableRef = ref()
const dialogVisible = ref(false)
const formRef = ref()
const isEdit = ref(false)

const deptOptions = ref([
  { label: '技术部', value: '技术部' },
  { label: '生产部', value: '生产部' },
  { label: '质量部', value: '质量部' },
  { label: '采购部', value: '采购部' },
  { label: '销售部', value: '销售部' },
  { label: '财务部', value: '财务部' },
  { label: '人力资源部', value: '人力资源部' },
])

const positionOptions = ref([
  { label: '工程师', value: '工程师' },
  { label: '技术员', value: '技术员' },
  { label: '操作工', value: '操作工' },
  { label: '质检员', value: '质检员' },
  { label: '采购员', value: '采购员' },
  { label: '销售员', value: '销售员' },
  { label: '会计', value: '会计' },
  { label: '人事专员', value: '人事专员' },
  { label: '主管', value: '主管' },
  { label: '经理', value: '经理' },
])

const mockData = ref([
  { id: 1, employeeCode: 'EMP20240001', employeeName: '张三', deptName: '技术部', position: '工程师' },
  { id: 2, employeeCode: 'EMP20240002', employeeName: '李四', deptName: '生产部', position: '操作工' },
  { id: 3, employeeCode: 'EMP20240003', employeeName: '王五', deptName: '质量部', position: '质检员' },
  { id: 4, employeeCode: 'EMP20240004', employeeName: '赵六', deptName: '采购部', position: '采购员' },
  { id: 5, employeeCode: 'EMP20240005', employeeName: '钱七', deptName: '销售部', position: '销售员' },
  { id: 6, employeeCode: 'EMP20240006', employeeName: '孙八', deptName: '财务部', position: '会计' },
  { id: 7, employeeCode: 'EMP20240007', employeeName: '周九', deptName: '人力资源部', position: '人事专员' },
  { id: 8, employeeCode: 'EMP20240008', employeeName: '吴十', deptName: '技术部', position: '技术员' },
  { id: 9, employeeCode: 'EMP20240009', employeeName: '郑十一', deptName: '生产部', position: '主管' },
  { id: 10, employeeCode: 'EMP20240010', employeeName: '王十二', deptName: '技术部', position: '经理' },
  { id: 11, employeeCode: 'EMP20240011', employeeName: '刘明', deptName: '质量部', position: '质检员' },
  { id: 12, employeeCode: 'EMP20240012', employeeName: '陈华', deptName: '生产部', position: '操作工' },
])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'employeeCode', label: '工号', search: { el: 'input', key: 'employeeCode' } },
  { prop: 'employeeName', label: '姓名', search: { el: 'input', key: 'employeeName' } },
  { prop: 'deptName', label: '所属部门', search: { el: 'select', key: 'deptName' }, enum: deptOptions },
  { prop: 'position', label: '岗位' },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' },
])

const formData = reactive({
  id: null,
  employeeCode: '',
  employeeName: '',
  deptName: '',
  position: '',
})

const rules = {
  employeeName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  deptName: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  position: [{ required: true, message: '请选择岗位', trigger: 'change' }],
}

const generateEmployeeCode = () => {
  const year = new Date().getFullYear()
  const maxId = mockData.value.reduce((max, item) => {
    const id = parseInt(item.id)
    return id > max ? id : max
  }, 0)
  const newId = String(maxId + 1).padStart(4, '0')
  return `EMP${year}${newId}`
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    employeeCode: generateEmployeeCode(),
    employeeName: '',
    deptName: '',
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
    employeeCode: row.employeeCode,
    employeeName: row.employeeName,
    deptName: row.deptName,
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
    const index = mockData.value.findIndex((item) => item.id === row.id)
    if (index > -1) {
      mockData.value.splice(index, 1)
      ElMessage.success('删除成功')
      proTableRef.value?.getTableList()
    }
  } catch {
    // 用户取消
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = mockData.value.findIndex((item) => item.id === formData.id)
        if (index > -1) {
          mockData.value[index] = { ...mockData.value[index], ...formData }
        }
        ElMessage.success('修改成功')
      } else {
        const maxId = mockData.value.reduce((max, item) => {
          const id = parseInt(item.id)
          return id > max ? id : max
        }, 0)
        mockData.value.push({
          id: maxId + 1,
          ...formData,
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

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockData.value]

      if (params?.employeeCode) {
        filteredData = filteredData.filter((item) => item.employeeCode.includes(params.employeeCode))
      }

      if (params?.employeeName) {
        filteredData = filteredData.filter((item) => item.employeeName.includes(params.employeeName))
      }

      if (params?.deptName) {
        filteredData = filteredData.filter((item) => item.deptName === params.deptName)
      }

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

      <template #deptName="scope">
        <el-tag type="success">{{ scope.row.deptName }}</el-tag>
      </template>

      <template #position="scope">
        <el-tag>{{ scope.row.position }}</el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button type="warning" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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
            <el-input v-model="formData.employeeCode" disabled placeholder="系统自动生成" />
          </el-form-item>
          <el-form-item label="姓名" prop="employeeName">
            <el-input v-model="formData.employeeName" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="所属部门" prop="deptName">
            <el-select v-model="formData.deptName" placeholder="请选择所属部门" style="width: 100%">
              <el-option
                v-for="item in deptOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="岗位" prop="position">
            <el-select v-model="formData.position" placeholder="请选择岗位" style="width: 100%">
              <el-option
                v-for="item in positionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 4px 8px;
              justify-items: stretch;
              align-items: stretch;

              .el-button {
                width: 100%;
                min-width: 60px;
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
