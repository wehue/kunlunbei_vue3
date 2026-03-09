<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Rank, Plus, Delete, Monitor, User, Box } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { useUserStore } from '@/stores/modules/user'
import { getProductFind } from '@/api/product'
import { getProcessList } from '@/api/process'
import { getDeviceDetailByEquipmentId } from '@/api/device'
import { getProductionStaffDetail } from '@/api/productionStaff'
import { getPartDetail } from '@/api/material'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const currentRole = computed(() => userStore.userInfo?.role || 'admin')

const productOptions = ref([])

const loadProducts = async () => {
  try {
    const res = await getProductFind()
    let products = res.data?.data?.data || res.data?.data || []
    if (!Array.isArray(products)) {
      products = []
    }
    productOptions.value = products.map((item) => ({
      label: item.productName,
      value: item.productName,
    }))
  } catch (error) {
    console.error('获取产品列表失败:', error)
    ElMessage.error('获取产品列表失败')
  }
}

const depreciationOptions = [
  { label: '直线折旧', value: 'SD' },
  { label: '快速折旧', value: 'AD' },
]

const unitOptions = [
  { label: '个', value: 'A' },
  { label: '米', value: 'M' },
  { label: '克', value: 'G' },
  { label: '千克', value: 'KG' },
]

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDepreciationLabel = (value) => {
  const option = depreciationOptions.find((item) => item.value === value)
  return option ? option.label : value || ''
}

const getUnitLabel = (value) => {
  const option = unitOptions.find((item) => item.value === value)
  return option ? option.label : value || ''
}

const existingProcesses = ref([])

const loadProcesses = async () => {
  try {
    const res = await getProcessList()
    let processes = res.data?.data?.data || res.data?.data || []
    if (!Array.isArray(processes)) {
      processes = []
    }

    existingProcesses.value = processes.map((item) => {
      let childMaterials = []
      if (item.theMaterials && Array.isArray(item.theMaterials)) {
        childMaterials = item.theMaterials.map((material) => ({
          id: material.id,
          materialId: material.materialId,
          materialName: material.materialName,
          quantity: material.expenditureQuantity,
          unit: material.unit,
        }))
      } else if (item.description) {
        try {
          childMaterials = JSON.parse(item.description).map((material) => ({
            id: material.id,
            materialId: material.materialId,
            materialName: material.materialName,
            quantity: material.expenditureQuantity,
            unit: material.unit,
          }))
        } catch (e) {
          console.error('解析物料数据失败:', e)
        }
      }

      const devices = (item.production_TestingEquipment || []).map((device) => ({
        deviceId: device.equipmentId,
        equipmentId: device.equipmentId,
        deviceName: device.equipmentName,
        quantity: device.expenditureQuantity,
        unit: device.unit,
      }))

      const operators = item.operator
        ? [
            {
              id: item.operator.id,
              productionStaffId: item.operator.productionStaffId,
              operatorId: item.operator.id,
              userName: item.operator.productionStaffName || item.operator.name,
              employeeName: item.operator.productionStaffName || item.operator.name,
            },
          ]
        : []

      return {
        id: item.id,
        processCode: item.workingProcedureId,
        processName: item.workingProcedureName,
        description: item.productionSteps,
        devices: devices,
        operators: operators,
        bom: {
          parentMaterial: null,
          childMaterials: childMaterials,
        },
      }
    })
  } catch (error) {
    console.error('获取工序列表失败:', error)
    ElMessage.error('获取工序列表失败')
  }
}

onMounted(() => {
  loadProducts()
  loadProcesses()
})

const formData = reactive({
  routeCode: '',
  routeName: '',
  product: '',
  description: '',
  version: 'V1.0',
  estimatedDuration: '',
  processSteps: [],
})

const selectedStepId = ref(null)
const activeDetailTab = ref('devices')
const processSelectDialogVisible = ref(false)

const selectedStep = computed(() => {
  return formData.processSteps.find((step) => step.id === selectedStepId.value) || null
})

const validateRouteName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入工艺名称'))
    return
  }
  if (value.length < 2 || value.length > 50) {
    callback(new Error('工艺名称长度应在2-50个字符之间'))
  } else {
    callback()
  }
}

const validateProduct = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请选择所属产品'))
    return
  }
  callback()
}

const rules = {
  routeName: [{ required: true, validator: validateRouteName, trigger: 'blur' }],
  product: [{ required: true, validator: validateProduct, trigger: 'change' }],
}

const canSubmitAudit = computed(() => currentRole.value === 'designer')

const generateRouteCode = () => {
  const year = new Date().getFullYear()
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `PR${year}${random}`
}

formData.routeCode = generateRouteCode()

const handleOpenProcessSelect = () => {
  processSelectDialogVisible.value = true
}

const handleSelectProcess = async (process) => {
  const exists = formData.processSteps.some((s) => s.processId === process.id)
  if (exists) {
    ElMessage.warning('该工序已添加')
    return
  }

  const newStep = {
    id: Date.now(),
    processId: process.id,
    processCode: process.processCode,
    stepName: process.processName,
    description: process.description,
    devices: JSON.parse(JSON.stringify(process.devices || [])),
    operators: JSON.parse(JSON.stringify(process.operators || [])),
    bom: JSON.parse(JSON.stringify(process.bom || { parentMaterial: null, childMaterials: [] })),
  }
  formData.processSteps.push(newStep)
  selectedStepId.value = newStep.id
  processSelectDialogVisible.value = false
  ElMessage.success(`已添加工序：${process.processName}`)

  await loadStepDetails(newStep)
}

const handleRemoveStep = (index) => {
  const step = formData.processSteps[index]
  if (selectedStepId.value === step.id) {
    selectedStepId.value = null
  }
  formData.processSteps.splice(index, 1)
}

const handleSelectStep = async (step) => {
  selectedStepId.value = step.id
  await loadStepDetails(step)
}

const loadStepDetails = async (step) => {
  const stepIndex = formData.processSteps.findIndex((s) => s.id === step.id)
  if (stepIndex === -1) return

  const stepData = formData.processSteps[stepIndex]

  if (stepData.devices && stepData.devices.length > 0) {
    const deviceDetails = await Promise.all(
      stepData.devices.map(async (device) => {
        const equipmentId = device.equipmentId || device.deviceId
        if (equipmentId) {
          try {
            const res = await getDeviceDetailByEquipmentId(equipmentId)
            const detail = res.data?.data?.data || res.data?.data || res.data
            if (detail) {
              const locationName = detail.location?.warhouseName || detail.location || ''
              return {
                ...device,
                deviceCode: detail.equipmentId || device.deviceCode,
                deviceName: detail.equipmentName || device.deviceName,
                manufacturer: detail.manufacturer || '',
                brand: detail.brand || '',
                specModel: detail.specificationModel || detail.specModel || '',
                supplier: detail.supplier || '',
                productionDate: detail.productionDate || '',
                serviceLife: detail.serviceLife || '',
                depreciationMethod: detail.depreciationMethod || '',
                location: locationName,
                stockQuantity:
                  detail.equipmentQuantity || detail.stockQuantity || detail.quantity || '',
                unit: detail.unit || '',
              }
            }
          } catch (error) {
            console.error('获取设备详情失败:', error)
          }
        }
        return device
      }),
    )
    formData.processSteps[stepIndex] = {
      ...stepData,
      devices: deviceDetails,
    }
  }

  if (stepData.operators && stepData.operators.length > 0) {
    const operatorDetails = await Promise.all(
      stepData.operators.map(async (operator) => {
        const productionStaffId = operator.productionStaffId
        if (productionStaffId) {
          try {
            const res = await getProductionStaffDetail(productionStaffId)
            const detail = res.data?.data || res.data
            if (detail) {
              const actualDetail = detail.data || detail
              return {
                ...operator,
                employeeCode: actualDetail.productionStaffId,
                employeeName: actualDetail.productionStaffName,
                deptName: actualDetail.department?.departmentName || '',
                position: actualDetail.position,
              }
            } else {
              return {
                ...operator,
                employeeCode:
                  operator.productionStaffId || operator.employeeCode || operator.userCode || '',
                employeeName: operator.employeeName || operator.userName || '',
                deptName: '',
                position: '',
              }
            }
          } catch (error) {
            console.error('获取操作人员详情失败:', error)
            return {
              ...operator,
              employeeCode:
                operator.productionStaffId || operator.employeeCode || operator.userCode || '',
              employeeName: operator.employeeName || operator.userName || '',
              deptName: '',
              position: '',
            }
          }
        } else {
          return {
            ...operator,
            employeeCode:
              operator.productionStaffId || operator.employeeCode || operator.userCode || '',
            employeeName: operator.employeeName || operator.userName || '',
            deptName: '',
            position: '',
          }
        }
      }),
    )
    formData.processSteps[stepIndex] = {
      ...formData.processSteps[stepIndex],
      operators: operatorDetails,
    }
  }

  if (stepData.bom && stepData.bom.childMaterials && stepData.bom.childMaterials.length > 0) {
    const materialDetails = await Promise.all(
      stepData.bom.childMaterials.map(async (material) => {
        const dbId = material.materialId || material.id
        if (dbId) {
          try {
            const res = await getPartDetail(dbId)
            const detail = res.data?.data?.data || res.data?.data || res.data
            if (detail) {
              const categoryName = detail.category?.categoryName || detail.categoryName || ''
              const locationName = detail.warhouse?.warhouseName || detail.location || ''
              return {
                ...material,
                materialCode: detail.partId || material.materialId || material.materialCode || '',
                materialName: detail.partName || material.materialName || '',
                specModel: detail.specificationModel || material.specModel || '',
                quantity: material.quantity || 0,
                unit: material.unit || '',
                stockQuantity: detail.stockQuantity || material.stockQuantity || '',
                supplier: detail.supplier || '',
                version: detail.versions || detail.version || '',
                category: categoryName || material.category || '',
                location: locationName,
              }
            } else {
              return {
                ...material,
                materialCode: material.materialId || material.materialCode || '',
                materialName: material.materialName || '',
                specModel: material.specModel || '',
                quantity: material.quantity || 0,
                unit: material.unit || '',
                stockQuantity: material.stockQuantity || '',
                supplier: '',
                version: '',
                category: '',
                location: '',
              }
            }
          } catch (error) {
            console.error('获取物料详情失败:', error)
            return {
              ...material,
              materialCode: material.materialId || material.materialCode || '',
              materialName: material.materialName || '',
              specModel: material.specModel || '',
              quantity: material.quantity || 0,
              unit: material.unit || '',
              stockQuantity: material.stockQuantity || '',
              supplier: '',
              version: '',
              category: '',
              location: '',
            }
          }
        } else {
          return {
            ...material,
            materialCode: material.materialId || material.materialCode || '',
            materialName: material.materialName || '',
            specModel: material.specModel || '',
            quantity: material.quantity || 0,
            unit: material.unit || '',
            stockQuantity: material.stockQuantity || '',
            supplier: '',
            version: '',
            category: '',
            location: '',
          }
        }
      }),
    )
    formData.processSteps[stepIndex] = {
      ...formData.processSteps[stepIndex],
      bom: {
        ...stepData.bom,
        childMaterials: materialDetails,
      },
    }
  }
}

const handleUpdateDevice = (deviceIndex, field, value) => {
  if (selectedStep.value && selectedStep.value.devices[deviceIndex]) {
    selectedStep.value.devices[deviceIndex][field] = value
  }
}

const handleUpdateOperator = (operatorIndex, field, value) => {
  if (selectedStep.value && selectedStep.value.operators[operatorIndex]) {
    selectedStep.value.operators[operatorIndex][field] = value
  }
}

const handleBack = () => {
  ElMessageBox.confirm('确定要返回吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      router.push('/process-route-manage/process-route-manage-info')
    })
    .catch(() => {})
}

const handleSave = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      if (formData.processSteps.length === 0) {
        ElMessage.warning('请至少添加一个工艺流程步骤')
        return
      }

      ElMessage.success('保存成功，请前往详情页提交审核')
      router.push('/process-route-manage/process-route-manage-info')
    }
  })
}

const handleSubmitAudit = () => {
  if (!canSubmitAudit.value) {
    ElMessage.warning('您没有提交审核的权限')
    return
  }

  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      if (formData.processSteps.length === 0) {
        ElMessage.warning('请至少添加一个工艺流程步骤')
        return
      }

      ElMessageBox.confirm('确定要提交审核吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      })
        .then(() => {
          ElMessage.success('提交审核成功，请等待审核')
          router.push('/process-route-manage/process-route-manage-info')
        })
        .catch(() => {})
    }
  })
}

const handleCancel = () => {
  handleBack()
}
</script>

<template>
  <div class="process-route-add-container">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">新增工艺路线</h2>
        </div>
      </div>
      <div class="header-right">
        <el-button v-if="canSubmitAudit" type="success" @click="handleSubmitAudit"
          >提交审核</el-button
        >
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </div>

    <div class="page-content">
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="section-card basic-info-card">
          <div class="section-header">
            <span class="section-title">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="工艺编号">
              <el-input v-model="formData.routeCode" placeholder="请输入工艺编号" />
            </el-form-item>
            <el-form-item label="工艺名称" prop="routeName">
              <el-input v-model="formData.routeName" placeholder="请输入工艺名称" />
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

            <el-form-item label="版本">
              <el-input v-model="formData.version" disabled placeholder="默认V1.0" />
            </el-form-item>
            <el-form-item label="预计工艺总时长">
              <el-input v-model="formData.estimatedDuration" placeholder="请输入预计工艺总时长">
                <template #append>分钟</template>
              </el-input>
            </el-form-item>
            <el-form-item label="工艺描述" style="grid-column: span 2">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="2"
                placeholder="请输入工艺描述"
              />
            </el-form-item>
          </div>
        </div>

        <div class="section-card process-config-card">
          <div class="section-header">
            <span class="section-title">工艺路线配置</span>
            <el-button type="primary" :icon="Plus" @click="handleOpenProcessSelect"
              >从工序管理选择</el-button
            >
          </div>
          <div class="process-layout">
            <div class="steps-panel">
              <div class="panel-header">工序列表（拖拽调整顺序）</div>
              <draggable
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
                    <div class="step-card-code">
                      <el-tag size="small" type="info">{{ element.processCode }}</el-tag>
                    </div>
                    <div class="step-card-summary">
                      <el-tag size="small" type="primary" v-if="element.devices?.length">
                        <el-icon><Monitor /></el-icon> {{ element.devices.length }}
                      </el-tag>
                      <el-tag size="small" type="success" v-if="element.operators?.length">
                        <el-icon><User /></el-icon> {{ element.operators.length }}
                      </el-tag>
                      <el-tag
                        size="small"
                        type="warning"
                        v-if="element.bom?.childMaterials?.length"
                      >
                        <el-icon><Box /></el-icon> {{ element.bom.childMaterials.length }}
                      </el-tag>
                    </div>
                  </div>
                </template>
              </draggable>
              <div v-if="formData.processSteps.length === 0" class="empty-steps">
                暂无工序，点击上方按钮从工序管理中选择
              </div>
            </div>

            <div class="detail-panel">
              <div class="panel-header">工序详情</div>
              <div v-if="selectedStep" class="step-detail-content">
                <div class="step-basic-info">
                  <div class="info-item">
                    <span class="label">工序编号：</span>
                    <el-tag>{{ selectedStep.processCode }}</el-tag>
                  </div>
                  <div class="info-item">
                    <span class="label">工序名称：</span>
                    <span class="value">{{ selectedStep.stepName }}</span>
                  </div>
                  <div class="info-item full-width">
                    <span class="label">工序描述：</span>
                    <span class="value">{{ selectedStep.description || '暂无描述' }}</span>
                  </div>
                </div>

                <div class="detail-tabs">
                  <div
                    class="tab-item"
                    :class="{ active: activeDetailTab === 'devices' }"
                    @click="activeDetailTab = 'devices'"
                  >
                    <el-icon><Monitor /></el-icon>
                    <span>设备使用情况</span>
                  </div>
                  <div
                    class="tab-item"
                    :class="{ active: activeDetailTab === 'operators' }"
                    @click="activeDetailTab = 'operators'"
                  >
                    <el-icon><User /></el-icon>
                    <span>操作人员</span>
                  </div>
                  <div
                    class="tab-item"
                    :class="{ active: activeDetailTab === 'bom' }"
                    @click="activeDetailTab = 'bom'"
                  >
                    <el-icon><Box /></el-icon>
                    <span>物料</span>
                  </div>
                </div>

                <div class="detail-content">
                  <div v-show="activeDetailTab === 'devices'" class="tab-content">
                    <div v-if="selectedStep.devices?.length" class="data-table-container">
                      <el-table :data="selectedStep.devices" border size="small">
                        <el-table-column prop="deviceCode" label="设备编码" width="120" />
                        <el-table-column prop="deviceName" label="设备名称" width="150" />
                        <el-table-column prop="manufacturer" label="生产厂家" width="180" />
                        <el-table-column prop="brand" label="品牌" width="100" />
                        <el-table-column prop="specModel" label="规格型号" width="120" />
                        <el-table-column prop="supplier" label="供应商" width="180" />
                        <el-table-column label="生产日期" width="120">
                          <template #default="{ row }">
                            {{ formatDate(row.productionDate) }}
                          </template>
                        </el-table-column>
                        <el-table-column prop="serviceLife" label="使用年限" width="100" />
                        <el-table-column label="折旧方式" width="100">
                          <template #default="{ row }">
                            {{ getDepreciationLabel(row.depreciationMethod) }}
                          </template>
                        </el-table-column>
                        <el-table-column prop="location" label="位置" width="100" />
                        <el-table-column prop="stockQuantity" label="库存数量" width="100" />
                        <el-table-column label="单位" width="80">
                          <template #default="{ row }">
                            {{ getUnitLabel(row.unit) }}
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                    <el-empty v-else description="该工序暂无关联设备" />
                  </div>

                  <div v-show="activeDetailTab === 'operators'" class="tab-content">
                    <div v-if="selectedStep.operators?.length" class="data-table-container">
                      <el-table :data="selectedStep.operators" border size="small">
                        <el-table-column prop="employeeCode" label="工号" width="150" />
                        <el-table-column prop="employeeName" label="姓名" width="120" />
                        <el-table-column prop="deptName" label="所属部门" width="150" />
                        <el-table-column prop="position" label="岗位" width="120" />
                      </el-table>
                    </div>
                    <el-empty v-else description="该工序暂无关联操作人员" />
                  </div>

                  <div v-show="activeDetailTab === 'bom'" class="tab-content">
                    <div v-if="selectedStep.bom?.childMaterials?.length" class="bom-section">
                      <div class="bom-section-title">物料清单</div>
                      <div class="data-table-container">
                        <el-table :data="selectedStep.bom.childMaterials" border size="small">
                          <el-table-column prop="materialCode" label="物料编号" width="120" />
                          <el-table-column prop="materialName" label="物料名称" width="150" />
                          <el-table-column prop="specModel" label="规格型号" width="120" />
                          <el-table-column prop="quantity" label="支出数量" width="100" />
                          <el-table-column label="单位" width="80">
                            <template #default="{ row }">
                              {{ getUnitLabel(row.unit) }}
                            </template>
                          </el-table-column>
                          <el-table-column prop="stockQuantity" label="库存数量" width="100" />
                          <el-table-column prop="supplier" label="供应商" width="150" />
                          <el-table-column prop="version" label="版本号" width="80" />
                          <el-table-column prop="category" label="分类" width="120" />
                          <el-table-column prop="location" label="位置" width="100" />
                        </el-table>
                      </div>
                    </div>

                    <el-empty
                      v-if="!selectedStep.bom?.childMaterials?.length"
                      description="该工序暂无关联物料"
                    />
                  </div>
                </div>
              </div>
              <div v-else class="empty-detail">
                <el-empty description="请在左侧选择一个工序" />
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <el-dialog
      v-model="processSelectDialogVisible"
      title="选择工序"
      width="900px"
      top="5vh"
      class="process-select-dialog"
    >
      <div class="process-list">
        <div
          v-for="process in existingProcesses"
          :key="process.id"
          class="process-card"
          @click="handleSelectProcess(process)"
        >
          <div class="process-header">
            <div class="process-code">{{ process.processCode }}</div>
            <div class="process-name">{{ process.processName }}</div>
          </div>
          <div class="process-desc">{{ process.description }}</div>
          <div class="process-info">
            <el-tag size="small" type="primary">
              <el-icon><Monitor /></el-icon> {{ process.devices?.length || 0 }} 设备
            </el-tag>
            <el-tag size="small" type="success">
              <el-icon><User /></el-icon> {{ process.operators?.length || 0 }} 人员
            </el-tag>
            <el-tag size="small" type="warning">
              <el-icon><Box /></el-icon> {{ process.bom?.childMaterials?.length || 0 }} 物料
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.process-route-add-container {
  padding: 2px;

  .page-header {
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
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .el-button {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  }

  .page-content {
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
        height: 650px;
        border-top: 1px solid #ebeef5;

        .steps-panel {
          width: 360px;
          min-width: 360px;
          max-width: 360px;
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
              width: 100%;
              min-width: 0;
              box-sizing: border-box;
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

              .step-card-code {
                padding: 0 14px;
                margin-bottom: 8px;
              }

              .step-card-summary {
                padding: 0 14px 12px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .el-tag {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
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
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: #fff;
          overflow: hidden;

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
            min-width: 0;
            overflow-x: auto;
            overflow-y: auto;
            padding: 20px;

            .step-basic-info {
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              padding: 16px;
              background: #f5f7fa;
              border-radius: 8px;
              margin-bottom: 20px;

              .info-item {
                display: flex;
                align-items: center;
                gap: 8px;

                &.full-width {
                  width: 100%;
                }

                .label {
                  color: #909399;
                  font-size: 14px;
                }

                .value {
                  color: #303133;
                  font-size: 14px;
                }
              }
            }

            .detail-tabs {
              display: flex;
              gap: 0;
              border-bottom: 1px solid #ebeef5;
              margin-bottom: 20px;

              .tab-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 24px;
                cursor: pointer;
                color: #606266;
                font-size: 14px;
                font-weight: 500;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;

                &:hover {
                  color: #409eff;
                }

                &.active {
                  color: #409eff;
                  border-bottom-color: #409eff;
                }
              }
            }

            .detail-content {
              width: 100%;
              min-width: 0;

              .tab-content {
                width: 100%;
                min-width: 0;

                .data-table-container {
                  width: 100%;
                  border: 1px solid #ebeef5;
                  border-radius: 4px;

                  :deep(.el-table) {
                    width: 100%;
                  }

                  :deep(.el-table__body-wrapper) {
                    overflow-x: auto;

                    &::-webkit-scrollbar {
                      height: 8px;
                    }

                    &::-webkit-scrollbar-thumb {
                      background: #c0c4cc;
                      border-radius: 4px;
                    }

                    &::-webkit-scrollbar-track {
                      background: #f5f7fa;
                    }
                  }

                  :deep(.el-input__inner) {
                    padding: 0 8px;
                  }
                }

                .bom-section {
                  margin-bottom: 24px;

                  .bom-section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #303133;
                    margin-bottom: 12px;
                    padding-left: 10px;
                    border-left: 3px solid #409eff;
                  }

                  .material-info-card {
                    background: #f5f7fa;
                    padding: 16px;
                    border-radius: 8px;

                    .info-row {
                      display: flex;
                      gap: 24px;
                      margin-bottom: 12px;

                      &:last-child {
                        margin-bottom: 0;
                      }

                      .info-col {
                        display: flex;
                        align-items: center;
                        gap: 8px;

                        .label {
                          color: #909399;
                          font-size: 13px;
                        }

                        .value {
                          color: #303133;
                          font-size: 13px;
                        }
                      }
                    }
                  }
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

  .process-select-dialog {
    .process-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      max-height: 60vh;
      overflow-y: auto;

      .process-card {
        border: 1px solid #ebeef5;
        border-radius: 8px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #409eff;
          box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
        }

        .process-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .process-code {
            font-size: 12px;
            color: #909399;
            background: #f5f7fa;
            padding: 2px 8px;
            border-radius: 4px;
          }

          .process-name {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }

        .process-desc {
          font-size: 13px;
          color: #606266;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .process-info {
          display: flex;
          gap: 8px;

          .el-tag {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .process-route-add-container {
    .page-content {
      .section-card {
        .form-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .process-route-add-container {
    .page-content {
      .section-card {
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
