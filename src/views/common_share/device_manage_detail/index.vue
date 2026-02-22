<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, ArrowLeft, Download } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'

const route = useRoute()
const router = useRouter()
const { isDesignerRole } = usePermission()

const isEdit = ref(false)
const loading = ref(false)
const deviceData = ref({})
const formData = reactive({})
const extendFields = ref([])
const formRef = ref()

const brandOptions = [
  { label: '西门子', value: '西门子' },
  { label: '三菱', value: '三菱' },
  { label: '欧姆龙', value: '欧姆龙' },
  { label: 'ABB', value: 'ABB' },
  { label: '施耐德', value: '施耐德' },
]

const locationOptions = [
  { label: '车间A', value: '车间A' },
  { label: '车间B', value: '车间B' },
  { label: '仓库C', value: '仓库C' },
  { label: '实验室', value: '实验室' },
]

const depreciationOptions = [
  { label: '直线法', value: '直线法' },
  { label: '年数总和法', value: '年数总和法' },
  { label: '双倍余额递减法', value: '双倍余额递减法' },
]

const unitOptions = [
  { label: '台', value: '台' },
  { label: '套', value: '套' },
  { label: '件', value: '件' },
  { label: '个', value: '个' },
]

const mockDeviceData = {
  1: {
    id: 1,
    deviceCode: 'DEV20240001',
    deviceName: '数控车床',
    manufacturer: '西门子工业自动化有限公司',
    brand: '西门子',
    specModel: 'CNC-800',
    supplier: '北京华工设备贸易有限公司',
    productionDate: '2022-03-15',
    serviceLife: 15,
    depreciationMethod: '直线法',
    location: '车间A',
    stockQuantity: 5,
    unit: '台',
    technicalParams: '主轴转速：100-3000rpm\n加工直径：≤800mm\n加工长度：≤1500mm\n功率：22kW',
    spareParts: '主轴轴承、导轨滑块、丝杠螺母、刀具夹头',
    remark: '设备运行状态良好，定期保养中',
  },
  2: {
    id: 2,
    deviceCode: 'DEV20240002',
    deviceName: '加工中心',
    manufacturer: '三菱电机自动化有限公司',
    brand: '三菱',
    specModel: 'MC-500',
    supplier: '上海精密机械有限公司',
    productionDate: '2021-06-20',
    serviceLife: 12,
    depreciationMethod: '年数总和法',
    location: '车间B',
    stockQuantity: 3,
    unit: '台',
    technicalParams: '工作台尺寸：500×500mm\n行程：X600 Y500 Z500\n主轴转速：60-12000rpm',
    spareParts: '主轴单元、刀库组件、伺服电机',
    remark: '高精度加工设备',
  },
  3: {
    id: 3,
    deviceCode: 'DEV20240003',
    deviceName: '铣床',
    manufacturer: '欧姆龙自动化中心',
    brand: '欧姆龙',
    specModel: 'MX-300',
    supplier: '广州机电设备有限公司',
    productionDate: '2023-01-10',
    serviceLife: 10,
    depreciationMethod: '直线法',
    location: '仓库C',
    stockQuantity: 8,
    unit: '台',
    technicalParams: '工作台尺寸：300×1200mm\n主轴转速：50-2500rpm',
    spareParts: '主轴、工作台、进给系统',
    remark: '',
  },
}

const loadDeviceData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = mockDeviceData[id] || mockDeviceData[1]
    deviceData.value = { ...data }
    Object.assign(formData, data)
    initExtendFields()
    loading.value = false
  }, 300)
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
    { key: 'remark', label: '备注', value: formData.remark || '', type: 'textarea' },
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

  await formRef.value.validate((valid) => {
    if (valid) {
      extendFields.value.forEach((field) => {
        formData[field.key] = field.value
      })

      Object.assign(deviceData.value, formData)
      mockDeviceData[deviceData.value.id] = { ...deviceData.value }

      ElMessage.success('保存成功')
      isEdit.value = false
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
          <el-button v-if="isDesignerRole" type="primary" :icon="Edit" @click="handleEdit"
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
              <div class="info-value">{{ deviceData.depreciationMethod }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">位置</div>
              <div class="info-value">
                <el-tag type="warning" size="default">{{ deviceData.location }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">库存数量</div>
              <div class="info-value">{{ deviceData.stockQuantity }} {{ deviceData.unit }}</div>
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
                <pre class="content-pre">{{ deviceData.spareParts || '暂无' }}</pre>
              </div>
            </div>
            <div class="extend-item">
              <div class="extend-label">备注</div>
              <div class="extend-content">
                <pre class="content-pre">{{ deviceData.remark || '暂无' }}</pre>
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
