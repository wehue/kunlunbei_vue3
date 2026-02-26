<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowLeft, Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'

const route = useRoute()
const router = useRouter()
const { isDesignerRole, isAdminRole } = usePermission()

const canManage = computed(() => isDesignerRole.value || isAdminRole.value)

const isEdit = ref(false)
const loading = ref(false)
const materialData = ref({})
const formData = reactive({
  materialCode: '',
  materialName: '',
  specModel: '',
  stockQuantity: 0,
  supplier: '',
  version: '',
  category: '',
  location: '',
})
const formRef = ref()
const currentVersionId = ref(null)

const categoryTreeData = [
  {
    id: 1,
    label: '电子元器件',
    children: [
      {
        id: 11,
        label: '无源分立元件',
        children: [
          {
            id: 111,
            label: '磁性元件',
            children: [
              { id: 1111, label: '贴片电感' },
              { id: 1112, label: '功率磁环' },
              { id: 1113, label: '互感器磁芯' },
            ],
          },
          { id: 112, label: '电阻' },
          { id: 113, label: '电容' },
          { id: 114, label: '电感' },
        ],
      },
      {
        id: 12,
        label: '有源器件',
        children: [
          { id: 121, label: '二极管' },
          { id: 122, label: '三极管' },
          { id: 123, label: '集成电路' },
        ],
      },
      {
        id: 13,
        label: '连接器件',
        children: [
          { id: 131, label: '接插件' },
          { id: 132, label: '线缆' },
        ],
      },
    ],
  },
  {
    id: 2,
    label: '机械零件',
    children: [
      {
        id: 21,
        label: '紧固件',
        children: [
          { id: 211, label: '螺栓' },
          { id: 212, label: '螺母' },
          { id: 213, label: '垫圈' },
        ],
      },
      {
        id: 22,
        label: '传动件',
        children: [
          { id: 221, label: '齿轮' },
          { id: 222, label: '轴承' },
          { id: 223, label: '皮带' },
        ],
      },
      {
        id: 23,
        label: '结构件',
        children: [
          { id: 231, label: '支架' },
          { id: 232, label: '外壳' },
        ],
      },
    ],
  },
  {
    id: 3,
    label: '金属材料',
    children: [
      {
        id: 31,
        label: '钢材',
        children: [
          { id: 311, label: '碳钢' },
          { id: 312, label: '不锈钢' },
        ],
      },
      {
        id: 32,
        label: '铝材',
        children: [
          { id: 321, label: '铝合金板' },
          { id: 322, label: '铝型材' },
        ],
      },
      {
        id: 33,
        label: '铜材',
        children: [
          { id: 331, label: '黄铜' },
          { id: 332, label: '紫铜' },
        ],
      },
    ],
  },
  {
    id: 4,
    label: '塑料件',
    children: [
      { id: 41, label: 'ABS塑料' },
      { id: 42, label: 'PP塑料' },
      { id: 43, label: 'PC塑料' },
    ],
  },
  {
    id: 5,
    label: '成品',
    children: [
      {
        id: 51,
        label: '电子成品',
        children: [
          { id: 511, label: '控制板' },
          { id: 512, label: '电源模块' },
          { id: 513, label: '传感器组件' },
        ],
      },
      {
        id: 52,
        label: '机械成品',
        children: [
          { id: 521, label: '传动装置' },
          { id: 522, label: '结构件组件' },
          { id: 523, label: '连接件组件' },
        ],
      },
      {
        id: 53,
        label: '组装成品',
        children: [
          { id: 531, label: '汽车零部件' },
          { id: 532, label: '电子设备' },
          { id: 533, label: '管道组件' },
        ],
      },
    ],
  },
]

const locationOptions = [
  { label: '仓库A', value: '仓库A' },
  { label: '仓库B', value: '仓库B' },
  { label: '仓库C', value: '仓库C' },
  { label: '生产线', value: '生产线' },
]

const allMaterials = ref([
  {
    id: 1,
    materialCode: 'MAT20240001',
    materialName: '碳钢板材',
    version: 'V1.0',
    isCurrent: false,
    specModel: 'Q235B-10mm',
    stockQuantity: 500,
    supplier: '北京钢铁集团',
    category: '钢材',
    location: '仓库A',
    baseId: 'MAT001',
  },
  {
    id: 2,
    materialCode: 'MAT20240001',
    materialName: '碳钢板材',
    version: 'V2.0',
    isCurrent: true,
    specModel: 'Q235B-12mm',
    stockQuantity: 300,
    supplier: '北京钢铁集团',
    category: '钢材',
    location: '仓库A',
    baseId: 'MAT001',
  },
  {
    id: 3,
    materialCode: 'MAT20240002',
    materialName: '铝合金板',
    version: 'V1.0',
    isCurrent: true,
    specModel: '6061-T6-5mm',
    stockQuantity: 200,
    supplier: '上海铝业公司',
    category: '铝材',
    location: '仓库B',
    baseId: 'MAT002',
  },
  {
    id: 4,
    materialCode: 'MAT20240003',
    materialName: '黄铜棒材',
    version: 'V1.0',
    isCurrent: false,
    specModel: 'H62-Φ20',
    stockQuantity: 150,
    supplier: '广州铜材厂',
    category: '铜材',
    location: '仓库C',
    baseId: 'MAT003',
  },
  {
    id: 5,
    materialCode: 'MAT20240003',
    materialName: '黄铜棒材',
    version: 'V2.0',
    isCurrent: false,
    specModel: 'H62-Φ25',
    stockQuantity: 100,
    supplier: '广州铜材厂',
    category: '铜材',
    location: '仓库C',
    baseId: 'MAT003',
  },
  {
    id: 6,
    materialCode: 'MAT20240003',
    materialName: '黄铜棒材',
    version: 'V3.0',
    isCurrent: true,
    specModel: 'H62-Φ30',
    stockQuantity: 80,
    supplier: '广州铜材厂',
    category: '铜材',
    location: '仓库C',
    baseId: 'MAT003',
  },
  {
    id: 7,
    materialCode: 'MAT20240004',
    materialName: 'ABS塑料件',
    version: 'V1.0',
    isCurrent: true,
    specModel: 'ABS-标准件',
    stockQuantity: 1000,
    supplier: '深圳塑胶科技',
    category: '塑料件',
    location: '仓库A',
    baseId: 'MAT004',
  },
  {
    id: 8,
    materialCode: 'MAT20240005',
    materialName: '电阻电容',
    version: 'V1.0',
    isCurrent: true,
    specModel: '0402封装',
    stockQuantity: 5000,
    supplier: '东莞电子元件',
    category: '电子元件',
    location: '仓库B',
    baseId: 'MAT005',
  },
  {
    id: 9,
    materialCode: 'MAT20240006',
    materialName: '不锈钢管',
    version: 'V1.0',
    isCurrent: false,
    specModel: '304-Φ50',
    stockQuantity: 200,
    supplier: '北京钢铁集团',
    category: '钢材',
    location: '仓库C',
    baseId: 'MAT006',
  },
  {
    id: 10,
    materialCode: 'MAT20240006',
    materialName: '不锈钢管',
    version: 'V2.0',
    isCurrent: true,
    specModel: '304-Φ60',
    stockQuantity: 150,
    supplier: '北京钢铁集团',
    category: '钢材',
    location: '仓库C',
    baseId: 'MAT006',
  },
])

const materialVersions = computed(() => {
  if (!materialData.value.baseId) return []
  return allMaterials.value
    .filter((m) => m.baseId === materialData.value.baseId)
    .sort((a, b) => {
      const vA = parseFloat(a.version.replace('V', ''))
      const vB = parseFloat(b.version.replace('V', ''))
      return vB - vA
    })
})

const versionOptions = computed(() => {
  return materialVersions.value.map((m) => ({
    label: m.isCurrent ? `${m.version}（当前）` : m.version,
    value: m.id,
  }))
})

const loadMaterialData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = allMaterials.value.find((m) => m.id === parseInt(id)) || allMaterials.value[0]
    materialData.value = { ...data }
    currentVersionId.value = data.id
    Object.assign(formData, {
      materialCode: data.materialCode,
      materialName: data.materialName,
      specModel: data.specModel,
      stockQuantity: data.stockQuantity,
      supplier: data.supplier,
      version: data.version,
      category: data.category,
      location: data.location,
    })
    loading.value = false
  }, 300)
}

const handleVersionChange = (versionId) => {
  const data = allMaterials.value.find((m) => m.id === versionId)
  if (data) {
    materialData.value = { ...data }
    Object.assign(formData, {
      materialCode: data.materialCode,
      materialName: data.materialName,
      specModel: data.specModel,
      stockQuantity: data.stockQuantity,
      supplier: data.supplier,
      version: data.version,
      category: data.category,
      location: data.location,
    })
  }
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
      Object.assign(formData, {
        materialCode: materialData.value.materialCode,
        materialName: materialData.value.materialName,
        specModel: materialData.value.specModel,
        stockQuantity: materialData.value.stockQuantity,
        supplier: materialData.value.supplier,
        version: materialData.value.version,
        category: materialData.value.category,
        location: materialData.value.location,
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

const rules = {
  materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  specModel: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
  supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  location: [{ required: true, message: '请选择位置', trigger: 'change' }],
}

onMounted(() => {
  loadMaterialData()
})

watch(
  () => route.params.id,
  () => {
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
                    label: 'label',
                    value: 'label',
                    children: 'children',
                    checkStrictly: false,
                    emitPath: false,
                  }"
                  placeholder="请选择分类"
                  style="width: 100%"
                  clearable
                  filterable
                />
              </el-form-item>
              <el-form-item label="位置" prop="location">
                <el-select v-model="formData.location" placeholder="请选择位置" style="width: 100%">
                  <el-option
                    v-for="item in locationOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
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
