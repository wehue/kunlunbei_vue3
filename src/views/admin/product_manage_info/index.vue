<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import { getProductFind, createProduct, updateProduct, deleteProduct } from '@/api/product'

const router = useRouter()

const proTableRef = ref()
const dialogVisible = ref(false)
const formRef = ref()
const isEdit = ref(false)

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'productId', label: '产品编码', search: { el: 'input', key: 'productId' } },
  { prop: 'productName', label: '产品名称', search: { el: 'input', key: 'productName' } },
  { prop: 'productDescription', label: '产品描述', minWidth: 200 },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' },
])

const formData = reactive({
  id: '',
  productId: '',
  productName: '',
  productDescription: '',
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
  callback()
}

const rules = {
  productName: [{ required: true, validator: validateProductName, trigger: 'blur' }],
}

const generateProductCode = () => {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const day = String(new Date().getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `CP${year}${month}${day}${random}`
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    productId: generateProductCode(),
    productName: '',
    productDescription: '',
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/product-manage/product-manage-detail/${row.productId}`)
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    productId: row.productId,
    productName: row.productName,
    productDescription: row.productDescription,
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
    await deleteProduct(row.productId)
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    console.error('删除失败:', error)
    // 用户取消或删除失败
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateProduct(formData)
          ElMessage.success('修改成功')
        } else {
          await createProduct(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        proTableRef.value?.getTableList()
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const getTableList = async (params) => {
  try {
    const res = await getProductFind(params)
    console.log('产品列表', res)

    let dataList = res.data?.data?.data || res.data?.data || []
    if (!Array.isArray(dataList)) {
      dataList = []
    }

    const pageNum = params?.pageNum || 1
    const pageSize = params?.pageSize || 10
    const startIndex = (pageNum - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = dataList.slice(startIndex, endIndex)

    const dataWithIndex = paginatedData.map((item, index) => ({
      ...item,
      index: startIndex + index + 1,
    }))

    return {
      data: {
        list: dataWithIndex,
        total: dataList.length,
      },
    }
  } catch (error) {
    console.error('获取产品列表失败:', error)
    ElMessage.error('获取产品列表失败')
    return {
      data: {
        list: [],
        total: 0,
      },
    }
  }
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
      :title="isEdit ? '编辑产品' : '新增产品'"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="product-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div style="display: none">
          <el-input v-model="formData.id" />
        </div>
        <div class="form-section">
          <div class="section-title">
            <span class="title-text">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="产品编码">
              <el-input v-model="formData.productId" :disabled="true" placeholder="系统自动生成" />
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
              v-model="formData.productDescription"
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
