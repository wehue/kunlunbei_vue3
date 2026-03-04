<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowLeft, Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'
import { getPartDetail, getPartCategoryList } from '@/api/material'
import { getWarehouseList } from '@/api/warehouse'

const route = useRoute()
const router = useRouter()
const { isDesignerRole, isAdminRole } = usePermission()

const warehouseMap = ref(new Map())
const categoryMap = ref(new Map())

const fetchWarehouseList = async () => {
  try {
    const res = await getWarehouseList()
    console.log('获取仓库列表信息成功', res)
    const list = res.data?.data?.data || res.data?.data || []
    list.forEach((item) => {
      warehouseMap.value.set(item.id || item.warhouseId, item.warhouseName)
    })
  } catch (error) {
    console.error('获取仓库列表失败:', error)
  }
}

const fetchCategoryList = async () => {
  try {
    const res = await getPartCategoryList()
    console.log('获取物料分类列表信息成功', res)
    const list = res.data?.data?.data || res.data?.data || []
    list.forEach((item) => {
      categoryMap.value.set(item.categoryId, item.categoryName)
    })
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

onMounted(() => {
  fetchWarehouseList()
  fetchCategoryList()
})

const canManage = computed(() => isDesignerRole.value || isAdminRole.value)

const isEdit = ref(false)
const loading = ref(false)
const materialData = ref({})
const categoryList = ref([])
const categoryTreeData = ref([])
const warehouseList = ref([])

const transformToTree = (flatList) => {
  const maxList = []
  const midMap = new Map()
  const minMap = new Map()

  flatList.forEach((item) => {
    const id = String(item.categoryId)
    const node = {
      value: item.categoryId,
      label: item.categoryName,
      level: item.level,
      children: [],
    }

    if (item.level === 'Max') {
      maxList.push(node)
    } else if (item.level === 'Mid') {
      const parentId = Math.floor(parseInt(id) / 100) * 100
      if (!midMap.has(String(parentId))) {
        midMap.set(String(parentId), [])
      }
      midMap.get(String(parentId)).push(node)
    } else if (item.level === 'Min') {
      const parentId = id.substring(0, 3)
      if (!minMap.has(parentId)) {
        minMap.set(parentId, [])
      }
      minMap.get(parentId).push(node)
    }
  })

  maxList.forEach((maxNode) => {
    const maxId = String(maxNode.value)
    const midChildren = midMap.get(maxId) || []
    midChildren.forEach((midNode) => {
      const midId = String(midNode.value)
      const minChildren = minMap.get(midId) || []
      midNode.children = minChildren
    })
    maxNode.children = midChildren
  })

  return maxList
}

const fetchOptions = async () => {
  try {
    const [warehouseRes, categoryRes] = await Promise.all([
      getWarehouseList(),
      getPartCategoryList(),
    ])
    warehouseList.value = warehouseRes.data?.data?.data || warehouseRes.data?.data || []
    categoryList.value = categoryRes.data?.data?.data || categoryRes.data?.data || []
    if (categoryList.value.length > 0) {
      categoryTreeData.value = transformToTree(categoryList.value)
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

const formData = reactive({
  materialCode: '',
  materialName: '',
  specModel: '',
  stockQuantity: 0,
  supplier: '',
  version: '',
  category: [],
  selectedCategoryId: null,
  location: '',
  warehouse: null,
})
const formRef = ref()
const currentVersionId = ref(null)

const materialVersions = computed(() => {
  if (!materialData.value.id) return []
  return [materialData.value].filter(Boolean)
})

const versionOptions = computed(() => {
  return materialVersions.value.map((m) => ({
    label: m.isCurrent ? `${m.version}（当前）` : m.version,
    value: m.id,
  }))
})

const findCategoryPath = (categoryId, tree, path = []) => {
  const targetId = String(categoryId)
  for (const node of tree) {
    const currentPath = [...path, node.value]
    if (String(node.value) === targetId) {
      return currentPath
    }
    if (node.children && node.children.length > 0) {
      const found = findCategoryPath(categoryId, node.children, currentPath)
      if (found) return found
    }
  }
  return null
}

const loadMaterialData = async () => {
  loading.value = true
  try {
    const id = route.params.id
    console.log('物料详情页获取到的id:', id)
    if (!id) {
      ElMessage.error('物料ID不存在')
      return
    }
    const res = await getPartDetail(id)
    console.log('获取物料信息详情成功', res)
    const data = res.data?.data?.data || res.data?.data || {}
    console.log('API返回的原始数据:', data)

    const categoryId = data.category?.categoryId || data.categoryId || data.category
    const categoryName = categoryMap.value.get(categoryId) || data.category?.categoryName || ''
    const warehouseId = data.warhouse?.id || data.warhouseId || data.warhouse
    const warehouseName = warehouseMap.value.get(warehouseId) || data.warhouse?.warhouseName || ''

    const transformedData = {
      id: data.id,
      materialCode: data.partId || data.materialId || data.id,
      materialName: data.partName || data.materialName,
      version: data.versions || data.version,
      isCurrent: true,
      specModel: data.specificationModel || data.specModel || data.spec || '',
      stockQuantity: data.stockQuantity || data.stock || data.quantity || 0,
      supplier: data.supplier || data.supplierName || '',
      categoryId: categoryId,
      category: categoryName,
      warehouseId: warehouseId,
      location: warehouseName,
      baseId: data.baseId || data.id,
    }
    console.log('转换后的数据:', transformedData)

    materialData.value = { ...transformedData }
    currentVersionId.value = transformedData.id

    console.log('开始查找分类路径, categoryId:', categoryId)
    console.log('categoryTreeData:', categoryTreeData.value)

    const categoryPath =
      categoryId && categoryTreeData.value.length > 0
        ? findCategoryPath(categoryId, categoryTreeData.value)
        : []

    console.log('找到的分类路径:', categoryPath)

    Object.assign(formData, {
      materialCode: transformedData.materialCode,
      materialName: transformedData.materialName,
      specModel: transformedData.specModel,
      stockQuantity: transformedData.stockQuantity,
      supplier: transformedData.supplier,
      version: transformedData.version,
      category: categoryPath || [],
      selectedCategoryId: categoryId,
      location: warehouseName,
      warehouse: warehouseId ? { id: warehouseId } : null,
    })
  } catch (error) {
    console.error('获取物料详情失败:', error)
    ElMessage.error('获取物料详情失败')
  } finally {
    loading.value = false
  }
}

const handleVersionChange = async (versionId) => {
  await loadMaterialData()
}

const handleEdit = () => {
  isEdit.value = true
}

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消编辑吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      isEdit.value = false
      const categoryPath =
        materialData.value.categoryId && categoryTreeData.value.length > 0
          ? findCategoryPath(materialData.value.categoryId, categoryTreeData.value)
          : []
      Object.assign(formData, {
        materialCode: materialData.value.materialCode,
        materialName: materialData.value.materialName,
        specModel: materialData.value.specModel,
        stockQuantity: materialData.value.stockQuantity,
        supplier: materialData.value.supplier,
        version: materialData.value.version,
        category: categoryPath || [],
        selectedCategoryId: materialData.value.categoryId,
        location: materialData.value.location,
        warehouse: materialData.value.warehouseId ? { id: materialData.value.warehouseId } : null,
      })
    })
    .catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      const hasChanges =
        formData.specModel !== materialData.value.specModel ||
        formData.supplier !== materialData.value.supplier ||
        formData.category !== materialData.value.category ||
        formData.location !== materialData.value.location

      if (hasChanges) {
        const maxId = allMaterials.value.reduce((max, item) => {
          const id = parseInt(item.id)
          return id > max ? id : max
        }, 0)

        const currentMaxVersion = Math.max(
          ...materialVersions.value.map((m) => parseFloat(m.version.replace('V', ''))),
        )
        const newVersion = `V${(currentMaxVersion + 1).toFixed(1)}`

        allMaterials.value.forEach((m) => {
          if (m.baseId === materialData.value.baseId) {
            m.isCurrent = false
          }
        })

        const newMaterial = {
          id: maxId + 1,
          materialCode: formData.materialCode,
          materialName: formData.materialName,
          version: newVersion,
          isCurrent: true,
          specModel: formData.specModel,
          stockQuantity: formData.stockQuantity,
          supplier: formData.supplier,
          category: formData.category,
          location: formData.location,
          baseId: materialData.value.baseId,
        }

        allMaterials.value.push(newMaterial)
        materialData.value = { ...newMaterial }
        currentVersionId.value = newMaterial.id

        ElMessage.success(`保存成功，已生成新版本 ${newVersion}`)
      } else {
        const material = allMaterials.value.find((m) => m.id === materialData.value.id)
        if (material) {
          material.materialName = formData.materialName
          material.stockQuantity = formData.stockQuantity
        }
        materialData.value = { ...materialData.value, ...formData }
        ElMessage.success('保存成功')
      }

      isEdit.value = false
    }
  })
}

const handleBack = () => {
  router.push('/material-manage/material-manage-info')
}

const handleExport = () => {
  const exportData = [
    {
      物料编号: materialData.value.materialCode,
      物料名称: materialData.value.materialName,
      规格型号: materialData.value.specModel,
      库存数量: materialData.value.stockQuantity,
      供应商: materialData.value.supplier,
      版本号: materialData.value.version,
      分类: materialData.value.category,
      位置: materialData.value.location,
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '物料详情')
  XLSX.writeFile(
    workbook,
    `物料_${materialData.value.materialCode}_${materialData.value.version}.xlsx`,
  )
  ElMessage.success('导出成功')
}

const validateCategory = (rule, value, callback) => {
  if (!formData.selectedCategoryId) {
    callback(new Error('请选择分类'))
    return
  }
  callback()
}

const handleCategoryChange = (value) => {
  if (value && value.length > 0) {
    formData.selectedCategoryId = value[value.length - 1]
  } else {
    formData.selectedCategoryId = null
  }
}

const rules = {
  materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  specModel: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
  supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  category: [{ required: true, validator: validateCategory, trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
}

onMounted(async () => {
  fetchWarehouseList()
  fetchCategoryList()
  await fetchOptions()
  loadMaterialData()
})

watch(
  () => route.params.id,
  async () => {
    await fetchOptions()
    loadMaterialData()
  },
)
</script>

<template>
  <div class="material-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ materialData.materialName }}</h2>
          <span class="page-subtitle">物料详情</span>
        </div>
      </div>
      <div class="header-right">
        <div class="version-selector">
          <span class="version-label">版本：</span>
          <el-select
            v-model="currentVersionId"
            placeholder="选择版本"
            style="width: 180px"
            @change="handleVersionChange"
          >
            <el-option
              v-for="item in versionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <template v-if="!isEdit">
          <el-button v-if="canManage" type="primary" :icon="Edit" @click="handleEdit"
            >编辑</el-button
          >
          <el-button type="success" :icon="Download" @click="handleExport">导出</el-button>
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
              <div class="info-label">物料编号</div>
              <div class="info-value">
                <el-tag size="default">{{ materialData.materialCode }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">物料名称</div>
              <div class="info-value">{{ materialData.materialName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">规格型号</div>
              <div class="info-value">{{ materialData.specModel }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">库存数量</div>
              <div class="info-value">{{ materialData.stockQuantity }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">供应商</div>
              <div class="info-value">{{ materialData.supplier }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">版本号</div>
              <div class="info-value">
                <el-tag :type="materialData.isCurrent ? 'success' : 'info'" size="default">
                  {{ materialData.version }}
                  <span v-if="materialData.isCurrent">（当前）</span>
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">分类</div>
              <div class="info-value">
                <el-tag size="default">{{ materialData.category }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">位置</div>
              <div class="info-value">
                <el-tag type="warning" size="default">{{ materialData.location }}</el-tag>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="物料编号">
                <el-input v-model="formData.materialCode" disabled placeholder="系统自动生成" />
              </el-form-item>
              <el-form-item label="物料名称" prop="materialName">
                <el-input v-model="formData.materialName" placeholder="请输入物料名称" />
              </el-form-item>
              <el-form-item label="规格型号" prop="specModel">
                <el-input v-model="formData.specModel" placeholder="请输入规格型号" />
              </el-form-item>
              <el-form-item label="库存数量" prop="stockQuantity">
                <el-input-number
                  v-model="formData.stockQuantity"
                  :min="0"
                  placeholder="请输入库存数量"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="供应商" prop="supplier">
                <el-input v-model="formData.supplier" placeholder="请输入供应商名称" />
              </el-form-item>
              <el-form-item label="版本号">
                <el-input v-model="formData.version" disabled placeholder="修改后自动生成新版本" />
              </el-form-item>
              <el-form-item label="分类" prop="category">
                <el-cascader
                  v-model="formData.category"
                  :options="categoryTreeData"
                  :props="{
                    checkStrictly: true,
                    emitPath: true,
                  }"
                  placeholder="请选择分类"
                  style="width: 100%"
                  clearable
                  @change="handleCategoryChange"
                />
              </el-form-item>
              <el-form-item label="仓库" prop="warehouse">
                <el-select
                  v-model="formData.warehouse"
                  placeholder="请选择仓库"
                  style="width: 100%"
                  value-key="id"
                >
                  <el-option
                    v-for="item in warehouseList"
                    :key="item.id"
                    :label="item.warhouseName"
                    :value="{ id: item.id }"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form>
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">版本历史</span>
        </div>
        <div class="version-history">
          <el-timeline>
            <el-timeline-item
              v-for="version in materialVersions"
              :key="version.id"
              :type="version.isCurrent ? 'primary' : 'info'"
              :hollow="!version.isCurrent"
            >
              <div class="version-item" :class="{ current: version.isCurrent }">
                <div class="version-header">
                  <span class="version-name">{{ version.version }}</span>
                  <el-tag v-if="version.isCurrent" type="success" size="small">当前版本</el-tag>
                </div>
                <div class="version-info">
                  <span>规格型号：{{ version.specModel }}</span>
                  <span>供应商：{{ version.supplier }}</span>
                  <span>库存：{{ version.stockQuantity }}</span>
                  <span>分类：{{ version.category }}</span>
                  <span>位置：{{ version.location }}</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.material-detail-container {
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
      align-items: center;
      gap: 12px;

      .version-selector {
        display: flex;
        align-items: center;
        gap: 8px;

        .version-label {
          font-size: 15px;
          color: #606266;
        }
      }

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
        grid-template-columns: repeat(4, 1fr);
        gap: 1px;
        background: #ebeef5;
        padding: 1px;

        .info-item {
          display: flex;
          align-items: stretch;
          background: #fff;
          min-height: 60px;

          .info-label {
            width: 100px;
            padding: 18px 20px;
            background: #fafafa;
            font-size: 16px;
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
        grid-template-columns: repeat(4, 1fr);
        gap: 20px 32px;
        padding: 24px;

        :deep(.el-form-item) {
          margin-bottom: 0;

          .el-form-item__label {
            font-size: 16px;
            color: #606266;
            font-weight: 500;
            padding-bottom: 8px;
          }
        }
      }

      .version-history {
        padding: 20px;

        .version-item {
          &.current {
            .version-name {
              color: #409eff;
              font-weight: 600;
            }
          }

          .version-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;

            .version-name {
              font-size: 16px;
              font-weight: 500;
              color: #606266;
            }
          }

          .version-info {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1400px) {
  .material-detail-container {
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
  .material-detail-container {
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
