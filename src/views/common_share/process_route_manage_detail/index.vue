<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  ArrowLeft,
  Download,
  Check,
  Close,
  Rank,
  Plus,
  Delete,
} from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import draggable from 'vuedraggable'
import { usePermission } from '@/hooks/usePermission'

const route = useRoute()
const router = useRouter()
const { isDesignerRole, isSupervisorRole } = usePermission()

const isEdit = ref(false)
const loading = ref(false)
const routeData = ref({})
const currentVersionId = ref(null)
const selectedStepId = ref(null)

const selectedStep = computed(() => {
  if (isEdit.value) {
    return formData.processSteps.find((step) => step.id === selectedStepId.value) || null
  }
  return routeData.value.processSteps?.find((step) => step.id === selectedStepId.value) || null
})

const auditDialogVisible = ref(false)
const auditForm = reactive({
  approved: true,
  reason: '',
})

const productOptions = [
  { label: '汽车零部件A', value: '汽车零部件A' },
  { label: '电子设备B', value: '电子设备B' },
  { label: '管道组件C', value: '管道组件C' },
  { label: '机械零件D', value: '机械零件D' },
]

const deviceOptions = [
  { label: '数控车床', value: '数控车床' },
  { label: '数控铣床', value: '数控铣床' },
  { label: '磨床', value: '磨床' },
  { label: '焊接设备', value: '焊接设备' },
  { label: '检测设备', value: '检测设备' },
  { label: '组装台', value: '组装台' },
]

const operatorOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
  { label: '孙七', value: '孙七' },
]

const bomOptions = [
  { label: '铝合金板', value: '铝合金板' },
  { label: '黄铜', value: '黄铜' },
  { label: '碳钢', value: '碳钢' },
  { label: 'ABS塑料', value: 'ABS塑料' },
  { label: '集成电路', value: '集成电路' },
]

const allRouteData = ref([
  {
    id: 1,
    routeCode: 'PR20240001',
    routeName: '汽车零部件加工工艺',
    product: '汽车零部件A',
    description: '用于汽车零部件的加工工艺路线',
    version: 'V1.0',
    isCurrent: false,
    status: 'approved',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        stepName: '车削加工',
        order: 1,
        devices: ['数控车床'],
        operators: ['张三'],
        bomItems: ['铝合金板'],
      },
      {
        id: 2,
        stepName: '铣削加工',
        order: 2,
        devices: ['数控铣床'],
        operators: ['李四'],
        bomItems: ['黄铜'],
      },
    ],
    operationTime: '2024-01-15 10:30:00',
    createTime: '2024-01-10 09:00:00',
    baseId: 'PR001',
  },
  {
    id: 2,
    routeCode: 'PR20240001',
    routeName: '汽车零部件加工工艺',
    product: '汽车零部件A',
    description: '用于汽车零部件的加工工艺路线（优化版）',
    version: 'V2.0',
    isCurrent: true,
    status: 'approved',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        stepName: '车削加工',
        order: 1,
        devices: ['数控车床'],
        operators: ['张三'],
        bomItems: ['铝合金板'],
      },
      {
        id: 2,
        stepName: '铣削加工',
        order: 2,
        devices: ['数控铣床'],
        operators: ['李四'],
        bomItems: ['黄铜'],
      },
      {
        id: 3,
        stepName: '质量检测',
        order: 3,
        devices: ['检测设备'],
        operators: ['王五'],
        bomItems: [],
      },
    ],
    operationTime: '2024-01-20 14:00:00',
    createTime: '2024-01-10 09:00:00',
    baseId: 'PR001',
  },
  {
    id: 3,
    routeCode: 'PR20240002',
    routeName: '电子设备组装工艺',
    product: '电子设备B',
    description: '电子设备的组装工艺路线',
    version: 'V1.0',
    isCurrent: true,
    status: 'pending',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        stepName: '组装工序',
        order: 1,
        devices: ['组装台'],
        operators: ['赵六'],
        bomItems: ['ABS塑料', '集成电路'],
      },
      {
        id: 2,
        stepName: '质量检测',
        order: 2,
        devices: ['检测设备'],
        operators: ['王五'],
        bomItems: [],
      },
    ],
    operationTime: '2024-01-18 11:00:00',
    createTime: '2024-01-18 11:00:00',
    baseId: 'PR002',
  },
  {
    id: 4,
    routeCode: 'PR20240003',
    routeName: '管道组件焊接工艺',
    product: '管道组件C',
    description: '管道组件的焊接工艺路线',
    version: 'V1.0',
    isCurrent: true,
    status: 'rejected',
    rejectReason: '工艺流程不完整，缺少质量检测环节',
    processSteps: [
      {
        id: 1,
        stepName: '焊接',
        order: 1,
        devices: ['焊接设备'],
        operators: ['孙七'],
        bomItems: ['碳钢'],
      },
    ],
    operationTime: '2024-01-22 16:30:00',
    createTime: '2024-01-22 16:30:00',
    baseId: 'PR003',
  },
  {
    id: 5,
    routeCode: 'PR20240004',
    routeName: '机械零件精加工工艺',
    product: '机械零件D',
    description: '机械零件的精加工工艺路线',
    version: 'V1.0',
    isCurrent: true,
    status: 'approved',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        stepName: '车削加工',
        order: 1,
        devices: ['数控车床'],
        operators: ['张三'],
        bomItems: ['黄铜'],
      },
      {
        id: 2,
        stepName: '磨削精加工',
        order: 2,
        devices: ['磨床'],
        operators: ['李四'],
        bomItems: [],
      },
      {
        id: 3,
        stepName: '质量检测',
        order: 3,
        devices: ['检测设备'],
        operators: ['王五'],
        bomItems: [],
      },
    ],
    operationTime: '2024-01-25 09:00:00',
    createTime: '2024-01-25 09:00:00',
    baseId: 'PR004',
  },
])

const formData = reactive({
  routeCode: '',
  routeName: '',
  product: '',
  description: '',
  version: '',
  processSteps: [],
})

const formRef = ref()

const routeVersions = computed(() => {
  if (!routeData.value.baseId) return []
  return allRouteData.value
    .filter((r) => r.baseId === routeData.value.baseId)
    .sort((a, b) => {
      const vA = parseFloat(a.version.replace('V', ''))
      const vB = parseFloat(b.version.replace('V', ''))
      return vB - vA
    })
})

const versionOptions = computed(() => {
  return routeVersions.value.map((r) => ({
    label: r.isCurrent ? `${r.version}（当前）` : r.version,
    value: r.id,
  }))
})

const canEdit = computed(() => {
  return isDesignerRole.value && routeData.value.status === 'rejected'
})

const canApprove = computed(() => {
  return isSupervisorRole.value && routeData.value.status === 'pending'
})

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  }
  return map[status] || status
}

const loadRouteData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = allRouteData.value.find((r) => r.id === parseInt(id)) || allRouteData.value[0]
    routeData.value = { ...data }
    currentVersionId.value = data.id
    Object.assign(formData, {
      routeCode: data.routeCode,
      routeName: data.routeName,
      product: data.product,
      description: data.description,
      version: data.version,
      processSteps: JSON.parse(JSON.stringify(data.processSteps || [])),
    })
    loading.value = false
  }, 300)
}

const handleVersionChange = (versionId) => {
  const data = allRouteData.value.find((r) => r.id === versionId)
  if (data) {
    routeData.value = { ...data }
    Object.assign(formData, {
      routeCode: data.routeCode,
      routeName: data.routeName,
      product: data.product,
      description: data.description,
      version: data.version,
      processSteps: JSON.parse(JSON.stringify(data.processSteps || [])),
    })
  }
}

const handleEdit = () => {
  if (!canEdit.value) {
    ElMessage.warning('您没有修改权限或该工艺路线不可修改')
    return
  }
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
        routeCode: routeData.value.routeCode,
        routeName: routeData.value.routeName,
        product: routeData.value.product,
        description: routeData.value.description,
        version: routeData.value.version,
        processSteps: JSON.parse(JSON.stringify(routeData.value.processSteps || [])),
      })
    })
    .catch(() => {})
}

const handleSave = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      const hasChanges =
        formData.routeName !== routeData.value.routeName ||
        formData.product !== routeData.value.product ||
        formData.description !== routeData.value.description ||
        JSON.stringify(formData.processSteps) !== JSON.stringify(routeData.value.processSteps)

      if (hasChanges) {
        const maxId = allRouteData.value.reduce((max, item) => {
          const id = parseInt(item.id)
          return id > max ? id : max
        }, 0)

        const currentMaxVersion = Math.max(
          ...routeVersions.value.map((r) => parseFloat(r.version.replace('V', ''))),
        )
        const newVersion = `V${(currentMaxVersion + 1).toFixed(1)}`

        allRouteData.value.forEach((r) => {
          if (r.baseId === routeData.value.baseId) {
            r.isCurrent = false
          }
        })

        const newRoute = {
          id: maxId + 1,
          routeCode: formData.routeCode,
          routeName: formData.routeName,
          product: formData.product,
          description: formData.description,
          version: newVersion,
          isCurrent: true,
          status: 'pending',
          rejectReason: '',
          processSteps: formData.processSteps.map((step, index) => ({
            ...step,
            order: index + 1,
          })),
          operationTime: new Date().toLocaleString(),
          createTime: routeData.value.createTime,
          baseId: routeData.value.baseId,
        }

        allRouteData.value.push(newRoute)
        routeData.value = { ...newRoute }
        currentVersionId.value = newRoute.id

        ElMessage.success(`保存成功，已生成新版本 ${newVersion}`)
      } else {
        ElMessage.success('保存成功')
      }

      isEdit.value = false
    }
  })
}

const handleAudit = () => {
  if (!canApprove.value) {
    ElMessage.warning('您没有审核权限')
    return
  }
  auditForm.approved = true
  auditForm.reason = ''
  auditDialogVisible.value = true
}

const handleAuditSubmit = () => {
  const route = allRouteData.value.find((r) => r.id === routeData.value.id)
  if (route) {
    route.status = auditForm.approved ? 'approved' : 'rejected'
    route.rejectReason = auditForm.approved ? '' : auditForm.reason
    routeData.value = { ...route }
  }
  ElMessage.success(auditForm.approved ? '审核通过' : '已驳回')
  auditDialogVisible.value = false
}

const handleBack = () => {
  router.push('/process-route-manage/process-route-manage-info')
}

const handleExport = () => {
  const stepsStr = routeData.value.processSteps?.map((s) => s.stepName).join(' → ') || '无'
  const exportData = [
    {
      工艺编号: routeData.value.routeCode,
      工艺路线名称: routeData.value.routeName,
      所属产品: routeData.value.product,
      工艺描述: routeData.value.description,
      版本: routeData.value.version,
      审核状态: getStatusLabel(routeData.value.status),
      驳回原因: routeData.value.rejectReason || '无',
      工艺流程: stepsStr,
      操作时间: routeData.value.operationTime,
      创建时间: routeData.value.createTime,
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '工艺路线详情')
  XLSX.writeFile(workbook, `工艺路线_${routeData.value.routeCode}_${routeData.value.version}.xlsx`)
  ElMessage.success('导出成功')
}

const handleAddStep = () => {
  const newStep = {
    id: Date.now(),
    stepName: '',
    devices: [],
    operators: [],
    bomItems: [],
  }
  formData.processSteps.push(newStep)
  selectedStepId.value = newStep.id
}

const handleRemoveStep = (index) => {
  const step = formData.processSteps[index]
  if (selectedStepId.value === step.id) {
    selectedStepId.value = null
  }
  formData.processSteps.splice(index, 1)
}

const handleSelectStep = (step) => {
  selectedStepId.value = step.id
}

const rules = {
  routeName: [{ required: true, message: '请输入工艺路线名称', trigger: 'blur' }],
  product: [{ required: true, message: '请选择所属产品', trigger: 'change' }],
}

onMounted(() => {
  loadRouteData()
})

watch(
  () => route.params.id,
  () => {
    loadRouteData()
  },
)
</script>

<template>
  <div class="process-route-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ routeData.routeName }}</h2>
          <span class="page-subtitle">工艺路线详情</span>
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
          <el-button v-if="canEdit" type="primary" :icon="Edit" @click="handleEdit">修改</el-button>
          <el-button v-if="canApprove" type="success" :icon="Check" @click="handleAudit"
            >审核</el-button
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
      <div class="section-card basic-info-card">
        <div class="section-header">
          <span class="section-title">基本信息</span>
        </div>

        <template v-if="!isEdit">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">工艺编号</div>
              <div class="info-value">
                <el-tag size="default">{{ routeData.routeCode }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">工艺路线名称</div>
              <div class="info-value">{{ routeData.routeName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">所属产品</div>
              <div class="info-value">{{ routeData.product }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">工艺描述</div>
              <div class="info-value">{{ routeData.description || '无' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">版本</div>
              <div class="info-value">
                <el-tag :type="routeData.isCurrent ? 'success' : 'info'" size="default">
                  {{ routeData.version }}
                  <span v-if="routeData.isCurrent">（当前）</span>
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">审核状态</div>
              <div class="info-value">
                <el-tag :type="getStatusType(routeData.status)" size="default">
                  {{ getStatusLabel(routeData.status) }}
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">创建时间</div>
              <div class="info-value">{{ routeData.createTime }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">操作时间</div>
              <div class="info-value">{{ routeData.operationTime }}</div>
            </div>
            <div v-if="routeData.status === 'rejected'" class="info-item full-width">
              <div class="info-label">驳回原因</div>
              <div class="info-value reject-reason">{{ routeData.rejectReason }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="工艺编号">
                <el-input v-model="formData.routeCode" disabled placeholder="系统自动生成" />
              </el-form-item>
              <el-form-item label="工艺路线名称" prop="routeName">
                <el-input v-model="formData.routeName" placeholder="请输入工艺路线名称" />
              </el-form-item>
              <el-form-item label="所属产品" prop="product">
                <el-select
                  v-model="formData.product"
                  placeholder="请选择所属产品"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in productOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="工艺描述" style="grid-column: span 2">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入工艺描述"
                />
              </el-form-item>
              <el-form-item label="版本">
                <el-input v-model="formData.version" disabled placeholder="修改后自动生成新版本" />
              </el-form-item>
            </div>
          </el-form>
        </template>
      </div>

      <div class="section-card process-config-card">
        <div class="section-header">
          <span class="section-title">工序配置</span>
          <el-button v-if="isEdit" type="primary" :icon="Plus" @click="handleAddStep"
            >添加工序</el-button
          >
        </div>
        <div class="process-layout">
          <div class="steps-panel">
            <div class="panel-header">工序列表（拖拽调整顺序）</div>
            <draggable
              v-if="isEdit"
              v-model="formData.processSteps"
              item-key="id"
              handle=".drag-handle"
              animation="300"
              class="steps-list"
            >
              <template #item="{ element, index }">
                <div
                  class="step-card"
                  :class="{ active: selectedStepId === element.id }"
                  @click="handleSelectStep(element)"
                >
                  <div class="step-card-header">
                    <div class="drag-handle">
                      <el-icon><Rank /></el-icon>
                    </div>
                    <span class="step-order">步骤 {{ index + 1 }}</span>
                    <el-button
                      type="danger"
                      link
                      :icon="Delete"
                      @click.stop="handleRemoveStep(index)"
                    />
                  </div>
                  <div class="step-card-name">
                    {{ element.stepName || '未命名工序' }}
                  </div>
                  <div class="step-card-summary">
                    <el-tag size="small" type="info" v-if="element.devices?.length">
                      设备: {{ element.devices.length }}
                    </el-tag>
                    <el-tag size="small" type="success" v-if="element.operators?.length">
                      人员: {{ element.operators.length }}
                    </el-tag>
                    <el-tag size="small" type="warning" v-if="element.bomItems?.length">
                      物料: {{ element.bomItems.length }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </draggable>

            <div v-else class="steps-list">
              <div
                v-for="(element, index) in routeData.processSteps"
                :key="element.id"
                class="step-card"
                :class="{ active: selectedStepId === element.id }"
                @click="handleSelectStep(element)"
              >
                <div class="step-card-header">
                  <span class="step-order">步骤 {{ index + 1 }}</span>
                </div>
                <div class="step-card-name">
                  {{ element.stepName || '未命名工序' }}
                </div>
                <div class="step-card-summary">
                  <el-tag size="small" type="info" v-if="element.devices?.length">
                    设备: {{ element.devices.length }}
                  </el-tag>
                  <el-tag size="small" type="success" v-if="element.operators?.length">
                    人员: {{ element.operators.length }}
                  </el-tag>
                  <el-tag size="small" type="warning" v-if="element.bomItems?.length">
                    物料: {{ element.bomItems.length }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div
              v-if="
                (isEdit && formData.processSteps.length === 0) ||
                (!isEdit && !routeData.processSteps?.length)
              "
              class="empty-steps"
            >
              暂无工序
            </div>
          </div>

          <div class="detail-panel">
            <div class="panel-header">工序详情</div>
            <template v-if="isEdit && selectedStep">
              <div class="step-detail-content">
                <el-form-item label="工序名称">
                  <el-input v-model="selectedStep.stepName" placeholder="请输入工序名称" />
                </el-form-item>

                <div class="detail-section">
                  <div class="detail-section-title">设备配置</div>
                  <el-select
                    v-model="selectedStep.devices"
                    multiple
                    placeholder="选择设备"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in deviceOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <div class="selected-items">
                    <el-tag
                      v-for="device in selectedStep.devices"
                      :key="device"
                      size="small"
                      closable
                      @close="
                        (e) => {
                          e.stopPropagation()
                          const idx = selectedStep.devices.indexOf(device)
                          if (idx > -1) selectedStep.devices.splice(idx, 1)
                        }
                      "
                    >
                      {{ device }}
                    </el-tag>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-section-title">操作人员</div>
                  <el-select
                    v-model="selectedStep.operators"
                    multiple
                    placeholder="选择操作人员"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in operatorOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <div class="selected-items">
                    <el-tag
                      v-for="operator in selectedStep.operators"
                      :key="operator"
                      type="success"
                      size="small"
                      closable
                      @close="
                        (e) => {
                          e.stopPropagation()
                          const idx = selectedStep.operators.indexOf(operator)
                          if (idx > -1) selectedStep.operators.splice(idx, 1)
                        }
                      "
                    >
                      {{ operator }}
                    </el-tag>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-section-title">物料BOM</div>
                  <el-select
                    v-model="selectedStep.bomItems"
                    multiple
                    placeholder="选择物料"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in bomOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <div class="selected-items">
                    <el-tag
                      v-for="bom in selectedStep.bomItems"
                      :key="bom"
                      type="warning"
                      size="small"
                      closable
                      @close="
                        (e) => {
                          e.stopPropagation()
                          const idx = selectedStep.bomItems.indexOf(bom)
                          if (idx > -1) selectedStep.bomItems.splice(idx, 1)
                        }
                      "
                    >
                      {{ bom }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="!isEdit && selectedStep">
              <div class="step-detail-content">
                <div class="view-section">
                  <div class="view-section-title">工序名称</div>
                  <div class="view-section-content">{{ selectedStep.stepName }}</div>
                </div>

                <div class="view-section">
                  <div class="view-section-title">设备配置</div>
                  <div class="view-section-content">
                    <el-tag
                      v-for="device in selectedStep.devices"
                      :key="device"
                      size="small"
                      class="view-tag"
                    >
                      {{ device }}
                    </el-tag>
                    <span v-if="!selectedStep.devices?.length" class="view-empty">无</span>
                  </div>
                </div>

                <div class="view-section">
                  <div class="view-section-title">操作人员</div>
                  <div class="view-section-content">
                    <el-tag
                      v-for="operator in selectedStep.operators"
                      :key="operator"
                      type="success"
                      size="small"
                      class="view-tag"
                    >
                      {{ operator }}
                    </el-tag>
                    <span v-if="!selectedStep.operators?.length" class="view-empty">无</span>
                  </div>
                </div>

                <div class="view-section">
                  <div class="view-section-title">物料BOM</div>
                  <div class="view-section-content">
                    <el-tag
                      v-for="bom in selectedStep.bomItems"
                      :key="bom"
                      type="warning"
                      size="small"
                      class="view-tag"
                    >
                      {{ bom }}
                    </el-tag>
                    <span v-if="!selectedStep.bomItems?.length" class="view-empty">无</span>
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="empty-detail">
              <el-empty description="请在左侧选择一个工序" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="auditDialogVisible" title="审核工艺路线" width="500px">
      <el-form label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.approved">
            <el-radio :value="true">通过</el-radio>
            <el-radio :value="false">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!auditForm.approved" label="驳回原因">
          <el-input
            v-model="auditForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAuditSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.process-route-detail-container {
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

          &.full-width {
            grid-column: span 3;
          }

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

            &.reject-reason {
              color: #f56c6c;
            }
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

      .process-layout {
        display: flex;
        height: 600px;
        border-top: 1px solid #ebeef5;

        .steps-panel {
          width: 320px;
          border-right: 1px solid #ebeef5;
          display: flex;
          flex-direction: column;

          .panel-header {
            padding: 16px 20px;
            background: #f5f7fa;
            font-size: 15px;
            font-weight: 600;
            color: #303133;
            border-bottom: 1px solid #ebeef5;
          }

          .steps-list {
            flex: 1;
            overflow-y: auto;
            padding: 12px;

            .step-card {
              border: 1px solid #ebeef5;
              border-radius: 6px;
              margin-bottom: 12px;
              background: #fafafa;
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                border-color: #409eff;
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
              }

              &.active {
                border-color: #409eff;
                background: #ecf5ff;
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
              }

              .step-card-header {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 14px;
                border-bottom: 1px solid #ebeef5;
                background: #f5f7fa;

                .step-card.active & {
                  background: #d9ecff;
                }

                .drag-handle {
                  cursor: move;
                  padding: 4px;
                  color: #909399;

                  &:hover {
                    color: #409eff;
                  }
                }

                .step-order {
                  font-size: 14px;
                  font-weight: 600;
                  color: #303133;
                  flex: 1;
                }
              }

              .step-card-name {
                padding: 12px 14px;
                font-size: 15px;
                color: #303133;
                font-weight: 500;
              }

              .step-card-summary {
                padding: 0 14px 12px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
              }
            }
          }

          .empty-steps {
            text-align: center;
            color: #909399;
            padding: 40px 20px;
            background: #fafafa;
            margin: 12px;
            border-radius: 6px;
            border: 1px dashed #ebeef5;
          }
        }

        .detail-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fff;

          .panel-header {
            padding: 16px 24px;
            background: #f5f7fa;
            font-size: 15px;
            font-weight: 600;
            color: #303133;
            border-bottom: 1px solid #ebeef5;
          }

          .step-detail-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;

            :deep(.el-form-item) {
              margin-bottom: 20px;

              .el-form-item__label {
                font-size: 15px;
                color: #606266;
                font-weight: 500;
              }
            }

            .detail-section {
              margin-bottom: 24px;

              .detail-section-title {
                font-size: 15px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 12px;
                padding-left: 10px;
                border-left: 3px solid #409eff;
              }

              .selected-items {
                margin-top: 12px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .el-tag {
                  margin: 0;
                }
              }
            }

            .view-section {
              margin-bottom: 28px;

              .view-section-title {
                font-size: 15px;
                font-weight: 600;
                color: #606266;
                margin-bottom: 12px;
                padding-left: 10px;
                border-left: 3px solid #909399;
              }

              .view-section-content {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .view-tag {
                  margin: 0;
                }

                .view-empty {
                  color: #909399;
                }
              }
            }
          }

          .empty-detail {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .process-route-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: repeat(2, 1fr);

          .info-item.full-width {
            grid-column: span 2;
          }
        }

        .form-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .process-route-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: 1fr;

          .info-item.full-width {
            grid-column: span 1;
          }
        }

        .form-grid {
          grid-template-columns: 1fr;
        }

        .process-layout {
          flex-direction: column;
          height: auto;

          .steps-panel {
            width: 100%;
            height: 300px;
            border-right: none;
            border-bottom: 1px solid #ebeef5;
          }
        }
      }
    }
  }
}
</style>
