<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Download, Delete, Edit } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'
import { getProcessList, createProcess, updateProcess, deleteProcess } from '@/api/process'
import { getDeviceList } from '@/api/device'
import { getProductionStaffList } from '@/api/productionStaff'
import { getPartList } from '@/api/material'

const { hasPermission, isDesignerRole, isAdminRole } = usePermission()

const canManage = computed(() => isDesignerRole.value || isAdminRole.value)
const router = useRouter()

const generateProcessCode = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  return `PROC-${year}${month}${day}${hour}${minute}${second}`
}

const proTableRef = ref()
const dialogVisible = ref(false)
const isEdit = ref(false)
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
        unit: item.unit || '', // 假设设备数据中有单位字段
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
        unit: item.unit || '', // 假设物料数据中有单位字段
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

// 页面加载时获取数据
onMounted(() => {
  fetchDeviceList()
  fetchOperatorList()
  fetchMaterialList()
})

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 80 },
  {
    prop: 'processCode',
    label: '工序编号',
    search: { el: 'input', key: 'processCode' },
    width: 160,
  },
  {
    prop: 'processName',
    label: '工序名称',
    search: { el: 'input', key: 'processName' },
    width: 160,
  },
  { prop: 'productionStep', label: '生产步骤', minWidth: 300 },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' },
])

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

const validateProcessName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入工序名称'))
    return
  }
  callback()
}

const validateProductionStep = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入生产步骤'))
    return
  }
  if (value.length > 500) {
    callback(new Error('生产步骤描述不能超过500字'))
  } else {
    callback()
  }
}

const rules = {
  processName: [{ required: true, validator: validateProcessName, trigger: 'blur' }],
  productionStep: [{ required: true, validator: validateProductionStep, trigger: 'blur' }],
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

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    processCode: '',
    processName: '',
    productionStep: '',
    devices: [],
    operatorId: '',
    startTime: '',
    endTime: '',
    materials: [],
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    processCode: row.processCode,
    processName: row.processName,
    productionStep: row.productionStep,
    devices: JSON.parse(JSON.stringify(row.devices || [])),
    operatorId: row.operatorId || '',
    startTime: row.startTime,
    endTime: row.endTime,
    materials: JSON.parse(JSON.stringify(row.materials || [])),
  })
  dialogVisible.value = true
}

// 转换时间格式为后端期望的格式
const formatTimeForBackend = (timeString) => {
  if (!timeString) return null
  const date = new Date(timeString)
  return date.toISOString()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 转换时间格式
      const formattedStartTime = formatTimeForBackend(formData.startTime)
      const formattedEndTime = formatTimeForBackend(formData.endTime)

      // 准备提交数据
      const submitData = {
        id: isEdit.value ? formData.id : Date.now().toString(),
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
        if (isEdit.value) {
          // 调用更新工序API
          const response = await updateProcess(submitData)
          console.log('更新工序API响应:', response)
          if (response.status === 200) {
            ElMessage.success('修改成功')
          } else {
            ElMessage.error('修改失败: ' + (response.data?.message || '未知错误'))
          }
        } else {
          // 调用创建工序API
          const response = await createProcess(submitData)
          console.log('创建工序API响应:', response)
          if (response.status === 200) {
            ElMessage.success('新增成功')
          } else {
            ElMessage.error('新增失败: ' + (response.data?.message || '未知错误'))
          }
        }
        dialogVisible.value = false
        proTableRef.value?.getTableList()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('提交失败，请稍后重试')
      }
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleView = (row) => {
  router.push(`/process-manage/process-manage-detail/${row.processCode}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该工序吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    // 调用删除工序API
    const response = await deleteProcess({ workingProcedureId: row.processCode })
    console.log('删除工序API响应:', response)
    if (response.status === 200) {
      ElMessage.success('删除成功')
      proTableRef.value?.getTableList()
    } else {
      ElMessage.error('删除失败: ' + (response.data?.message || '未知错误'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除工序失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const exportToExcel = (data, fileName = '工序列表') => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const handleExportSingle = (row) => {
  const exportData = [
    {
      工序编号: row.processCode,
      工序名称: row.processName,
      生产步骤: row.productionStep,
    },
  ]
  exportToExcel(exportData, `工序_${row.processCode}`)
  ElMessage.success('导出成功')
}

const handleExportBatch = (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要导出的工序')
    return
  }
  const exportData = selectedList.map((row) => ({
    工序编号: row.processCode,
    工序名称: row.processName,
    生产步骤: row.productionStep,
  }))
  exportToExcel(exportData, `工序列表_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const getTableList = async (params) => {
  try {
    const response = await getProcessList(params)
    console.log('获取工序列表信息成功', response)

    // 根据后端返回的数据结构获取工序列表数组
    const processList = response.data.data.data

    // 检查processList是否为数组
    if (!Array.isArray(processList)) {
      console.error('获取工序列表失败: 数据格式错误', processList)
      return {
        data: {
          list: [],
          total: 0,
        },
      }
    }

    // 转换数据格式，保留所有需要的字段
    const transformedData = processList.map((item, index) => {
      let materials = []
      if (item.description) {
        try {
          materials = JSON.parse(item.description).map((material, matIndex) => ({
            id: Date.now() + index + matIndex,
            materialId: material.materialId,
            materialName: material.materialName,
            quantity: material.expenditureQuantity,
            unit: material.unit,
          }))
        } catch (e) {
          console.error('解析物料数据失败:', e)
        }
      }

      return {
        id: item.id,
        processCode: item.workingProcedureId,
        processName: item.workingProcedureName,
        productionStep: item.productionSteps,
        operatorId: item.operator?.id,
        startTime: item.beginTime
          ? item.beginTime.split('T')[0] + ' ' + item.beginTime.split('T')[1].split('.')[0]
          : '',
        endTime: item.endTime
          ? item.endTime.split('T')[0] + ' ' + item.endTime.split('T')[1].split('.')[0]
          : '',
        devices:
          item.production_TestingEquipment?.map((device) => ({
            id: Date.now() + index,
            deviceId: device.equipmentId,
            deviceName: device.equipmentName,
            quantity: device.expenditureQuantity,
            unit: device.unit,
          })) || [],
        materials: materials,
        index: index + 1,
      }
    })

    return {
      data: {
        list: transformedData,
        total: transformedData.length,
      },
    }
  } catch (error) {
    console.error('获取工序列表失败:', error)
    ElMessage.error('获取工序列表失败')
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
  <div class="process-manage-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader="scope">
        <el-button v-if="canManage" type="primary" :icon="Plus" @click="handleAdd">
          新增工序
        </el-button>
        <el-button
          type="success"
          :icon="Download"
          :disabled="!scope.isSelected"
          @click="handleExportBatch(scope.selectedList)"
        >
          批量导出
        </el-button>
      </template>

      <template #productionStep="scope">
        <el-tooltip :content="scope.row.productionStep" placement="top" :show-after="500">
          <span class="step-text">{{ scope.row.productionStep }}</span>
        </el-tooltip>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button v-if="canManage" type="warning" link :icon="Edit" @click="handleEdit(scope.row)"
          >编辑</el-button
        >
        <el-button
          v-if="isAdminRole"
          type="danger"
          link
          :icon="Delete"
          @click="handleDelete(scope.row)"
          >删除</el-button
        >
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      width="1000px"
      :close-on-click-modal="false"
      destroy-on-close
      class="process-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-title">{{ isEdit ? '编辑工序' : '新增工序' }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-section">
          <div class="section-title">
            <span class="title-text">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="工序编号">
              <el-input v-model="formData.processCode" placeholder="请输入工序编号" />
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
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="title-text">生产和检测设备</span>
            <el-button type="primary" link :icon="Plus" @click="handleAddDevice">
              添加设备
            </el-button>
          </div>
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
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="title-text">操作人员与时间</span>
          </div>
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
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="title-text">物料</span>
            <el-button type="primary" link :icon="Plus" @click="handleAddMaterial">
              添加物料
            </el-button>
          </div>
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
.process-manage-container {
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
              flex-wrap: nowrap;
              gap: 8px;
              justify-content: center;
              align-items: center;

              .el-button {
                min-width: auto;
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

  .step-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.process-dialog {
  :deep(.el-dialog__header) {
    padding: 14px 21px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;
  }

  .dialog-header {
    .dialog-title {
      font-size: 22px;
      font-weight: bold;
      color: #303133;
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
    max-height: 65vh;
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 20px;
    border-top: 1px solid #ebeef5;
  }

  .form-section {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;

    &:last-of-type {
      border-bottom: none;
    }

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .title-text {
        font-size: 18px;
        font-weight: 600;
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
      gap: 16px 20px;

      :deep(.el-form-item) {
        margin-bottom: 0;

        &.full-width {
          grid-column: span 3;
        }

        .el-form-item__label {
          font-size: 15px;
          color: #303133;
          font-weight: 500;
          padding-bottom: 6px;
        }

        .el-input__inner,
        .el-input__wrapper .el-input__inner {
          font-size: 15px;
        }
      }
    }

    .dynamic-list {
      .dynamic-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        padding: 12px;
        background: #fafafa;
        border-radius: 4px;

        &:last-child {
          margin-bottom: 0;
        }

        .item-label {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
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

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      font-size: 15px;
      padding: 10px 20px;
    }
  }
}

@media screen and (max-width: 900px) {
  .process-dialog {
    .form-section {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);

        :deep(.el-form-item.full-width) {
          grid-column: span 2;
        }
      }
    }
  }
}
</style>
