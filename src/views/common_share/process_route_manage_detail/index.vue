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
  Monitor,
  User,
  Box,
} from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import draggable from 'vuedraggable'
import { usePermission } from '@/hooks/usePermission'
import { useUserStore } from '@/stores/modules/user'
import { getProductFind } from '@/api/product'
import {
  getProcessList,
  getProcessDetail,
  getProcessRouteDetail,
  updateProcessRoute,
} from '@/api/process'
import { getDeviceDetailByEquipmentId } from '@/api/device'
import { getProductionStaffDetail } from '@/api/productionStaff'
import { getPartDetail } from '@/api/material'

const route = useRoute()
const router = useRouter()
const { isDesignerRole, isSupervisorRole } = usePermission()
const userStore = useUserStore()

const isEdit = ref(false)
const loading = ref(false)
const routeData = ref({})
const currentVersionId = ref(null)
const selectedStepId = ref(null)
const activeDetailTab = ref('devices')

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

const productOptions = ref([])
const existingProcesses = ref([])

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
      id: item.id,
    }))
  } catch (error) {
    console.error('获取产品列表失败:', error)
    ElMessage.error('获取产品列表失败')
  }
}

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
  loadRouteData()
  loadProducts()
  loadProcesses()
})

const allRouteData = ref([])

const formData = reactive({
  routeCode: '',
  routeName: '',
  product: '',
  description: '',
  version: '',
  estimatedDuration: '',
  processSteps: [],
})

const formRef = ref()
const processSelectDialogVisible = ref(false)

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
  return (
    isDesignerRole.value &&
    (routeData.value.status === 'W' || // 待提交
      routeData.value.status === 'T' || // 已通过
      routeData.value.status === 'Y') // 已驳回
  )
})

const canApprove = computed(() => {
  return isSupervisorRole.value && routeData.value.status === 'F'
})

const getStatusType = (status) => {
  const map = {
    W: 'info',
    F: 'warning',
    T: 'success',
    Y: 'danger',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    W: '待提交',
    F: '审核中',
    T: '已通过',
    Y: '已驳回',
  }
  return map[status] || status
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const loadRouteData = async () => {
  loading.value = true
  try {
    const workingPlanId = route.params.id
    const res = await getProcessRouteDetail({ workingPlanId })
    console.log('获取工艺路线详情成功:', res)

    const detail = res.data?.data?.data || res.data?.data || res.data

    if (!detail) {
      ElMessage.error('获取工艺路线详情失败')
      loading.value = false
      return
    }

    // 解析description字段中的工序列表
    let processSteps = []
    if (detail.description) {
      try {
        const processes = JSON.parse(detail.description)
        console.log('解析出的工序列表:', processes)

        // 为每个工序生成唯一ID并构建processSteps数组
        processSteps = processes.map((process, index) => ({
          id: Date.now() + index,
          processId: process.workingProcedureId,
          processCode: process.workingProcedureId,
          stepName: process.workingProcedureName,
          description: '',
          devices: [],
          operators: [],
          bom: {
            parentMaterial: null,
            childMaterials: [],
          },
        }))
      } catch (e) {
        console.error('解析工序数据失败:', e)
      }
    }

    // 映射字段
    const mappedData = {
      id: detail.id,
      routeCode: detail.workingPlanId || '',
      routeName: detail.workingPlanName || '',
      product: detail.associatedProduct?.name || detail.associatedProduct?.productName || '',
      description: detail.workingPlanDescription || '',
      version: detail.version || '',
      estimatedDuration: detail.totalProcess || '',
      status: detail.status || '',
      rejectReason: detail.rejectionReason || '',
      submitTime: formatDateTime(detail.submitTime),
      createTime: formatDateTime(detail.createDate),
      operationTime: formatDateTime(detail.operateTime),
      processSteps: processSteps,
      isCurrent: true,
      baseId: detail.workingPlanId,
    }

    routeData.value = { ...mappedData }
    currentVersionId.value = detail.id

    Object.assign(formData, {
      routeCode: mappedData.routeCode,
      routeName: mappedData.routeName,
      product: mappedData.product,
      description: mappedData.description,
      version: mappedData.version,
      estimatedDuration: mappedData.estimatedDuration,
      processSteps: JSON.parse(JSON.stringify(mappedData.processSteps || [])),
    })

    // 如果有工序，自动加载所有工序的详情
    if (processSteps.length > 0) {
      selectedStepId.value = processSteps[0].id
      // 并行加载所有工序的详情，提高加载速度
      await Promise.all(processSteps.map((step) => loadStepDetails(step)))
    }
  } catch (error) {
    console.error('获取工艺路线详情失败:', error)
    ElMessage.error('获取工艺路线详情失败')
  } finally {
    loading.value = false
  }
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
      estimatedDuration: data.estimatedDuration || '',
      processSteps: JSON.parse(JSON.stringify(data.processSteps || [])),
    })
  }
}

const handleEdit = () => {
  if (!canEdit.value) {
    ElMessage.warning('您没有修改权限或该工艺路线不可修改')
    return
  }
  // 确保formData.processSteps包含完整的工序信息
  formData.processSteps = JSON.parse(JSON.stringify(routeData.value.processSteps || []))
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
        estimatedDuration: routeData.value.estimatedDuration || '',
        processSteps: JSON.parse(JSON.stringify(routeData.value.processSteps || [])),
      })
    })
    .catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return

  formRef.value.validate(async (valid) => {
    if (valid) {
      const hasChanges =
        formData.routeName !== routeData.value.routeName ||
        formData.product !== routeData.value.product ||
        formData.description !== routeData.value.description ||
        formData.estimatedDuration !== routeData.value.estimatedDuration ||
        JSON.stringify(formData.processSteps) !== JSON.stringify(routeData.value.processSteps)

      if (hasChanges) {
        try {
          const currentUserId = userStore.userInfo?.id || ''
          console.log('当前用户ID:', currentUserId)

          const selectedProduct = productOptions.value.find(
            (item) => item.value === formData.product,
          )
          const productId = selectedProduct?.id || ''
          console.log('选择的产品ID:', productId, '产品名称:', formData.product)

          const currentTime = new Date().toISOString()

          let newVersion = 'V1.0'
          if (routeData.value.version) {
            const currentVersion = parseFloat(routeData.value.version.replace('V', ''))
            newVersion = `V${(currentVersion + 1).toFixed(1)}`
          }
          console.log('当前版本:', routeData.value.version, '新版本:', newVersion)

          const requestData = {
            id: routeData.value.id || '',
            workingPlanId: formData.routeCode,
            workingPlanName: formData.routeName,
            workingPlanDescription: formData.description,
            version: newVersion,
            totalProcess: formData.estimatedDuration,
            applicant: {
              id: currentUserId,
            },
            associatedProduct: {
              id: productId,
            },
            workingProcedures: formData.processSteps.map((step) => ({
              workingProcedureName: step.stepName,
              workingProcedureId: step.processCode,
            })),
            operateTime: currentTime,
            status: 'W',
          }

          console.log('保存工艺路线请求参数:', requestData)

          const res = await updateProcessRoute(requestData)
          console.log('保存工艺路线响应:', res)

          if (res.data?.code === 200) {
            ElMessage.success('保存成功')
            setTimeout(() => {
              router.push('/process-route-manage/process-route-manage-info')
            }, 500)
          } else {
            ElMessage.error('保存失败')
          }
        } catch (error) {
          console.error('保存工艺路线失败:', error)
          ElMessage.error('保存失败')
        }
      } else {
        ElMessage.success('保存成功')
        router.push('/process-route-manage/process-route-manage-info')
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
  const routeItem = allRouteData.value.find((r) => r.id === routeData.value.id)
  if (routeItem) {
    routeItem.status = auditForm.approved ? 'T' : 'Y'
    routeItem.rejectReason = auditForm.approved ? '' : auditForm.reason
    routeData.value = { ...routeItem }
  }
  ElMessage.success(auditForm.approved ? '审核通过' : '已驳回')
  auditDialogVisible.value = false
  // 审核完成后跳转到列表页
  setTimeout(() => {
    router.push('/process-route-manage/process-route-manage-info')
  }, 500)
}

const handleBack = () => {
  router.push('/process-route-manage/process-route-manage-info')
}

const handleExport = () => {
  const stepsStr = routeData.value.processSteps?.map((s) => s.stepName).join(' → ') || '无'
  const exportData = [
    {
      工艺编号: routeData.value.routeCode,
      工艺名称: routeData.value.routeName,
      所属产品: routeData.value.product,
      工艺描述: routeData.value.description,
      版本: routeData.value.version,
      预计工艺总时长: routeData.value.estimatedDuration
        ? routeData.value.estimatedDuration + ' 分钟'
        : '暂无',
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
  console.log('开始选择工序:', step.id, step.stepName)
  selectedStepId.value = step.id
  console.log('设置selectedStepId为:', selectedStepId.value)
  await loadStepDetails(step)
  console.log('loadStepDetails执行完成')
  console.log('当前selectedStep:', selectedStep.value)
  console.log('当前selectedStep.operators:', selectedStep.value?.operators)
}

const loadStepDetails = async (step) => {
  console.log('开始加载工序详情:', step.id, step.stepName)
  console.log('当前isEdit.value:', isEdit.value)

  if (isEdit.value) {
    console.log('在编辑模式下')
    const stepIndex = formData.processSteps.findIndex((s) => s.id === step.id)
    console.log('在formData.processSteps中找到的索引:', stepIndex)
    if (stepIndex === -1) {
      console.log('在formData.processSteps中未找到工序')
      return
    }

    const stepData = formData.processSteps[stepIndex]
    console.log('找到的stepData:', stepData)

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
      console.log('开始处理操作人员数据:', stepData.operators)
      const operatorDetails = await Promise.all(
        stepData.operators.map(async (operator) => {
          const productionStaffId = operator.productionStaffId
          console.log('处理操作人员:', operator.id, 'productionStaffId:', productionStaffId)
          if (productionStaffId) {
            try {
              console.log('开始获取操作人员详情:', productionStaffId)
              const res = await getProductionStaffDetail(productionStaffId)
              console.log('获取到的操作人员详情响应:', res)
              const detail = res.data?.data || res.data
              console.log('获取到的操作人员详情数据:', detail)
              if (detail) {
                // 确保我们获取到正确的数据结构
                const actualDetail = detail.data || detail
                console.log('实际的操作人员详情数据:', actualDetail)
                const result = {
                  ...operator,
                  employeeCode: actualDetail.productionStaffId,
                  employeeName: actualDetail.productionStaffName,
                  deptName: actualDetail.department?.departmentName || '',
                  position: actualDetail.position,
                }
                console.log('处理后的操作人员数据:', result)
                return result
              } else {
                console.log('操作人员详情数据为空')
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
            console.log('操作人员无productionStaffId')
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
      console.log('处理完成的操作人员数据:', operatorDetails)
      formData.processSteps[stepIndex] = {
        ...formData.processSteps[stepIndex],
        operators: operatorDetails,
      }
      console.log('更新后的formData.processSteps[stepIndex]:', formData.processSteps[stepIndex])
    } else {
      console.log('没有操作人员数据')
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
  } else {
    console.log('在非编辑模式下')
    const stepIndex = routeData.value.processSteps?.findIndex((s) => s.id === step.id)
    if (stepIndex === -1 || !routeData.value.processSteps) {
      console.log('在routeData.value.processSteps中未找到工序')
      return
    }

    // 根据工序ID获取工序详情
    const processId = step.processId || step.processCode
    if (!processId) {
      console.log('工序没有processId')
      return
    }

    try {
      console.log('开始获取工序详情:', processId)
      const res = await getProcessDetail({ workingProcedureId: processId })
      console.log('获取到的工序详情:', res)

      const processDetail = res.data?.data?.data || res.data?.data || res.data
      console.log('工序详情数据:', processDetail)
      if (!processDetail) {
        console.log('未获取到工序详情')
        return
      }

      // 提取设备信息
      let devices = []
      if (
        processDetail.production_TestingEquipment &&
        Array.isArray(processDetail.production_TestingEquipment)
      ) {
        console.log('设备信息:', processDetail.production_TestingEquipment)
        devices = processDetail.production_TestingEquipment.map((device) => ({
          equipmentId: device.equipmentId,
          deviceCode: device.equipmentId,
          deviceName: device.equipmentName,
          quantity: device.expenditureQuantity,
          unit: device.unit,
        }))
      }

      // 提取操作人员信息
      let operators = []
      if (processDetail.operator) {
        console.log('操作人员信息:', processDetail.operator)
        operators = [
          {
            productionStaffId: processDetail.operator.productionStaffId,
            employeeCode: processDetail.operator.productionStaffId,
            employeeName: processDetail.operator.productionStaffName || processDetail.operator.name,
          },
        ]
      }

      // 提取物料信息
      let childMaterials = []
      console.log(
        '物料信息字段:',
        processDetail.theMaterials,
        processDetail.materials,
        processDetail.material,
        processDetail.description,
      )
      if (processDetail.theMaterials && Array.isArray(processDetail.theMaterials)) {
        console.log('theMaterials物料信息:', processDetail.theMaterials)
        childMaterials = processDetail.theMaterials.map((material) => ({
          materialId: material.materialId,
          materialCode: material.materialId,
          materialName: material.materialName,
          quantity: material.expenditureQuantity,
          unit: material.unit,
        }))
      } else if (processDetail.materials && Array.isArray(processDetail.materials)) {
        console.log('materials物料信息:', processDetail.materials)
        childMaterials = processDetail.materials.map((material) => ({
          materialId: material.materialId,
          materialCode: material.materialId,
          materialName: material.materialName,
          quantity: material.expenditureQuantity,
          unit: material.unit,
        }))
      } else if (processDetail.material) {
        console.log('material物料信息:', processDetail.material)
        childMaterials = [
          {
            materialId: processDetail.material.materialId,
            materialCode: processDetail.material.materialId,
            materialName: processDetail.material.materialName,
            quantity: processDetail.material.expenditureQuantity,
            unit: processDetail.material.unit,
          },
        ]
      } else if (processDetail.description) {
        console.log('description物料信息:', processDetail.description)
        try {
          const descriptionData = JSON.parse(processDetail.description)
          if (Array.isArray(descriptionData)) {
            childMaterials = descriptionData.map((material) => ({
              materialId: material.materialId,
              materialCode: material.materialId,
              materialName: material.materialName,
              quantity: material.quantity || 1,
              unit: material.unit || '',
            }))
          }
        } catch (error) {
          console.error('解析description字段失败:', error)
        }
      }
      console.log('提取的物料列表:', childMaterials)

      // 更新routeData中的工序信息
      routeData.value = {
        ...routeData.value,
        processSteps: routeData.value.processSteps.map((s, index) =>
          index === stepIndex
            ? {
                ...s,
                description: processDetail.productionSteps || processDetail.description || '',
                devices: devices,
                operators: operators,
                bom: {
                  parentMaterial: null,
                  childMaterials: childMaterials,
                },
              }
            : s,
        ),
      }

      // 获取设备详情
      if (devices.length > 0) {
        const deviceDetails = await Promise.all(
          devices.map(async (device) => {
            const equipmentId = device.equipmentId
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
        routeData.value = {
          ...routeData.value,
          processSteps: routeData.value.processSteps.map((s, index) =>
            index === stepIndex ? { ...s, devices: deviceDetails } : s,
          ),
        }
      }

      // 获取操作人员详情
      if (operators.length > 0) {
        const operatorDetails = await Promise.all(
          operators.map(async (operator) => {
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
                }
              } catch (error) {
                console.error('获取操作人员详情失败:', error)
              }
            }
            return operator
          }),
        )
        routeData.value = {
          ...routeData.value,
          processSteps: routeData.value.processSteps.map((s, index) =>
            index === stepIndex ? { ...s, operators: operatorDetails } : s,
          ),
        }
      }

      // 获取物料详情
      if (childMaterials.length > 0) {
        const materialDetails = await Promise.all(
          childMaterials.map(async (material) => {
            const dbId = material.materialId
            if (dbId) {
              try {
                const res = await getPartDetail(dbId)
                const detail = res.data?.data?.data || res.data?.data || res.data
                if (detail) {
                  const categoryName = detail.category?.categoryName || detail.categoryName || ''
                  const locationName = detail.warhouse?.warhouseName || detail.location || ''
                  return {
                    ...material,
                    materialCode:
                      detail.partId || material.materialId || material.materialCode || '',
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
                }
              } catch (error) {
                console.error('获取物料详情失败:', error)
              }
            }
            return material
          }),
        )
        routeData.value = {
          ...routeData.value,
          processSteps: routeData.value.processSteps.map((s, index) =>
            index === stepIndex
              ? {
                  ...s,
                  bom: {
                    ...s.bom,
                    childMaterials: materialDetails,
                  },
                }
              : s,
          ),
        }
      }

      console.log('工序详情加载完成:', routeData.value.processSteps[stepIndex])
    } catch (error) {
      console.error('获取工序详情失败:', error)
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

const rules = {
  routeName: [{ required: true, message: '请输入工艺名称', trigger: 'blur' }],
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
              <div class="info-label">工艺名称</div>
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
              <div class="info-label">工艺总时长</div>
              <div class="info-value">
                {{ routeData.estimatedDuration ? routeData.estimatedDuration + ' 分钟' : '暂无' }}
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
            <div v-if="routeData.status === 'Y'" class="info-item full-width">
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
                <el-input v-model="formData.version" disabled placeholder="修改后自动生成新版本" />
              </el-form-item>
              <el-form-item label="预计工艺总时长">
                <el-input
                  v-model="formData.estimatedDuration"
                  placeholder="请输入预计工艺总时长（分钟）"
                >
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
          </el-form>
        </template>
      </div>

      <div class="section-card process-config-card">
        <div class="section-header">
          <span class="section-title">工艺路线配置</span>
          <el-button v-if="isEdit" type="primary" :icon="Plus" @click="handleOpenProcessSelect"
            >从工序管理选择</el-button
          >
        </div>
        <div class="process-layout">
          <div class="steps-panel">
            <div class="panel-header">工序列表{{ isEdit ? '（拖拽调整顺序）' : '' }}</div>
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
                    <el-tag size="small" type="warning" v-if="element.bom?.childMaterials?.length">
                      <el-icon><Box /></el-icon> {{ element.bom.childMaterials.length }}
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
                  <el-tag size="small" type="warning" v-if="element.bom?.childMaterials?.length">
                    <el-icon><Box /></el-icon> {{ element.bom.childMaterials.length }}
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
                      <el-table-column prop="deviceCode" label="设备编码" width="155" />
                      <el-table-column prop="deviceName" label="设备名称" width="155" />
                      <el-table-column prop="manufacturer" label="生产厂家" width="150" />
                      <el-table-column prop="brand" label="品牌" width="100" />
                      <el-table-column prop="specModel" label="规格型号" width="180" />
                      <el-table-column prop="supplier" label="供应商" width="160" />
                      <el-table-column label="生产日期" width="140">
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
                    <!-- <div class="bom-section-title">物料清单</div> -->
                    <div class="data-table-container">
                      <el-table :data="selectedStep.bom.childMaterials" border size="small">
                        <el-table-column prop="materialCode" label="物料编号" width="120" />
                        <el-table-column prop="materialName" label="物料名称" width="150" />
                        <el-table-column prop="specModel" label="规格型号" width="120" />
                        <el-table-column prop="quantity" label="支出数量" width="100" />
                        <el-table-column prop="stockQuantity" label="库存数量" width="100" />
                        <el-table-column label="单位" width="80">
                          <template #default="{ row }">
                            {{ getUnitLabel(row.unit) }}
                          </template>
                        </el-table-column>
                        <el-table-column prop="supplier" label="供应商" width="120" />
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
              border: 1px solid #ebeef5;
              border-radius: 6px;
              margin-bottom: 12px;
              background: #fafafa;
              cursor: pointer;
              transition: all 0.2s;
              width: 100%;
              min-width: 0;
              box-sizing: border-box;
              overflow: hidden;

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
                min-width: 0;

                .step-card.active & {
                  background: #d9ecff;
                }

                .drag-handle {
                  cursor: move;
                  padding: 4px;
                  color: #909399;
                  flex-shrink: 0;

                  &:hover {
                    color: #409eff;
                  }
                }

                .step-order {
                  font-size: 14px;
                  font-weight: 600;
                  color: #303133;
                  flex: 1;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  min-width: 0;
                }
              }

              .step-card-name {
                padding: 12px 14px;
                font-size: 15px;
                color: #303133;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
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
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                  flex-shrink: 0;
                  max-width: 100%;
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
                  width: 100% !important;
                  border: 1px solid #ebeef5;
                  border-radius: 4px;
                  box-sizing: border-box;

                  :deep(.el-table) {
                    width: 100% !important;
                  }

                  :deep(.el-table__body-wrapper) {
                    overflow-x: auto !important;

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

@media screen and (max-width: 1200px) {
  .process-route-detail-container {
    .detail-content {
      .section-card {
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
