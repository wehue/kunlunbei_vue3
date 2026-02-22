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

const mockData = ref([
  { id: 1, deptCode: 'DEPT20240001', deptName: '技术部', parentId: null, parentName: '', establishDate: '2020-01-15' },
  { id: 2, deptCode: 'DEPT20240002', deptName: '生产部', parentId: null, parentName: '', establishDate: '2020-02-20' },
  { id: 3, deptCode: 'DEPT20240003', deptName: '质量部', parentId: null, parentName: '', establishDate: '2020-03-10' },
  { id: 4, deptCode: 'DEPT20240004', deptName: '采购部', parentId: null, parentName: '', establishDate: '2020-04-05' },
  { id: 5, deptCode: 'DEPT20240005', deptName: '销售部', parentId: null, parentName: '', establishDate: '2020-05-12' },
  { id: 6, deptCode: 'DEPT20240006', deptName: '财务部', parentId: null, parentName: '', establishDate: '2020-06-18' },
  { id: 7, deptCode: 'DEPT20240007', deptName: '人力资源部', parentId: null, parentName: '', establishDate: '2020-07-22' },
  { id: 8, deptCode: 'DEPT20240008', deptName: '研发中心', parentId: 1, parentName: '技术部', establishDate: '2021-01-08' },
  { id: 9, deptCode: 'DEPT20240009', deptName: '测试中心', parentId: 1, parentName: '技术部', establishDate: '2021-02-15' },
  { id: 10, deptCode: 'DEPT20240010', deptName: '生产一车间', parentId: 2, parentName: '生产部', establishDate: '2021-03-20' },
  { id: 11, deptCode: 'DEPT20240011', deptName: '生产二车间', parentId: 2, parentName: '生产部', establishDate: '2021-04-10' },
  { id: 12, deptCode: 'DEPT20240012', deptName: '仓储中心', parentId: 2, parentName: '生产部', establishDate: '2021-05-05' },
])

const deptOptions = ref([])

const initDeptOptions = () => {
  deptOptions.value = mockData.value
    .filter((item) => !item.parentId)
    .map((item) => ({ label: item.deptName, value: item.id }))
}

initDeptOptions()

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'deptCode', label: '部门编号', search: { el: 'input', key: 'deptCode' } },
  { prop: 'deptName', label: '部门名称', search: { el: 'input', key: 'deptName' } },
  { prop: 'establishDate', label: '成立时间' },
  { prop: 'operation', label: '操作', width: 200, fixed: 'right' },
])

const formData = reactive({
  id: null,
  deptCode: '',
  deptName: '',
  parentId: null,
  parentName: '',
  establishDate: '',
})

const rules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  establishDate: [{ required: true, message: '请选择成立时间', trigger: 'change' }],
}

const generateDeptCode = () => {
  const year = new Date().getFullYear()
  const maxId = mockData.value.reduce((max, item) => {
    const id = parseInt(item.id)
    return id > max ? id : max
  }, 0)
  const newId = String(maxId + 1).padStart(4, '0')
  return `DEPT${year}${newId}`
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    deptCode: generateDeptCode(),
    deptName: '',
    parentId: null,
    parentName: '',
    establishDate: '',
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/dept-manage/dept-manage-detail/${row.id}`)
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    deptCode: row.deptCode,
    deptName: row.deptName,
    parentId: row.parentId,
    parentName: row.parentName,
    establishDate: row.establishDate,
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  const hasRelation = mockData.value.some((item) => item.parentId === row.id)
  if (hasRelation) {
    ElMessage.warning('该部门存在下级部门，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除该部门吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const index = mockData.value.findIndex((item) => item.id === row.id)
    if (index > -1) {
      mockData.value.splice(index, 1)
      initDeptOptions()
      ElMessage.success('删除成功')
      proTableRef.value?.getTableList()
    }
  } catch {
    // 用户取消
  }
}

const handleParentChange = (val) => {
  if (val) {
    const parent = mockData.value.find((item) => item.id === val)
    formData.parentName = parent ? parent.deptName : ''
  } else {
    formData.parentName = ''
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
        initDeptOptions()
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

      if (params?.deptCode) {
        filteredData = filteredData.filter((item) => item.deptCode.includes(params.deptCode))
      }

      if (params?.deptName) {
        filteredData = filteredData.filter((item) => item.deptName.includes(params.deptName))
      }

      if (params?.parentId) {
        filteredData = filteredData.filter((item) => item.parentId === params.parentId)
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

      <template #parentName="scope">
        <el-tag v-if="scope.row.parentName" type="success">{{ scope.row.parentName }}</el-tag>
        <span v-else>-</span>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button type="warning" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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
            <el-input v-model="formData.deptCode" disabled placeholder="系统自动生成" />
          </el-form-item>
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model="formData.deptName" placeholder="请输入部门名称" />
          </el-form-item>
          <el-form-item label="所属部门">
            <el-select
              v-model="formData.parentId"
              placeholder="请选择所属部门"
              clearable
              style="width: 100%"
              @change="handleParentChange"
            >
              <el-option
                v-for="item in deptOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="成立时间" prop="establishDate">
            <el-date-picker
              v-model="formData.establishDate"
              type="date"
              placeholder="请选择成立时间"
              value-format="YYYY-MM-DD"
              style="width: 100%"
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
