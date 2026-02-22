<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowLeft, Download, Plus, Delete } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'

const route = useRoute()
const router = useRouter()
const { isAdminRole } = usePermission()

const isEdit = ref(false)
const loading = ref(false)
const bomData = ref({})
const formData = reactive({
  bomCode: '',
  bomName: '',
  version: '',
  parentMaterialId: null,
  childMaterials: [],
})
const formRef = ref()
const currentVersionId = ref(null)

const materialOptions = [
  { id: 1, materialCode: 'MAT20240001', materialName: '碳钢板材', specModel: 'Q235B-12mm' },
  { id: 2, materialCode: 'MAT20240002', materialName: '铝合金板', specModel: '6061-T6-5mm' },
  { id: 3, materialCode: 'MAT20240003', materialName: '黄铜棒材', specModel: 'H62-Φ30' },
  { id: 4, materialCode: 'MAT20240004', materialName: 'ABS塑料件', specModel: 'ABS-标准件' },
  { id: 5, materialCode: 'MAT20240005', materialName: '电阻电容', specModel: '0402封装' },
  { id: 6, materialCode: 'MAT20240006', materialName: '不锈钢管', specModel: '304-Φ60' },
]

const processOptions = [
  { value: '车削加工', label: '车削加工' },
  { value: '铣削加工', label: '铣削加工' },
  { value: '钻孔工序', label: '钻孔工序' },
  { value: '磨削精加工', label: '磨削精加工' },
  { value: '质量检测', label: '质量检测' },
  { value: '热处理', label: '热处理' },
  { value: '表面处理', label: '表面处理' },
  { value: '组装工序', label: '组装工序' },
]

const allBomData = ref([
  {
    id: 1,
    bomCode: 'BOM20240001',
    bomName: '汽车零部件BOM',
    version: 'V1.0',
    isCurrent: false,
    parentMaterial: {
      id: 1,
      materialCode: 'MAT20240001',
      materialName: '碳钢板材',
      specModel: 'Q235B-10mm',
    },
    childMaterials: [
      {
        id: 1,
        materialId: 2,
        materialCode: 'MAT20240002',
        materialName: '铝合金板',
        quantity: 5,
        process: '车削加工',
      },
      {
        id: 2,
        materialId: 3,
        materialCode: 'MAT20240003',
        materialName: '黄铜棒材',
        quantity: 10,
        process: '铣削加工',
      },
    ],
    baseId: 'BOM001',
  },
  {
    id: 2,
    bomCode: 'BOM20240001',
    bomName: '汽车零部件BOM',
    version: 'V2.0',
    isCurrent: true,
    parentMaterial: {
      id: 1,
      materialCode: 'MAT20240001',
      materialName: '碳钢板材',
      specModel: 'Q235B-12mm',
    },
    childMaterials: [
      {
        id: 1,
        materialId: 2,
        materialCode: 'MAT20240002',
        materialName: '铝合金板',
        quantity: 6,
        process: '车削加工',
      },
      {
        id: 2,
        materialId: 3,
        materialCode: 'MAT20240003',
        materialName: '黄铜棒材',
        quantity: 12,
        process: '铣削加工',
      },
      {
        id: 3,
        materialId: 4,
        materialCode: 'MAT20240004',
        materialName: 'ABS塑料件',
        quantity: 20,
        process: '组装工序',
      },
    ],
    baseId: 'BOM001',
  },
  {
    id: 3,
    bomCode: 'BOM20240002',
    bomName: '电子设备BOM',
    version: 'V1.0',
    isCurrent: true,
    parentMaterial: {
      id: 5,
      materialCode: 'MAT20240005',
      materialName: '电阻电容',
      specModel: '0402封装',
    },
    childMaterials: [
      {
        id: 1,
        materialId: 4,
        materialCode: 'MAT20240004',
        materialName: 'ABS塑料件',
        quantity: 2,
        process: '组装工序',
      },
      {
        id: 2,
        materialId: 5,
        materialCode: 'MAT20240005',
        materialName: '电阻电容',
        quantity: 100,
        process: '质量检测',
      },
    ],
    baseId: 'BOM002',
  },
  {
    id: 4,
    bomCode: 'BOM20240003',
    bomName: '管道组件BOM',
    version: 'V1.0',
    isCurrent: false,
    parentMaterial: {
      id: 6,
      materialCode: 'MAT20240006',
      materialName: '不锈钢管',
      specModel: '304-Φ50',
    },
    childMaterials: [
      {
        id: 1,
        materialId: 1,
        materialCode: 'MAT20240001',
        materialName: '碳钢板材',
        quantity: 3,
        process: '焊接',
      },
    ],
    baseId: 'BOM003',
  },
  {
    id: 5,
    bomCode: 'BOM20240003',
    bomName: '管道组件BOM',
    version: 'V2.0',
    isCurrent: true,
    parentMaterial: {
      id: 6,
      materialCode: 'MAT20240006',
      materialName: '不锈钢管',
      specModel: '304-Φ60',
    },
    childMaterials: [
      {
        id: 1,
        materialId: 1,
        materialCode: 'MAT20240001',
        materialName: '碳钢板材',
        quantity: 4,
        process: '焊接',
      },
      {
        id: 2,
        materialId: 3,
        materialCode: 'MAT20240003',
        materialName: '黄铜棒材',
        quantity: 8,
        process: '车削加工',
      },
    ],
    baseId: 'BOM003',
  },
  {
    id: 6,
    bomCode: 'BOM20240004',
    bomName: '机械零件BOM',
    version: 'V1.0',
    isCurrent: true,
    parentMaterial: {
      id: 2,
      materialCode: 'MAT20240002',
      materialName: '铝合金板',
      specModel: '6061-T6-5mm',
    },
    childMaterials: [
      {
        id: 1,
        materialId: 3,
        materialCode: 'MAT20240003',
        materialName: '黄铜棒材',
        quantity: 15,
        process: '车削加工',
      },
      {
        id: 2,
        materialId: 6,
        materialCode: 'MAT20240006',
        materialName: '不锈钢管',
        quantity: 5,
        process: '磨削精加工',
      },
    ],
    baseId: 'BOM004',
  },
])

const bomVersions = computed(() => {
  if (!bomData.value.baseId) return []
  return allBomData.value
    .filter((b) => b.baseId === bomData.value.baseId)
    .sort((a, b) => {
      const vA = parseFloat(a.version.replace('V', ''))
      const vB = parseFloat(b.version.replace('V', ''))
      return vB - vA
    })
})

const versionOptions = computed(() => {
  return bomVersions.value.map((b) => ({
    label: b.isCurrent ? `${b.version}（当前）` : b.version,
    value: b.id,
  }))
})

const loadBomData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = allBomData.value.find((b) => b.id === parseInt(id)) || allBomData.value[0]
    bomData.value = { ...data }
    currentVersionId.value = data.id
    Object.assign(formData, {
      bomCode: data.bomCode,
      bomName: data.bomName,
      version: data.version,
      parentMaterialId: data.parentMaterial?.id || null,
      childMaterials: JSON.parse(JSON.stringify(data.childMaterials || [])),
    })
    loading.value = false
  }, 300)
}

const handleVersionChange = (versionId) => {
  const data = allBomData.value.find((b) => b.id === versionId)
  if (data) {
    bomData.value = { ...data }
    Object.assign(formData, {
      bomCode: data.bomCode,
      bomName: data.bomName,
      version: data.version,
      parentMaterialId: data.parentMaterial?.id || null,
      childMaterials: JSON.parse(JSON.stringify(data.childMaterials || [])),
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
        bomCode: bomData.value.bomCode,
        bomName: bomData.value.bomName,
        version: bomData.value.version,
        parentMaterialId: bomData.value.parentMaterial?.id || null,
        childMaterials: JSON.parse(JSON.stringify(bomData.value.childMaterials || [])),
      })
    })
    .catch(() => {})
}

const handleAddChildMaterial = () => {
  formData.childMaterials.push({
    id: Date.now(),
    materialId: null,
    quantity: 1,
    process: '',
  })
}

const handleRemoveChildMaterial = (index) => {
  formData.childMaterials.splice(index, 1)
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (formData.childMaterials.length === 0) {
        ElMessage.warning('请至少添加一个子物料')
        return
      }

      const hasChanges =
        formData.bomName !== bomData.value.bomName ||
        formData.parentMaterialId !== bomData.value.parentMaterial?.id ||
        JSON.stringify(formData.childMaterials) !== JSON.stringify(bomData.value.childMaterials)

      if (hasChanges) {
        const maxId = allBomData.value.reduce((max, item) => {
          const id = parseInt(item.id)
          return id > max ? id : max
        }, 0)

        const currentMaxVersion = Math.max(
          ...bomVersions.value.map((b) => parseFloat(b.version.replace('V', ''))),
        )
        const newVersion = `V${(currentMaxVersion + 1).toFixed(1)}`

        allBomData.value.forEach((b) => {
          if (b.baseId === bomData.value.baseId) {
            b.isCurrent = false
          }
        })

        const parentMaterial = materialOptions.find((m) => m.id === formData.parentMaterialId)
        const childMaterialsWithInfo = formData.childMaterials.map((c) => {
          const material = materialOptions.find((m) => m.id === c.materialId)
          return {
            ...c,
            materialCode: material?.materialCode,
            materialName: material?.materialName,
          }
        })

        const newBom = {
          id: maxId + 1,
          bomCode: formData.bomCode,
          bomName: formData.bomName,
          version: newVersion,
          isCurrent: true,
          parentMaterial: { ...parentMaterial },
          childMaterials: childMaterialsWithInfo,
          baseId: bomData.value.baseId,
        }

        allBomData.value.push(newBom)
        bomData.value = { ...newBom }
        currentVersionId.value = newBom.id

        ElMessage.success(`保存成功，已生成新版本 ${newVersion}`)
      } else {
        ElMessage.success('保存成功')
      }

      isEdit.value = false
    }
  })
}

const handleBack = () => {
  router.push('/material-manage/bom-manage')
}

const handleExport = () => {
  const childMaterialStr =
    bomData.value.childMaterials?.map((c) => `${c.materialName}(${c.quantity})`).join('、') || '无'
  const exportData = [
    {
      清单编码: bomData.value.bomCode,
      物料清单名称: bomData.value.bomName,
      版本号: bomData.value.version,
      父物料: bomData.value.parentMaterial?.materialName || '无',
      父物料编号: bomData.value.parentMaterial?.materialCode || '无',
      父物料规格: bomData.value.parentMaterial?.specModel || '无',
      子物料: childMaterialStr,
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'BOM详情')
  XLSX.writeFile(workbook, `BOM_${bomData.value.bomCode}_${bomData.value.version}.xlsx`)
  ElMessage.success('导出成功')
}

const rules = {
  bomName: [{ required: true, message: '请输入物料清单名称', trigger: 'blur' }],
  parentMaterialId: [{ required: true, message: '请选择父物料', trigger: 'change' }],
}

onMounted(() => {
  loadBomData()
})

watch(
  () => route.params.id,
  () => {
    loadBomData()
  },
)
</script>

<template>
  <div class="bom-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ bomData.bomName }}</h2>
          <span class="page-subtitle">BOM详情</span>
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
          <el-button v-if="isAdminRole" type="primary" :icon="Edit" @click="handleEdit"
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
              <div class="info-label">清单编码</div>
              <div class="info-value">
                <el-tag size="default">{{ bomData.bomCode }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">物料清单名称</div>
              <div class="info-value">{{ bomData.bomName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">版本号</div>
              <div class="info-value">
                <el-tag :type="bomData.isCurrent ? 'success' : 'info'" size="default">
                  {{ bomData.version }}
                  <span v-if="bomData.isCurrent">（当前）</span>
                </el-tag>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="清单编码">
                <el-input v-model="formData.bomCode" disabled placeholder="系统自动生成" />
              </el-form-item>
              <el-form-item label="物料清单名称" prop="bomName">
                <el-input v-model="formData.bomName" placeholder="请输入物料清单名称" />
              </el-form-item>
              <el-form-item label="版本号">
                <el-input v-model="formData.version" disabled placeholder="修改后自动生成新版本" />
              </el-form-item>
            </div>
          </el-form>
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">父物料</span>
        </div>

        <template v-if="!isEdit">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">物料编号</div>
              <div class="info-value">
                <el-tag size="default">{{ bomData.parentMaterial?.materialCode || '无' }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">物料名称</div>
              <div class="info-value">{{ bomData.parentMaterial?.materialName || '无' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">规格型号</div>
              <div class="info-value">{{ bomData.parentMaterial?.specModel || '无' }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="form-grid-single">
            <el-form-item label="选择父物料" prop="parentMaterialId">
              <el-select
                v-model="formData.parentMaterialId"
                placeholder="请选择父物料"
                style="width: 100%"
              >
                <el-option
                  v-for="item in materialOptions"
                  :key="item.id"
                  :label="`${item.materialName} (${item.materialCode})`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </div>
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">子物料</span>
          <el-button v-if="isEdit" type="primary" link :icon="Plus" @click="handleAddChildMaterial">
            添加子物料
          </el-button>
        </div>

        <template v-if="!isEdit">
          <div class="table-container">
            <el-table :data="bomData.childMaterials" border style="width: 100%" class="bom-table">
              <el-table-column prop="materialCode" label="物料编号" />
              <el-table-column prop="materialName" label="物料名称" />
              <el-table-column prop="quantity" label="数量" />
              <el-table-column prop="process" label="工序" />
            </el-table>
            <div
              v-if="!bomData.childMaterials || bomData.childMaterials.length === 0"
              class="empty-data"
            >
              暂无子物料信息
            </div>
          </div>
        </template>

        <template v-else>
          <div class="child-materials-list">
            <div
              v-for="(child, index) in formData.childMaterials"
              :key="child.id"
              class="child-item"
            >
              <div class="child-header">
                <span class="child-index">子物料 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  link
                  :icon="Delete"
                  @click="handleRemoveChildMaterial(index)"
                >
                  删除
                </el-button>
              </div>
              <div class="child-form">
                <el-select v-model="child.materialId" placeholder="选择物料" style="width: 200px">
                  <el-option
                    v-for="item in materialOptions"
                    :key="item.id"
                    :label="item.materialName"
                    :value="item.id"
                  />
                </el-select>
                <el-input-number
                  v-model="child.quantity"
                  :min="1"
                  placeholder="数量"
                  style="width: 120px"
                />
                <el-select v-model="child.process" placeholder="选择工序" style="width: 150px">
                  <el-option
                    v-for="item in processOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>
            <div v-if="formData.childMaterials.length === 0" class="empty-tip">
              暂无子物料，点击上方按钮添加
            </div>
          </div>
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">版本历史</span>
        </div>
        <div class="version-history">
          <el-timeline>
            <el-timeline-item
              v-for="version in bomVersions"
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
                  <span>父物料：{{ version.parentMaterial?.materialName }}</span>
                  <span>子物料数量：{{ version.childMaterials?.length || 0 }}</span>
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
.bom-detail-container {
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
        grid-template-columns: repeat(3, 1fr);
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

      .form-grid-single {
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

      .table-container {
        padding: 20px;

        :deep(.bom-table) {
          .el-table__header {
            th .cell {
              font-size: 18px;
              font-weight: 500;
              color: #606266;
            }
          }
          .el-table__body {
            td .cell {
              font-size: 16px;
              color: #303133;
            }
          }
        }

        .empty-data {
          text-align: center;
          color: #909399;
          padding: 40px;
        }
      }

      .child-materials-list {
        padding: 16px;

        .child-item {
          padding: 12px;
          background: #fafafa;
          border-radius: 4px;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .child-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .child-index {
              font-size: 14px;
              font-weight: 500;
              color: #606266;
            }
          }

          .child-form {
            display: flex;
            gap: 12px;
            align-items: center;
          }
        }

        .empty-tip {
          text-align: center;
          color: #909399;
          padding: 20px;
          background: #fafafa;
          border-radius: 4px;
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

@media screen and (max-width: 1200px) {
  .bom-detail-container {
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
  .bom-detail-container {
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
