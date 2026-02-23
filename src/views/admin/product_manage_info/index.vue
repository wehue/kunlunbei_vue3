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
  {
    id: 1,
    productCode: 'PRD20240001',
    productName: '智能手表A1',
    description: '智能穿戴设备，支持心率监测、运动追踪',
  },
  {
    id: 2,
    productCode: 'PRD20240002',
    productName: '数控机床X5',
    description: '高精度数控加工设备',
  },
  { id: 3, productCode: 'PRD20240003', productName: '工业润滑油', description: '高温润滑专用' },
  { id: 4, productCode: 'PRD20240004', productName: '矿泉水', description: '天然矿泉水' },
  { id: 5, productCode: 'PRD20240005', productName: '运动T恤', description: '透气速干面料' },
  { id: 6, productCode: 'PRD20240006', productName: '瓷砖', description: '高档抛光砖' },
  {
    id: 7,
    productCode: 'PRD20240007',
    productName: '智能音箱S1',
    description: 'AI语音助手，智能家居控制',
  },
  {
    id: 8,
    productCode: 'PRD20240008',
    productName: '激光切割机',
    description: '高功率激光切割设备',
  },
  { id: 9, productCode: 'PRD20240009', productName: '清洗剂', description: '工业清洗专用' },
  { id: 10, productCode: 'PRD20240010', productName: '果汁饮料', description: '100%纯果汁' },
  { id: 11, productCode: 'PRD20240011', productName: '牛仔裤', description: '经典直筒版型' },
  { id: 12, productCode: 'PRD20240012', productName: '水泥', description: '普通硅酸盐水泥' },
])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'productCode', label: '产品编号', search: { el: 'input', key: 'productCode' } },
  { prop: 'productName', label: '产品名称', search: { el: 'input', key: 'productName' } },
  { prop: 'description', label: '产品描述', minWidth: 200 },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' },
])

const formData = reactive({
  id: null,
  productCode: '',
  productName: '',
  description: '',
})

const validateProductName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入产品名称'))
    return
  }
  if (value.length < 2 || value.length > 50) {
    callback(new Error('产品名称长度应在2-50个字符之间'))
    return
  }
  const exists = mockData.value.some(
    (item) => item.productName === value && item.id !== formData.id,
  )
  if (exists) {
    callback(new Error('产品名称已存在'))
  } else {
    callback()
  }
}

const rules = {
  productName: [{ required: true, validator: validateProductName, trigger: 'blur' }],
}

const generateProductCode = () => {
  const year = new Date().getFullYear()
  const maxId = mockData.value.reduce((max, item) => {
    const id = parseInt(item.id)
    return id > max ? id : max
  }, 0)
  const newId = String(maxId + 1).padStart(4, '0')
  return `PRD${year}${newId}`
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    productCode: generateProductCode(),
    productName: '',
    description: '',
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/product-manage/product-manage-detail/${row.id}`)
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    productCode: row.productCode,
    productName: row.productName,
    description: row.description,
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该产品吗？', '提示', {
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

      if (params?.productCode) {
        filteredData = filteredData.filter((item) => item.productCode.includes(params.productCode))
      }

      if (params?.productName) {
        filteredData = filteredData.filter((item) => item.productName.includes(params.productName))
      }

      if (params?.productType) {
        filteredData = filteredData.filter((item) => item.productType === params.productType)
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
  <div class="product-manage-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增产品</el-button>
      </template>

      <template #productType="scope">
        <el-tag>{{ scope.row.productType }}</el-tag>
      </template>

      <template #status="scope">
        <el-tag
          :type="
            scope.row.status === '在产'
              ? 'success'
              : scope.row.status === '停产'
                ? 'danger'
                : 'warning'
          "
        >
          {{ scope.row.status }}
        </el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button type="warning" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)"
          >删除</el-button
        >
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑产品' : '新增产品'"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="product-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-section">
          <div class="section-title">
            <span class="title-text">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="产品编号">
              <el-input v-model="formData.productCode" disabled placeholder="系统自动生成" />
            </el-form-item>
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="formData.productName" placeholder="请输入产品名称" />
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="title-text">产品描述</span>
          </div>
          <el-form-item label="产品描述">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入产品描述"
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
.product-manage-container {
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

.product-dialog {
  :deep(.el-dialog__header) {
    padding: 14px 21px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 20px;
    border-top: 1px solid #ebeef5;
  }

  .form-section {
    padding: 10px 12px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 26px;

    &:last-of-type {
      border-bottom: none;
    }

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .title-text {
        font-size: 20px;
        font-weight: 500;
        color: #303133;
        position: relative;
        padding-left: 10px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 14px;
          background: #409eff;
          border-radius: 2px;
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
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

@media screen and (max-width: 900px) {
  .product-dialog {
    .form-section {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .product-dialog {
    .form-section {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
