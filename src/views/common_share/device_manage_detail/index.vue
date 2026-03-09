<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, ArrowLeft, Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'
import {
  getDeviceDetailByEquipmentId,
  updateDevice,
  getBrandList,
  getLocationList,
} from '@/api/device'
import { getPartDetail } from '@/api/material'

const route = useRoute()
const router = useRouter()
const { isDesignerRole, isAdminRole } = usePermission()

const canManage = computed(() => isDesignerRole.value || isAdminRole.value)

const isEdit = ref(false)
const loading = ref(false)
const deviceData = ref({})
const formData = reactive({})
const extendFields = ref([])
const formRef = ref()
const sparePartsDetails = ref([])
const hasSpareParts = ref(false)

const brandOptions = ref([])

const locationOptions = ref([])

const fetchBrandOptions = async () => {
  try {
    const res = await getBrandList()
    const data = res.data?.data?.data || []
    brandOptions.value = data.map((item) => ({
      label: item,
      value: item,
    }))
  } catch (error) {
    console.error('获取品牌列表失败:', error)
  }
}

const fetchLocationOptions = async () => {
  try {
    const res = await getLocationList()
    const data = res.data?.data?.data || []
    locationOptions.value = data.map((item) => ({
      label: item.warhouseName,
      value: item.warhouseName,
      id: item.id,
    }))
  } catch (error) {
    console.error('获取位置列表失败:', error)
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
  return option ? option.label : value
}

const getUnitLabel = (value) => {
  const option = unitOptions.find((item) => item.value === value)
  return option ? option.label : value
}

const loadSparePartsDetails = async (sparePartsData) => {
  try {
    console.log('开始加载备品备件详情:', sparePartsData)

    // 重置状态
    sparePartsDetails.value = []
    hasSpareParts.value = false

    if (!sparePartsData) {
      console.log('无备品备件数据')
      return
    }

    let parsedData
    if (typeof sparePartsData === 'string') {
      try {
        parsedData = JSON.parse(sparePartsData)
        console.log('解析后的数据:', parsedData)
      } catch (e) {
        console.error('解析备品备件数据失败:', e)
        return
      }
    } else {
      parsedData = sparePartsData
      console.log('直接使用数据:', parsedData)
    }

    // 处理各种数据格式
    let sparePartsArray = []
    if (Array.isArray(parsedData)) {
      sparePartsArray = parsedData
    } else if (parsedData && typeof parsedData === 'object') {
      // 如果是单个对象，包装成数组
      sparePartsArray = [parsedData]
    }

    console.log('处理后的备品备件数组:', sparePartsArray)

    if (!Array.isArray(sparePartsArray) || sparePartsArray.length === 0) {
      console.log('备品备件数组为空或无效')
      return
    }

    // 不调用API获取详情，直接使用原始数据
    // 这样可以避免API调用失败导致的显示问题
    const details = sparePartsArray.map((part) => {
      // 检查是否有完整的物料信息
      if (part.materialName && part.materialName !== '未知物料') {
        return {
          ...part,
          materialCode: part.partId || part.materialCode || part.id,
          materialName: part.partName || part.materialName,
          specModel: part.specificationModel || part.specModel || '',
          stockQuantity: part.stockQuantity || '',
          supplier: part.supplier || '',
          version: part.versions || part.version || '',
          category: part.category?.categoryName || part.categoryName || part.category || '',
          location: part.warhouse?.warhouseName || part.location || '',
        }
      }

      // 如果没有完整信息，尝试通过API获取
      const partId = part.id || part.partId
      if (partId) {
        // 不等待API响应，先显示基本信息
        getPartDetail(partId)
          .then((res) => {
            console.log('物料详情API返回:', res)
            const detail = res.data?.data?.data || res.data?.data || res.data
            if (detail) {
              const categoryName = detail.category?.categoryName || detail.categoryName || ''
              const locationName = detail.warhouse?.warhouseName || detail.location || ''

              // 更新对应位置的数据
              const index = sparePartsDetails.value.findIndex(
                (p) => p.id === partId || p.partId === partId,
              )
              if (index !== -1) {
                sparePartsDetails.value[index] = {
                  ...sparePartsDetails.value[index],
                  materialCode: detail.partId || part.materialCode || partId,
                  materialName: detail.partName || '未知物料',
                  specModel: detail.specificationModel || '',
                  stockQuantity: detail.stockQuantity || '',
                  supplier: detail.supplier || '',
                  version: detail.versions || detail.version || '',
                  category: categoryName || '',
                  location: locationName || '',
                }
              }
            }
          })
          .catch((error) => {
            console.error('获取物料详情失败:', error)
          })
      }

      // 返回基本信息
      return {
        ...part,
        materialCode: part.partId || part.materialCode || part.id || '未知',
        materialName: part.partName || part.materialName || '未知物料',
        specModel: part.specificationModel || part.specModel || '',
        stockQuantity: part.stockQuantity || '',
        supplier: part.supplier || '',
        version: part.versions || part.version || '',
        category: part.category?.categoryName || part.categoryName || part.category || '',
        location: part.warhouse?.warhouseName || part.location || '',
      }
    })

    // 使用普通数组而不是 Proxy
    sparePartsDetails.value = [...details]
    hasSpareParts.value = sparePartsDetails.value.length > 0

    console.log('处理后的备品备件详情:', sparePartsDetails.value)
    console.log('hasSpareParts:', hasSpareParts.value)
  } catch (error) {
    console.error('加载备品备件详情失败:', error)
    sparePartsDetails.value = []
    hasSpareParts.value = false
  }
}

const loadDeviceData = async () => {
  loading.value = true
  try {
    const equipmentId = route.params.id
    const res = await getDeviceDetailByEquipmentId(equipmentId)
    console.log('获取设备详情成功', res)

    const data = res.data?.data.data || {}
    const extAttrs = data.extAttrs || []
    console.log('extAttrs数据:', extAttrs)

    const getExtAttrValue = (name) => {
      const attr = extAttrs.find((item) => item.name === name)
      console.log(`查找属性 ${name}:`, attr)
      if (!attr) return ''
      if (attr.value) {
        return typeof attr.value === 'string' ? attr.value : JSON.stringify(attr.value)
      }
      return ''
    }

    const mappedData = {
      id: data.id,
      deviceCode: data.equipmentId || '',
      deviceName: data.equipmentName || '',
      manufacturer: data.manufacturer || '',
      brand: data.brand || '',
      specModel: data.specificationModel || '',
      supplier: data.supplier || '',
      productionDate: formatDate(data.productionDate),
      serviceLife: data.serviceLife || '',
      depreciationMethod: data.depreciationMethod || '',
      depreciationMethodLabel: getDepreciationLabel(data.depreciationMethod),
      location: data.location?.warhouseName || data.location || '',
      stockQuantity: data.equipmentQuantity || data.stockQuantity || 0,
      expenditureQuantity: data.expenditureQuantity || 0,
      unit: data.unit || '',
      unitLabel: getUnitLabel(data.unit),
      technicalParams: getExtAttrValue('TechnicalParameterInfo'),
      spareParts: getExtAttrValue('SparePartsInfo'),
      remark: data.remark || '',
    }
    console.log('mappedData:', mappedData)
    console.log('spareParts原始值:', mappedData.spareParts)

    deviceData.value = { ...mappedData }
    Object.assign(formData, mappedData)
    initExtendFields()

    // 加载备品备件的物料详情
    await loadSparePartsDetails(mappedData.spareParts)
    console.log('sparePartsDetails加载后:', sparePartsDetails.value)
  } catch (error) {
    console.error('获取设备详情失败:', error)
    ElMessage.error('获取设备详情失败')
  } finally {
    loading.value = false
  }
}

const initExtendFields = () => {
  extendFields.value = [
    {
      key: 'technicalParams',
      label: '技术参数信息',
      value: formData.technicalParams || '',
      type: 'textarea',
    },
    {
      key: 'spareParts',
      label: '备品备件信息',
      value: formData.spareParts || '',
      type: 'textarea',
    },
  ]
}

const handleEdit = () => {
  isEdit.value = true
  Object.assign(formData, deviceData.value)
  initExtendFields()
}

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消编辑吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      isEdit.value = false
      Object.assign(formData, deviceData.value)
      initExtendFields()
    })
    .catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        extendFields.value.forEach((field) => {
          formData[field.key] = field.value
        })

        const updateData = {
          id: formData.id,
          equipmentName: formData.deviceName,
          brand: formData.brand,
          unit: formData.unit,
          specificationModel: formData.specModel,
          serviceLife: formData.serviceLife,
          productionDate: formData.productionDate,
          manufacturer: formData.manufacturer,
          remark: formData.remark,
          supplier: formData.supplier,
          equipmentQuantity: formData.stockQuantity,
          expenditureQuantity: formData.expenditureQuantity,
          depreciationMethod: formData.depreciationMethod,
        }

        await updateDevice(updateData)
        Object.assign(deviceData.value, formData)

        ElMessage.success('保存成功')
        isEdit.value = false
      } catch (error) {
        console.error('修改设备失败:', error)
        ElMessage.error('保存失败')
      }
    }
  })
}

const handleBack = () => {
  router.push('/device-manage/device-manage-info')
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

const handleExport = () => {
  const exportData = [
    {
      设备编码: deviceData.value.deviceCode,
      设备名称: deviceData.value.deviceName,
      生产厂家: deviceData.value.manufacturer,
      品牌: deviceData.value.brand,
      规格型号: deviceData.value.specModel,
      供应商: deviceData.value.supplier,
      生产日期: deviceData.value.productionDate,
      使用年限: deviceData.value.serviceLife,
      折旧方式: deviceData.value.depreciationMethod,
      位置: deviceData.value.location,
      库存数量: deviceData.value.stockQuantity,
      单位: deviceData.value.unit,
      技术参数信息: deviceData.value.technicalParams,
      备品备件信息: deviceData.value.spareParts,
      备注: deviceData.value.remark,
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '设备详情')
  XLSX.writeFile(workbook, `设备_${deviceData.value.deviceCode}.xlsx`)
  ElMessage.success('导出成功')
}

const rules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
  specModel: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  productionDate: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
  serviceLife: [{ required: true, message: '请输入使用年限', trigger: 'blur' }],
  depreciationMethod: [{ required: true, message: '请选择折旧方式', trigger: 'change' }],
  location: [{ required: true, message: '请选择位置', trigger: 'change' }],
  stockQuantity: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
}

onMounted(() => {
  loadDeviceData()
  fetchBrandOptions()
  fetchLocationOptions()
})
</script>

<template>
  <div class="device-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ deviceData.deviceName }}</h2>
          <span class="page-subtitle">设备详情</span>
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
              <div class="info-label">设备编码</div>
              <div class="info-value">
                <el-tag size="default">{{ deviceData.deviceCode }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">设备名称</div>
              <div class="info-value">{{ deviceData.deviceName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">生产厂家</div>
              <div class="info-value">{{ deviceData.manufacturer }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">品牌</div>
              <div class="info-value">
                <el-tag type="success" size="default">{{ deviceData.brand }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">规格型号</div>
              <div class="info-value">{{ deviceData.specModel }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">供应商</div>
              <div class="info-value">{{ deviceData.supplier }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">生产日期</div>
              <div class="info-value">{{ deviceData.productionDate }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">使用年限</div>
              <div class="info-value">{{ deviceData.serviceLife }} 年</div>
            </div>
            <div class="info-item">
              <div class="info-label">折旧方式</div>
              <div class="info-value">{{ deviceData.depreciationMethodLabel }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">位置</div>
              <div class="info-value">
                <el-tag type="warning" size="default">{{ deviceData.location }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">库存数量</div>
              <div class="info-value">
                {{ deviceData.stockQuantity }} {{ deviceData.unitLabel }}
              </div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">备注</div>
              <div class="info-value">
                <pre class="content-pre">{{ deviceData.remark || '暂无' }}</pre>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="设备编码">
                <el-input v-model="formData.deviceCode" disabled placeholder="系统自动生成" />
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
          </el-form>
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">扩展信息</span>
          <el-button v-if="isEdit" type="primary" link :icon="Plus" @click="handleAddExtendField">
            添加字段
          </el-button>
        </div>

        <template v-if="!isEdit">
          <div class="extend-info">
            <div class="extend-item">
              <div class="extend-label">技术参数信息</div>
              <div class="extend-content">
                <pre class="content-pre">{{ deviceData.technicalParams || '暂无' }}</pre>
              </div>
            </div>
            <div class="extend-item">
              <div class="extend-label">备品备件信息</div>
              <div class="extend-content">
                <div v-if="hasSpareParts" class="data-table-container">
                  <el-table :data="sparePartsDetails" border size="small">
                    <el-table-column prop="materialCode" label="物料编号" width="120" />
                    <el-table-column prop="materialName" label="物料名称" width="150" />
                    <el-table-column prop="specModel" label="规格型号" width="120" />
                    <el-table-column prop="stockQuantity" label="库存数量" width="100" />
                    <el-table-column prop="supplier" label="供应商" width="150" />
                    <el-table-column prop="version" label="版本号" width="80" />
                    <el-table-column prop="category" label="分类" width="120" />
                    <el-table-column prop="location" label="位置" width="100" />
                  </el-table>
                </div>
                <div v-else-if="deviceData.spareParts" class="data-table-container">
                  <div style="margin-bottom: 10px; color: #666">原始数据:</div>
                  <pre
                    class="content-pre"
                    style="background: #f5f5f5; padding: 10px; border-radius: 4px"
                    >{{ deviceData.spareParts }}</pre
                  >
                </div>
                <div v-else class="empty-content">暂无备品备件信息</div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="extend-edit">
            <div v-for="(field, index) in extendFields" :key="field.key" class="extend-edit-item">
              <div class="extend-edit-header">
                <el-input
                  v-model="field.label"
                  placeholder="字段名称"
                  style="width: 200px"
                  :disabled="!field.isNew"
                />
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
              <el-input v-model="field.value" type="textarea" :rows="4" placeholder="请输入内容" />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.device-detail-container {
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

      .extend-info {
        padding: 20px;

        .extend-item {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }

          .extend-label {
            font-size: 18px;
            color: #606266;
            margin-bottom: 12px;
            font-weight: 500;
          }

          .extend-content {
            background: #fafafa;
            border-radius: 4px;
            padding: 10px 10px;

            .content-pre {
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: inherit;
              line-height: 1.8;
              font-size: 16px;
              color: #303133;
            }

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
            }

            .empty-content {
              text-align: center;
              color: #909399;
              padding: 40px 20px;
              font-size: 16px;
            }
          }
        }
      }

      .extend-edit {
        padding: 16px;

        .extend-edit-item {
          margin-bottom: 14px;
          padding: 20px;
          background: #fafafa;
          border-radius: 4px;

          .extend-edit-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .device-detail-container {
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
  .device-detail-container {
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
