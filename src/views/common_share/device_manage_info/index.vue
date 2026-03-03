<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Download, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'
import { getDeviceList, getBrandList, getLocationList, addDevice, deleteDevice } from '@/api/device'

const router = useRouter()
const { isDesignerRole, isAdminRole, hasPermission } = usePermission()

const canManage = computed(() => isDesignerRole.value || isAdminRole.value)

const proTableRef = ref()
const dialogVisible = ref(false)
const formRef = ref()
const extendFields = ref([])

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

onMounted(() => {
  fetchBrandOptions()
  fetchLocationOptions()
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
  { prop: 'operation', label: '操作', width: 200, fixed: 'right' },
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
    unit: 'A',
    remark: '',
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

        const submitData = {
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
          expenditureQuantity: String(formData.stockQuantity),
          depreciationMethod: formData.depreciationMethod,
          extAttrs,
          location: locationItem ? { id: locationItem.id } : null,
        }

        await addDevice(submitData)
        ElMessage.success('新增成功')
        dialogVisible.value = false
        proTableRef.value?.getTableList()
      } catch (error) {
        console.error('新增设备失败:', error)
        ElMessage.error('新增失败')
      }
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
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
  const res = await getDeviceList(params)
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
    stockQuantity: item.expenditureQuantity || item.stockQuantity,
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
          <span class="dialog-title">新增设备</span>
        </div>
      </template>
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-section">
          <div class="section-title">
            <span class="title-text">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="设备编码">
              <el-input v-model="formData.deviceCode" />
            </el-form-item>
            <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="formData.deviceName" placeholder="请输入设备名称" />
            </el-form-item>
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="formData.manufacturer" placeholder="请输入生产厂家" />
            </el-form-item>
            <el-form-item label="品牌" prop="brand">
              <el-select v-model="formData.brand" placeholder="请选择品牌" style="width: 100%">
                <el-option
                  v-for="item in brandOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
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
                <span v-else class="field-label">{{ field.label }}</span>
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
              <el-input v-model="field.value" type="textarea" :rows="3" placeholder="请输入内容" />
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
