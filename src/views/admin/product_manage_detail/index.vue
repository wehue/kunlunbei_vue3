<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const loading = ref(false)
const productData = ref({})
const formData = reactive({})
const formRef = ref()

const mockProductData = {
  1: { id: 1, productCode: 'PRD20240001', productName: '智能手表A1', description: '智能穿戴设备，支持心率监测、运动追踪' },
  2: { id: 2, productCode: 'PRD20240002', productName: '数控机床X5', description: '高精度数控加工设备' },
  3: { id: 3, productCode: 'PRD20240003', productName: '工业润滑油', description: '高温润滑专用' },
  4: { id: 4, productCode: 'PRD20240004', productName: '矿泉水', description: '天然矿泉水' },
  5: { id: 5, productCode: 'PRD20240005', productName: '运动T恤', description: '透气速干面料' },
  6: { id: 6, productCode: 'PRD20240006', productName: '瓷砖', description: '高档抛光砖' },
  7: { id: 7, productCode: 'PRD20240007', productName: '智能音箱S1', description: 'AI语音助手，智能家居控制' },
  8: { id: 8, productCode: 'PRD20240008', productName: '激光切割机', description: '高功率激光切割设备' },
  9: { id: 9, productCode: 'PRD20240009', productName: '清洗剂', description: '工业清洗专用' },
  10: { id: 10, productCode: 'PRD20240010', productName: '果汁饮料', description: '100%纯果汁' },
  11: { id: 11, productCode: 'PRD20240011', productName: '牛仔裤', description: '经典直筒版型' },
  12: { id: 12, productCode: 'PRD20240012', productName: '水泥', description: '普通硅酸盐水泥' },
}

const loadProductData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = mockProductData[id] || mockProductData[1]
    productData.value = { ...data }
    Object.assign(formData, data)
    loading.value = false
  }, 300)
}

const handleEdit = () => {
  isEdit.value = true
  Object.assign(formData, productData.value)
}

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消编辑吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      isEdit.value = false
      Object.assign(formData, productData.value)
    })
    .catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      Object.assign(productData.value, formData)
      mockProductData[productData.value.id] = { ...productData.value }
      ElMessage.success('保存成功')
      isEdit.value = false
    }
  })
}

const handleBack = () => {
  router.push('/product-manage/product-manage-info')
}

const rules = {
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
}

onMounted(() => {
  loadProductData()
})
</script>

<template>
  <div class="product-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ productData.productName }}</h2>
          <span class="page-subtitle">产品详情</span>
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
              <div class="info-label">产品编号</div>
              <div class="info-value">
                <el-tag size="default">{{ productData.productCode }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">产品名称</div>
              <div class="info-value">{{ productData.productName }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="产品编号">
                <el-input v-model="formData.productCode" disabled placeholder="系统自动生成" />
              </el-form-item>
              <el-form-item label="产品名称" prop="productName">
                <el-input v-model="formData.productName" placeholder="请输入产品名称" />
              </el-form-item>
            </div>
          </el-form>
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">产品描述</span>
        </div>

        <template v-if="!isEdit">
          <div class="extend-info">
            <div class="extend-item">
              <div class="extend-content">
                <pre class="content-pre">{{ productData.description || '暂无' }}</pre>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="extend-edit">
            <el-form-item label="产品描述">
              <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入产品描述" />
            </el-form-item>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.product-detail-container {
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
            width: 110px;
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

      .extend-info {
        padding: 20px;

        .extend-item {
          .extend-content {
            background: #fafafa;
            border-radius: 4px;
            padding: 10px 10px;

            .content-pre {
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: inherit;
              line-height: 1.8;
              font-size: 16px;
              color: #303133;
            }
          }
        }
      }

      .extend-edit {
        padding: 16px 24px;
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .product-detail-container {
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
  .product-detail-container {
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
