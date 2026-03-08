<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, ArrowLeft, Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'
import { getDeviceList } from '@/api/device'
import { getProductionStaffList } from '@/api/productionStaff'
import { getPartList } from '@/api/material'
import { getProcessDetail, updateProcess } from '@/api/process'

const route = useRoute()
const router = useRouter()
const { isDesignerRole, isAdminRole } = usePermission()

const canManage = computed(() => isDesignerRole.value || isAdminRole.value)

const isEdit = ref(false)
const loading = ref(false)
const processData = ref({})
const formData = reactive({
  processCode: '',
  processName: '',
  productionStep: '',
  devices: [],
  operatorId: '',
  startTime: '',
  endTime: '',
  materials: [],
})
const formRef = ref()

const deviceOptions = ref([])
const operatorOptions = ref([])
const materialOptions = ref([])

// 单位选项枚举
const unitOptions = [
  { label: '个', value: 'A' },
  { label: '米', value: 'M' },
  { label: '克', value: 'G' },
  { label: '千克', value: 'KG' },
]

// 获取单位标签
const getUnitLabel = (value) => {
  const option = unitOptions.find((item) => item.value === value)
  return option ? option.label : value
}

// 计算可用的设备选项（过滤掉已选择的，保留当前编辑项）
const availableDeviceOptions = (selectedDeviceIds, currentDeviceId = null) => {
  return deviceOptions.value.filter((option) => {
    return option.value === currentDeviceId || !selectedDeviceIds.includes(option.value)
  })
}

// 计算可用的物料选项（过滤掉已选择的，保留当前编辑项）
const availableMaterialOptions = (selectedMaterialIds, currentMaterialId = null) => {
  return materialOptions.value.filter((option) => {
    return option.value === currentMaterialId || !selectedMaterialIds.includes(option.value)
  })
}

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const response = await getDeviceList()
    console.log('获取设备列表数据成功:', response)
    // 检查数据格式
    let deviceList = []
    if (response.data && Array.isArray(response.data)) {
      deviceList = response.data
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      deviceList = response.data.data
    } else if (
      response.data &&
      response.data.data &&
      response.data.data.data &&
      Array.isArray(response.data.data.data)
    ) {
      deviceList = response.data.data.data
    }

    if (deviceList.length > 0) {
      deviceOptions.value = deviceList.map((item) => ({
        label: item.equipmentName || item.name || item.deviceName || '',
        value: item.equipmentId || item.id || '',
        id: item.equipmentId || item.id || '',
        unit: item.unit || '',
      }))
    } else {
      console.error('获取设备列表失败: 数据格式错误', response.data)
      ElMessage.error('获取设备列表失败: 数据格式错误')
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
    ElMessage.error('获取设备列表失败')
  }
}

// 获取物料列表
const fetchMaterialList = async () => {
  try {
    const response = await getPartList()
    console.log('获取物料列表数据成功:', response)
    // 检查数据格式
    let materialList = []
    if (response.data && Array.isArray(response.data)) {
      materialList = response.data
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      materialList = response.data.data
    } else if (
      response.data &&
      response.data.data &&
      response.data.data.data &&
      Array.isArray(response.data.data.data)
    ) {
      materialList = response.data.data.data
    }

    if (materialList.length > 0) {
      materialOptions.value = materialList.map((item) => ({
        label: item.partName || item.name || item.materialName || '',
        value: item.id || '',
        id: item.id || '',
        unit: item.unit || '',
      }))
    } else {
      console.error('获取物料列表失败: 数据格式错误', response.data)
      ElMessage.error('获取物料列表失败: 数据格式错误')
    }
  } catch (error) {
    console.error('获取物料列表失败:', error)
    ElMessage.error('获取物料列表失败')
  }
}

// 获取操作人员列表
const fetchOperatorList = async () => {
  try {
    const response = await getProductionStaffList()
    console.log('获取操作人员列表数据成功:', response)
    // 检查数据格式
    let operatorList = []
    if (response.data && Array.isArray(response.data)) {
      operatorList = response.data
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      operatorList = response.data.data
    } else if (
      response.data &&
      response.data.data &&
      response.data.data.data &&
      Array.isArray(response.data.data.data)
    ) {
      operatorList = response.data.data.data
    }

    if (operatorList.length > 0) {
      operatorOptions.value = operatorList.map((item) => ({
        label: item.productionStaffName || '',
        value: item.id || '',
      }))
    } else {
      console.error('获取操作人员列表失败: 数据格式错误', response.data)
      ElMessage.error('获取操作人员列表失败: 数据格式错误')
    }
  } catch (error) {
    console.error('获取操作人员列表失败:', error)
    ElMessage.error('获取操作人员列表失败')
  }
}

const loadProcessData = async () => {
  loading.value = true
  try {
    const id = route.params.id
    console.log('请求工序详情，路由参数ID:', id)
    const response = await getProcessDetail({ workingProcedureId: id })
    console.log('API返回的完整响应:', response)

    let responseData = response.data
    console.log('response.data:', responseData)

    if (responseData && responseData.data) {
      responseData = responseData.data
      console.log('responseData.data:', responseData)
    }

    let data = responseData.data || responseData
    let parts = responseData.parts || []

    console.log('工序详情数据 data:', data)
    console.log('物料数据 parts:', parts)

    if (!data) {
      console.error('工序详情数据为空')
      ElMessage.error('获取工序详情失败：数据为空')
      loading.value = false
      return
    }

    // 处理操作人员名称
    let operatorName = ''
    if (data.operator) {
      operatorName = data.operator.productionStaffName || data.operator.name
      // 如果没有名称，根据ID查找
      if (!operatorName && data.operator.id) {
        const operatorOption = operatorOptions.value.find(
          (option) => option.value === data.operator.id,
        )
        if (operatorOption) {
          operatorName = operatorOption.label
        }
      }
    }

    processData.value = {
      id: data.id, // 使用数字类型的 id
      processCode: data.workingProcedureId,
      processName: data.workingProcedureName,
      productionStep: data.productionSteps,
      startTime: data.beginTime
        ? data.beginTime.split('T')[0] + ' ' + data.beginTime.split('T')[1].split('.')[0]
        : '',
      endTime: data.endTime
        ? data.endTime.split('T')[0] + ' ' + data.endTime.split('T')[1].split('.')[0]
        : '',
      operators: operatorName ? [operatorName] : [],
      devices: [],
      materials: [],
    }

    console.log('production_TestingEquipment:', data.production_TestingEquipment)
    const convertedDevices = (data.production_TestingEquipment || []).map((device, index) => ({
      id: index + 1,
      deviceId: device.equipmentId,
      deviceName: device.equipmentName,
      quantity: device.expenditureQuantity,
      unit: device.unit,
    }))

    console.log('description (物料):', data.description)
    let materialsArray = []
    if (data.description) {
      try {
        materialsArray = JSON.parse(data.description)
        console.log('解析后的物料数组:', materialsArray)
      } catch (e) {
        console.error('解析物料数据失败:', e)
        materialsArray = parts
      }
    } else if (parts && parts.length > 0) {
      materialsArray = parts
      console.log('使用parts作为物料数据:', materialsArray)
    }

    const convertedMaterials = materialsArray.map((material, index) => ({
      id: index + 1,
      materialId: material.materialId || material.id,
      materialName: material.materialName || material.partName,
      quantity: material.expenditureQuantity || material.quantity,
      unit: material.unit,
    }))

    processData.value.devices = convertedDevices
    processData.value.materials = convertedMaterials

    console.log('最终的processData:', processData.value)

    // 处理设备数据，确保有deviceName
    const processedDevices = convertedDevices.map((device) => {
      const deviceOption = deviceOptions.value.find((option) => option.value === device.deviceId)
      if (deviceOption && !device.deviceName) {
        device.deviceName = deviceOption.label
      }
      return device
    })

    // 处理物料数据，确保有materialName
    const processedMaterials = convertedMaterials.map((material) => {
      const materialOption = materialOptions.value.find(
        (option) => option.value === material.materialId,
      )
      if (materialOption && !material.materialName) {
        material.materialName = materialOption.label
      }
      return material
    })

    Object.assign(formData, {
      processCode: data.workingProcedureId,
      processName: data.workingProcedureName,
      productionStep: data.productionSteps,
      devices: processedDevices,
      operatorId: data.operator ? data.operator.id : '',
      startTime: data.beginTime
        ? data.beginTime.split('T')[0] + ' ' + data.beginTime.split('T')[1].split('.')[0]
        : '',
      endTime: data.endTime
        ? data.endTime.split('T')[0] + ' ' + data.endTime.split('T')[1].split('.')[0]
        : '',
      materials: processedMaterials,
    })

    // 处理processData中的设备和物料名称
    processData.value.devices = processedDevices
    processData.value.materials = processedMaterials

    loading.value = false
  } catch (error) {
    console.error('获取工序详情失败:', error)
    ElMessage.error('获取工序详情失败')
    loading.value = false
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
      // 重新加载工序详情，确保数据正确
      loadProcessData()
    })
    .catch(() => {})
}

// 转换时间格式为后端期望的格式
const formatTimeForBackend = (timeString) => {
  if (!timeString) return null
  const date = new Date(timeString)
  return date.toISOString()
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 转换时间格式
      const formattedStartTime = formatTimeForBackend(formData.startTime)
      const formattedEndTime = formatTimeForBackend(formData.endTime)

      // 准备提交数据
      const submitData = {
        id: processData.value.id,
        workingProcedureId: formData.processCode,
        workingProcedureName: formData.processName,
        productionSteps: formData.productionStep,
        operator: {
          id: formData.operatorId,
        },
        beginTime: formattedStartTime,
        endTime: formattedEndTime,
        production_TestingEquipment: formData.devices.map((device) => ({
          equipmentName: device.deviceName || '',
          equipmentId: device.deviceId,
          expenditureQuantity: device.quantity.toString(),
          unit: device.unit,
        })),
        theMaterials: formData.materials.map((material) => ({
          materialName: material.materialName || '',
          materialId: material.materialId,
          expenditureQuantity: material.quantity.toString(),
          unit: material.unit,
        })),
      }

      console.log('提交的数据:', submitData)

      try {
        // 调用更新工序API
        const response = await updateProcess(submitData)
        console.log('更新工序API响应:', response)
        if (response.status === 200) {
          // 处理操作人员名称
          let operatorName = ''
          if (formData.operatorId) {
            const operatorOption = operatorOptions.value.find(
              (option) => option.value === formData.operatorId,
            )
            if (operatorOption) {
              operatorName = operatorOption.label
            }
          }

          // 处理设备名称
          const processedDevices = formData.devices.map((device) => {
            const deviceOption = deviceOptions.value.find(
              (option) => option.value === device.deviceId,
            )
            if (deviceOption && !device.deviceName) {
              device.deviceName = deviceOption.label
            }
            return device
          })

          // 处理物料名称
          const processedMaterials = formData.materials.map((material) => {
            const materialOption = materialOptions.value.find(
              (option) => option.value === material.materialId,
            )
            if (materialOption && !material.materialName) {
              material.materialName = materialOption.label
            }
            return material
          })

          Object.assign(processData.value, {
            processCode: formData.processCode,
            processName: formData.processName,
            productionStep: formData.productionStep,
            devices: processedDevices,
            operators: operatorName ? [operatorName] : [],
            startTime: formData.startTime,
            endTime: formData.endTime,
            materials: processedMaterials,
          })

          ElMessage.success('保存成功')
          isEdit.value = false
        } else {
          ElMessage.error('保存失败: ' + (response.data?.message || '未知错误'))
        }
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败，请稍后重试')
      }
    }
  })
}

const handleBack = () => {
  router.push('/process-manage/process-manage-info')
}

const handleAddDevice = () => {
  formData.devices.push({
    id: Date.now(),
    deviceId: '',
    quantity: 1,
    unit: '',
  })
}

const handleRemoveDevice = (index) => {
  formData.devices.splice(index, 1)
}

const handleAddMaterial = () => {
  formData.materials.push({
    id: Date.now(),
    materialId: '',
    quantity: 1,
    unit: '',
  })
}

const handleRemoveMaterial = (index) => {
  formData.materials.splice(index, 1)
}

const handleExport = () => {
  const deviceStr =
    processData.value.devices?.map((d) => `${d.deviceName}(${d.quantity})`).join('、') || '无'
  const materialStr =
    processData.value.materials?.map((m) => `${m.materialName}(${m.specModel})`).join('、') || '无'
  const operatorStr = processData.value.operators?.join('、') || '无'

  const exportData = [
    {
      工序编号: processData.value.processCode,
      工序名称: processData.value.processName,
      生产步骤: processData.value.productionStep,
      生产和检测设备: deviceStr,
      操作人员: operatorStr,
      开始时间: processData.value.startTime || '未设置',
      结束时间: processData.value.endTime || '未设置',
      物料: materialStr,
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '工序详情')
  XLSX.writeFile(workbook, `工序_${processData.value.processCode}.xlsx`)
  ElMessage.success('导出成功')
}

const rules = {
  processName: [{ required: true, message: '请输入工序名称', trigger: 'blur' }],
  productionStep: [{ required: true, message: '请输入生产步骤', trigger: 'blur' }],
}

onMounted(async () => {
  // 先加载所有需要的列表数据
  await Promise.all([fetchDeviceList(), fetchOperatorList(), fetchMaterialList()])
  // 然后加载工序详情
  await loadProcessData()
})
</script>

<template>
  <div class="process-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ processData.processName }}</h2>
          <span class="page-subtitle">工序详情</span>
        </div>
      </div>
      <div class="header-right">
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
              <div class="info-label">工序编号</div>
              <div class="info-value">
                <el-tag size="default">{{ processData.processCode }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">工序名称</div>
              <div class="info-value">{{ processData.processName }}</div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">生产步骤</div>
              <div class="info-value">
                <pre class="content-pre">{{ processData.productionStep || '暂无' }}</pre>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="工序编号">
                <el-input v-model="formData.processCode" disabled placeholder="系统自动生成" />
              </el-form-item>
              <el-form-item label="工序名称" prop="processName">
                <el-input v-model="formData.processName" placeholder="请输入工序名称" />
              </el-form-item>
              <el-form-item label="生产步骤" prop="productionStep" class="full-width">
                <el-input
                  v-model="formData.productionStep"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入生产步骤描述"
                />
              </el-form-item>
            </div>
          </el-form>
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">生产和检测设备</span>
          <el-button v-if="isEdit" type="primary" link :icon="Plus" @click="handleAddDevice">
            添加设备
          </el-button>
        </div>

        <template v-if="!isEdit">
          <div class="table-container">
            <el-table :data="processData.devices" border style="width: 100%" class="process-table">
              <el-table-column prop="deviceName" label="设备名称" />
              <el-table-column prop="quantity" label="使用数量" width="580">
                <template #default="scope">
                  {{ scope.row.quantity }} {{ getUnitLabel(scope.row.unit) || '台/套' }}
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!processData.devices || processData.devices.length === 0" class="empty-data">
              暂无设备信息
            </div>
          </div>
        </template>

        <template v-else>
          <div class="dynamic-list">
            <div v-for="(device, index) in formData.devices" :key="device.id" class="dynamic-item">
              <span class="item-label">设备：</span>
              <el-select
                v-model="device.deviceId"
                placeholder="请选择设备"
                style="width: 180px"
                @change="
                  (value) => {
                    const selectedDevice = deviceOptions.find((item) => item.value === value)
                    if (selectedDevice) {
                      device.unit = selectedDevice.unit
                      device.deviceName = selectedDevice.label
                    }
                  }
                "
              >
                <el-option
                  v-for="item in availableDeviceOptions(
                    formData.devices.filter((d) => d.deviceId).map((d) => d.deviceId),
                    device.deviceId,
                  )"
                  :key="item.id"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <span class="item-label">使用数量：</span>
              <el-input-number v-model="device.quantity" :min="1" :max="100" style="width: 120px" />
              <span class="item-label">单位：</span>
              <el-input
                :value="getUnitLabel(device.unit)"
                placeholder="单位"
                style="width: 80px"
                disabled
              />
              <el-button type="danger" link :icon="Delete" @click="handleRemoveDevice(index)">
                删除
              </el-button>
            </div>
            <div v-if="formData.devices.length === 0" class="empty-tip">
              暂无设备，点击上方按钮添加
            </div>
          </div>
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">操作人员与时间</span>
        </div>

        <template v-if="!isEdit">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">操作人员</div>
              <div class="info-value">
                <template v-if="processData.operators && processData.operators.length > 0">
                  <el-tag v-for="op in processData.operators" :key="op" style="margin-right: 8px">
                    {{ op }}
                  </el-tag>
                </template>
                <span v-else>暂无</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">开始时间</div>
              <div class="info-value">{{ processData.startTime || '未设置' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">结束时间</div>
              <div class="info-value">{{ processData.endTime || '未设置' }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="选择操作人员">
                <el-select
                  v-model="formData.operatorId"
                  placeholder="请选择操作人员"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in operatorOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="开始时间">
                <el-date-picker
                  v-model="formData.startTime"
                  type="datetime"
                  placeholder="请选择开始时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker
                  v-model="formData.endTime"
                  type="datetime"
                  placeholder="请选择结束时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
          </el-form>
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">物料</span>
          <el-button v-if="isEdit" type="primary" link :icon="Plus" @click="handleAddMaterial">
            添加物料
          </el-button>
        </div>

        <template v-if="!isEdit">
          <div class="table-container">
            <el-table
              :data="processData.materials"
              border
              style="width: 100%"
              class="process-table"
            >
              <el-table-column prop="materialName" label="物料名称" />
              <el-table-column prop="quantity" label="使用数量" width="580">
                <template #default="scope">
                  {{ scope.row.quantity }} {{ getUnitLabel(scope.row.unit) || '件' }}
                </template>
              </el-table-column>
            </el-table>
            <div
              v-if="!processData.materials || processData.materials.length === 0"
              class="empty-data"
            >
              暂无物料信息
            </div>
          </div>
        </template>

        <template v-else>
          <div class="dynamic-list">
            <div
              v-for="(material, index) in formData.materials"
              :key="material.id"
              class="dynamic-item"
            >
              <span class="item-label">物料：</span>
              <el-select
                v-model="material.materialId"
                placeholder="请选择物料"
                style="width: 180px"
                @change="
                  (value) => {
                    const selectedMaterial = materialOptions.find((item) => item.value === value)
                    if (selectedMaterial) {
                      material.unit = selectedMaterial.unit
                      material.materialName = selectedMaterial.label
                    }
                  }
                "
              >
                <el-option
                  v-for="item in availableMaterialOptions(
                    formData.materials.filter((m) => m.materialId).map((m) => m.materialId),
                    material.materialId,
                  )"
                  :key="item.id"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <span class="item-label">使用数量：</span>
              <el-input-number
                v-model="material.quantity"
                :min="1"
                :max="1000"
                style="width: 120px"
              />
              <span class="item-label">单位：</span>
              <el-input
                :value="getUnitLabel(material.unit)"
                placeholder="单位"
                style="width: 80px"
                disabled
              />
              <el-button type="danger" link :icon="Delete" @click="handleRemoveMaterial(index)">
                删除
              </el-button>
            </div>
            <div v-if="formData.materials.length === 0" class="empty-tip">
              暂无物料，点击上方按钮添加
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.process-detail-container {
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

          &.full-width {
            grid-column: span 3;
          }

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

      .form-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px 32px;
        padding: 24px;

        :deep(.el-form-item) {
          margin-bottom: 0;

          &.full-width {
            grid-column: span 3;
          }

          .el-form-item__label {
            font-size: 18px;
            color: #606266;
            font-weight: 500;
            padding-bottom: 8px;
          }
        }
      }

      .table-container {
        padding: 20px;

        .empty-data {
          text-align: center;
          color: #909399;
          padding: 40px;
        }
      }

      .dynamic-list {
        padding: 16px;

        .dynamic-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          padding: 12px;
          background: #fafafa;
          border-radius: 4px;

          &:last-child {
            margin-bottom: 0;
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
    }
  }
}

@media screen and (max-width: 1200px) {
  .process-detail-container {
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

          :deep(.el-form-item.full-width) {
            grid-column: span 2;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .process-detail-container {
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

          :deep(.el-form-item.full-width) {
            grid-column: span 1;
          }
        }
      }
    }
  }
}

.process-table {
  :deep(.cell) {
    font-size: 16px;
  }

  :deep(th.el-table__cell .cell) {
    font-size: 18px;
    font-weight: 500;
  }
}
</style>
