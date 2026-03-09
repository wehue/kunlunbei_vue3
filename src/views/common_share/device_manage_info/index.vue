<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Download, Delete, Edit } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'
import {
  getDeviceList,
  getBrandList,
  getLocationList,
  addDevice,
  updateDevice,
  deleteDevice,
} from '@/api/device'
import { getPartList } from '@/api/material'

const router = useRouter()
const { isDesignerRole, isAdminRole, hasPermission } = usePermission()

const canManage = computed(() => isDesignerRole.value || isAdminRole.value)

const proTableRef = ref()
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const extendFields = ref([])
const materialDialogVisible = ref(false)
const materialList = ref([])
const selectedMaterials = ref([])
const currentSparePartsField = ref(null)
const materialTableRef = ref()

const brandOptions = ref([])
const locationOptions = ref([])

const fetchBrandOptions = async () => {
  try {
    const res = await getBrandList()
    console.log('获取品牌列表成功', res)
    const data = res.data?.data?.data || []
    brandOptions.value = data.map((item) => ({
      label: item,
      value: item,
    }))
    return brandOptions.value
  } catch (error) {
    console.error('获取品牌列表失败:', error)
    return []
  }
}

const fetchLocationOptions = async () => {
  try {
    const res = await getLocationList()
    console.log('获取仓库位置列表成功', res)
    const data = res.data?.data?.data || []
    locationOptions.value = data.map((item) => ({
      label: item.warhouseName,
      value: item.warhouseName,
      id: item.id,
    }))
    return locationOptions.value
  } catch (error) {
    console.error('获取位置列表失败:', error)
    return []
  }
}

const fetchMaterialList = async () => {
  try {
    const res = await getPartList()
    console.log('获取物料列表成功', res)
    const data = res.data?.data?.data || []
    materialList.value = data.map((item) => ({
      id: item.id,
      partId: item.partId || item.id,
      partName: item.partName || item.name || item.materialName || '未命名物料',
      specificationModel: item.specificationModel || item.specModel || '无',
      category: item.category?.categoryName || item.categoryName || item.category || '未分类',
      stockQuantity: item.stockQuantity || item.quantity || 0,
    }))
  } catch (error) {
    console.error('获取物料列表失败:', error)
  }
}

onMounted(() => {
  fetchBrandOptions()
  fetchLocationOptions()
  fetchMaterialList()
})

const depreciationOptions = [
  { label: '直线折旧', value: 'SD' },
  { label: '加速折旧', value: 'AD' },
]

const unitOptions = [
  { label: '个', value: 'A' },
  { label: '米', value: 'M' },
  { label: '克', value: 'G' },
  { label: '千克', value: 'KG' },
]

const getBrandEnum = async () => {
  const res = await getBrandList()
  const data = res.data?.data?.data || []
  return {
    data: data.map((item) => ({
      label: item,
      value: item,
    })),
  }
}

const getLocationEnum = async () => {
  const res = await getLocationList()
  const data = res.data?.data?.data || []
  return {
    data: data.map((item) => ({
      label: item.warhouseName,
      value: item.warhouseName,
    })),
  }
}

const columns = [
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'deviceCode', label: '设备编码', search: { el: 'input', key: 'deviceCode' } },
  { prop: 'deviceName', label: '设备名称', search: { el: 'input', key: 'deviceName' } },
  {
    prop: 'brand',
    label: '品牌',
    search: { el: 'select', key: 'brand' },
    enum: getBrandEnum,
  },
  {
    prop: 'location',
    label: '位置',
    search: { el: 'select', key: 'location' },
    enum: getLocationEnum,
  },
  { prop: 'specModel', label: '规格型号' },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' },
]

const formData = reactive({
  deviceCode: '',
  deviceName: '',
  manufacturer: '',
  brand: '',
  specModel: '',
  supplier: '',
  productionDate: '',
  serviceLife: 10,
  depreciationMethod: 'SD',
  location: '',
  locationId: '',
  stockQuantity: 1,
  expenditureQuantity: 0,
  unit: 'A',
  remark: '',
})

const validateStockQuantity = (rule, value, callback) => {
  if (!value && value !== 0) {
    callback(new Error('请输入库存数量'))
    return
  }
  if (value < 0) {
    callback(new Error('库存数量不能为负数'))
  } else if (value > 999999) {
    callback(new Error('库存数量超出限制'))
  } else {
    callback()
  }
}

const validateServiceLife = (rule, value, callback) => {
  if (!value && value !== 0) {
    callback(new Error('请输入使用年限'))
    return
  }
  if (value <= 0) {
    callback(new Error('使用年限必须大于0'))
  } else if (value > 100) {
    callback(new Error('使用年限不能超过100年'))
  } else {
    callback()
  }
}

const rules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  specModel: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  productionDate: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
  serviceLife: [{ required: true, validator: validateServiceLife, trigger: 'blur' }],
  depreciationMethod: [{ required: true, message: '请选择折旧方式', trigger: 'change' }],
  location: [{ required: true, message: '请选择位置', trigger: 'change' }],
  stockQuantity: [{ required: true, validator: validateStockQuantity, trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
}

const initExtendFields = () => {
  extendFields.value = [
    { key: 'technicalParams', label: '技术参数信息', value: '', type: 'textarea' },
    { key: 'spareParts', label: '备品备件信息', value: '', type: 'textarea' },
  ]
}

const handleAddExtendField = () => {
  const newKey = `custom_${Date.now()}`
  extendFields.value.push({
    key: newKey,
    label: '自定义字段',
    value: '',
    type: 'textarea',
    isNew: true,
  })
}

const handleRemoveExtendField = (index) => {
  extendFields.value.splice(index, 1)
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    deviceCode: '',
    deviceName: '',
    manufacturer: '',
    brand: '',
    specModel: '',
    supplier: '',
    productionDate: '',
    serviceLife: 10,
    depreciationMethod: 'SD',
    location: '',
    locationId: '',
    stockQuantity: 1,
    expenditureQuantity: 0,
    unit: 'A',
    remark: '',
  })
  initExtendFields()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    deviceCode: row.deviceCode,
    deviceName: row.deviceName,
    manufacturer: row.manufacturer,
    brand: row.brand,
    specModel: row.specModel,
    supplier: row.supplier,
    productionDate: row.productionDate,
    serviceLife: row.serviceLife || 10,
    depreciationMethod: row.depreciationMethod || 'SD',
    location: row.location,
    locationId: row.locationId,
    stockQuantity: row.stockQuantity || 1,
    expenditureQuantity: row.expenditureQuantity || 0,
    unit: row.unit || 'A',
    remark: row.remark,
  })
  initExtendFields()
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const locationItem = locationOptions.value.find((item) => item.value === formData.location)

        const technicalParamsValue = extendFields.value.find(
          (f) => f.key === 'technicalParams',
        )?.value
        const sparePartsValue = extendFields.value.find((f) => f.key === 'spareParts')?.value

        console.log('备品备件值:', sparePartsValue)

        const extAttrs = [
          {
            name: 'TechnicalParameterInfo',
            type: 'STRING',
            value: technicalParamsValue ? technicalParamsValue : null,
          },
          {
            name: 'SparePartsInfo',
            type: 'STRING',
            value: sparePartsValue ? sparePartsValue : null,
          },
        ]

        console.log('extAttrs:', extAttrs)

        const submitData = {
          id: formData.id,
          equipmentId: formData.deviceCode,
          equipmentName: formData.deviceName,
          brand: formData.brand,
          unit: formData.unit,
          specificationModel: formData.specModel,
          serviceLife: String(formData.serviceLife),
          productionDate: formData.productionDate,
          manufacturer: formData.manufacturer,
          remark: formData.remark,
          supplier: formData.supplier,
          equipmentQuantity: String(formData.stockQuantity),
          expenditureQuantity: String(formData.expenditureQuantity),
          depreciationMethod: formData.depreciationMethod,
          extAttrs,
          location: locationItem ? { id: locationItem.id } : null,
        }

        console.log('提交数据:', submitData)

        if (isEdit.value) {
          await updateDevice(submitData)
          ElMessage.success('修改成功')
        } else {
          await addDevice(submitData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        proTableRef.value?.getTableList()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(isEdit.value ? '修改失败' : '新增失败')
      }
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleOpenMaterialDialog = (field) => {
  currentSparePartsField.value = field
  // 解析现有的备品备件数据
  try {
    if (field.value) {
      const existingParts = typeof field.value === 'string' ? JSON.parse(field.value) : field.value
      if (Array.isArray(existingParts)) {
        selectedMaterials.value = existingParts
      } else {
        selectedMaterials.value = []
      }
    } else {
      selectedMaterials.value = []
    }
  } catch (e) {
    console.error('解析备品备件数据失败:', e)
    selectedMaterials.value = []
  }
  console.log('初始化选中的物料:', selectedMaterials.value)
  materialDialogVisible.value = true
}

const handleSelectionChange = (selection) => {
  selectedMaterials.value = selection
  console.log('选中的物料:', selection)
}

const handleConfirmMaterialSelection = () => {
  if (currentSparePartsField.value && selectedMaterials.value.length > 0) {
    console.log('选中的物料行:', selectedMaterials.value)

    const sparePartsData = selectedMaterials.value.map((item) => ({
      id: item.id,
      partId: item.partId,
      materialCode: item.partId,
      materialName: item.partName,
      specModel: item.specificationModel,
      category: item.category,
      stockQuantity: item.stockQuantity,
    }))

    console.log('生成的备品备件数据:', sparePartsData)

    currentSparePartsField.value.value = JSON.stringify(sparePartsData, null, 2)
    ElMessage.success(`已选择 ${sparePartsData.length} 个物料作为备品备件`)
  }
  materialDialogVisible.value = false
  currentSparePartsField.value = null
}

const handleCancelMaterialSelection = () => {
  materialDialogVisible.value = false
  currentSparePartsField.value = null
}

const handleView = (row) => {
  router.push(`/device-manage/device-manage-detail/${row.deviceCode}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该设备吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteDevice(row.deviceCode || row.id)
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除设备失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const exportToExcel = (data, fileName = '设备列表') => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const handleExportSingle = (row) => {
  const exportData = [
    {
      设备编码: row.deviceCode,
      设备名称: row.deviceName,
      品牌: row.brand,
      位置: row.location,
      规格型号: row.specModel,
    },
  ]
  exportToExcel(exportData, `设备_${row.deviceCode}`)
  ElMessage.success('导出成功')
}

const handleExportBatch = (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要导出的设备')
    return
  }
  const exportData = selectedList.map((row) => ({
    设备编码: row.deviceCode,
    设备名称: row.deviceName,
    品牌: row.brand,
    位置: row.location,
    规格型号: row.specModel,
  }))
  exportToExcel(exportData, `设备列表_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const getTableList = async (params) => {
  try {
    // 构建查询参数，映射前端参数名到后端参数名
    const locationItem = locationOptions.value.find((item) => item.value === params?.location)
    const apiParams = {
      equipmentId: params?.deviceCode,
      equipmentName: params?.deviceName,
      brand: params?.brand,
      locationId: locationItem?.id,
    }

    const res = await getDeviceList(apiParams)
    const innerData = res.data.data
    console.log('获取设备列表信息成功', innerData)
    const rawList = Array.isArray(innerData?.data)
      ? innerData.data
      : (innerData?.list ?? innerData?.records ?? [])
    const total = innerData?.total ?? rawList.length
    const pageNum = params?.pageNum || 1
    const pageSize = params?.pageSize || 10
    const startIndex = (pageNum - 1) * pageSize
    const dataWithIndex = rawList.map((item, index) => ({
      ...item,
      id: item.id,
      deviceCode: item.equipmentId || item.deviceCode,
      deviceName: item.equipmentName || item.deviceName,
      brand: item.brand,
      location: item.location?.warhouseName || item.location || '',
      specModel: item.specificationModel || item.specModel,
      manufacturer: item.manufacturer,
      supplier: item.supplier,
      productionDate: item.productionDate,
      serviceLife: item.serviceLife,
      depreciationMethod: item.depreciationMethod,
      stockQuantity: item.equipmentQuantity || item.stockQuantity,
      expenditureQuantity: item.expenditureQuantity || 0,
      unit: item.unit,
      remark: item.remark,
      index: startIndex + index + 1,
    }))
    return {
      data: {
        list: dataWithIndex,
        total,
      },
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
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
  <div class="device-manage-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader="scope">
        <el-button v-if="canManage" type="primary" :icon="Plus" @click="handleAdd">
          新增设备
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

      <template #brand="scope">
        <el-tag>{{ scope.row.brand }}</el-tag>
      </template>

      <template #location="scope">
        <el-tag type="success">{{ scope.row.location }}</el-tag>
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
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="device-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-title">{{ isEdit ? '编辑设备' : '新增设备' }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-section">
          <div class="section-title">
            <span class="title-text">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="设备编码">
              <el-input v-model="formData.deviceCode" placeholder="请输入设备编码" />
            </el-form-item>
            <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="formData.deviceName" placeholder="请输入设备名称" />
            </el-form-item>
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="formData.manufacturer" placeholder="请输入生产厂家" />
            </el-form-item>
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="formData.brand" placeholder="请输入品牌" />
            </el-form-item>
            <el-form-item label="规格型号" prop="specModel">
              <el-input v-model="formData.specModel" placeholder="请输入规格型号" />
            </el-form-item>
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="formData.supplier" placeholder="请输入供应商" />
            </el-form-item>
            <el-form-item label="生产日期" prop="productionDate">
              <el-date-picker
                v-model="formData.productionDate"
                type="date"
                placeholder="请选择生产日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="使用年限" prop="serviceLife">
              <el-input-number
                v-model="formData.serviceLife"
                :min="1"
                :max="100"
                placeholder="请输入使用年限"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="折旧方式" prop="depreciationMethod">
              <el-select
                v-model="formData.depreciationMethod"
                placeholder="请选择折旧方式"
                style="width: 100%"
              >
                <el-option
                  v-for="item in depreciationOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
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
            <el-form-item label="库存数量" prop="stockQuantity">
              <el-input-number
                v-model="formData.stockQuantity"
                :min="0"
                placeholder="请输入库存数量"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="单位" prop="unit">
              <el-select v-model="formData.unit" placeholder="请选择单位" style="width: 100%">
                <el-option
                  v-for="item in unitOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="备注" class="full-width">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="请输入备注"
              />
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="title-text">扩展信息</span>
            <el-button type="primary" link :icon="Plus" @click="handleAddExtendField">
              添加字段
            </el-button>
          </div>
          <div class="extend-fields">
            <div v-for="(field, index) in extendFields" :key="field.key" class="extend-field-item">
              <div class="field-header">
                <el-input
                  v-if="field.isNew"
                  v-model="field.label"
                  class="field-label-input"
                  placeholder="请输入字段名称"
                />
                <div v-else class="field-label-with-actions">
                  <span class="field-label">{{ field.label }}</span>
                  <el-button
                    v-if="field.key === 'spareParts'"
                    type="primary"
                    link
                    size="small"
                    @click="handleOpenMaterialDialog(field)"
                  >
                    选择物料
                  </el-button>
                </div>
                <el-button
                  v-if="field.isNew"
                  type="danger"
                  link
                  :icon="Delete"
                  @click="handleRemoveExtendField(index)"
                >
                  删除
                </el-button>
              </div>
              <div v-if="field.key === 'spareParts' && field.value">
                <div class="spare-parts-preview">
                  <el-table
                    :data="JSON.parse(field.value)"
                    border
                    size="small"
                    style="margin-bottom: 10px"
                  >
                    <el-table-column prop="materialCode" label="物料编号" width="200" />
                    <el-table-column prop="materialName" label="物料名称" width="195" />
                    <el-table-column prop="specModel" label="规格型号" width="190" />
                    <el-table-column prop="stockQuantity" label="库存数量" width="190" />
                  </el-table>
                  <el-input
                    v-model="field.value"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入内容"
                    style="display: none"
                  />
                </div>
              </div>
              <el-input
                v-else
                v-model="field.value"
                type="textarea"
                :rows="3"
                placeholder="请输入内容"
              />
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

    <!-- 物料选择对话框 -->
    <el-dialog
      v-model="materialDialogVisible"
      title="选择物料作为备品备件"
      width="1000px"
      :close-on-click-modal="false"
      custom-class="material-dialog"
    >
      <div class="material-selection-container">
        <el-table
          ref="materialTableRef"
          :data="materialList"
          style="width: 100%"
          border
          stripe
          size="medium"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="60" />
          <el-table-column prop="partId" label="物料编号" width="150">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.partId || row.id }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="partName" label="物料名称" width="200">
            <template #default="{ row }">
              <span class="material-name">{{ row.partName || '未命名物料' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="specificationModel" label="规格型号" width="180">
            <template #default="{ row }">
              <span>{{ row.specificationModel || '无' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="130">
            <template #default="{ row }">
              <el-tag size="small" type="success">{{ row.category || '未分类' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="stockQuantity" label="库存数量" width="120">
            <template #default="{ row }">
              <span :class="{ 'low-stock': row.stockQuantity === 0 }">{{
                row.stockQuantity || 0
              }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelMaterialSelection">取消</el-button>
          <el-button type="primary" @click="handleConfirmMaterialSelection">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.device-manage-container {
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
}

.device-dialog {
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

        &.full-width {
          grid-column: span 3;
        }

        .el-form-item__label {
          font-size: 16px;
          color: #303133;
          font-weight: 400;
          padding-bottom: 6px;
        }

        .el-input__inner,
        .el-input__wrapper .el-input__inner {
          font-size: 16px;
        }

        .el-select {
          .el-input__wrapper .el-input__inner,
          .el-input__inner {
            font-size: 16px;
          }
        }
      }
    }

    .extend-fields {
      .extend-field-item {
        margin-bottom: 14px;
        padding: 14px;
        background: #fafafa;
        border-radius: 4px;

        &:last-child {
          margin-bottom: 0;
        }

        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .field-label {
            font-size: 16px;
            color: #303133;
            font-weight: 400;
          }

          .field-label-with-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .field-label-input {
            flex: 1;
            margin-right: 10px;

            :deep(.el-input__wrapper) {
              padding: 4px 11px;

              .el-input__inner {
                font-size: 16px;
                font-weight: 500;
              }
            }
          }
        }

        :deep(.el-textarea__inner) {
          font-size: 16px;
        }

        :deep(.el-textarea__wrapper) {
          .el-textarea__inner {
            font-size: 16px;
          }
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

  .material-dialog {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

    .el-dialog__header {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      padding: 20px 24px;
      border-bottom: none;

      .el-dialog__title {
        font-size: 20px;
        font-weight: 600;
        color: white;
      }

      .el-dialog__headerbtn .el-icon {
        color: white;
        font-size: 20px;

        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    .el-dialog__body {
      padding: 30px 24px;
      background-color: #fafafa;
    }

    .el-dialog__footer {
      padding: 20px 24px;
      border-top: 1px solid #ebeef5;
      background-color: white;

      .el-button {
        padding: 12px 24px;
        font-size: 16px;
        border-radius: 6px;
        font-weight: 500;

        &.el-button--primary {
          background-color: #409eff;
          border-color: #409eff;
          min-width: 100px;

          &:hover {
            background-color: #66b1ff;
            border-color: #66b1ff;
          }
        }

        &.el-button--default {
          min-width: 100px;

          &:hover {
            color: #409eff;
            border-color: #c6e2ff;
            background-color: #ecf5ff;
          }
        }
      }
    }
  }

  .material-selection-container {
    max-height: 500px;
    overflow-y: auto;
    padding: 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    :deep(.el-table) {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      border: none;

      .el-table__header-wrapper {
        background-color: #f5f7fa;

        th {
          background-color: #f5f7fa !important;
          font-weight: 600;
          color: #303133;
          font-size: 15px;
          padding: 16px 0;
          border-bottom: 2px solid #409eff;
          text-align: center;
        }
      }

      .el-table__body-wrapper {
        &::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        &::-webkit-scrollbar-thumb {
          background: #c0c4cc;
          border-radius: 5px;
        }

        &::-webkit-scrollbar-track {
          background: #f5f7fa;
        }

        tr {
          height: 60px;
          transition: all 0.3s ease;

          &:hover {
            background-color: #ecf5ff !important;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
          }

          td {
            font-size: 14px;
            color: #303133;
            border-bottom: 1px solid #ebeef5;
            padding: 16px 0;
            text-align: center;
          }
        }

        tr.el-table__row--striped {
          background-color: #fafafa;

          &:hover {
            background-color: #ecf5ff !important;
          }
        }
      }

      .el-table-column--selection {
        width: 60px;

        .cell {
          padding-left: 20px;
        }
      }

      .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #409eff;
        border-color: #409eff;
      }

      .el-checkbox__input.is-focus .el-checkbox__inner {
        border-color: #409eff;
      }
    }
  }

  .material-name {
    font-weight: 500;
    color: #303133;
  }

  .low-stock {
    color: #f56c6c;
    font-weight: 500;
  }
}

@media screen and (max-width: 900px) {
  .device-dialog {
    .form-section {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
