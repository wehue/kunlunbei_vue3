<script setup>
import { ref, reactive, onMounted } from 'vue'
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
const processData = ref({})
const formData = reactive({
  processCode: '',
  processName: '',
  productionStep: '',
  devices: [],
  operators: [],
  startTime: '',
  endTime: '',
  materials: [],
})
const formRef = ref()

const deviceOptions = [
  { label: '数控车床', value: '数控车床', id: 1 },
  { label: '加工中心', value: '加工中心', id: 2 },
  { label: '铣床', value: '铣床', id: 3 },
  { label: '磨床', value: '磨床', id: 4 },
  { label: '钻床', value: '钻床', id: 5 },
  { label: '检测仪', value: '检测仪', id: 6 },
]

const operatorOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
  { label: '钱七', value: '钱七' },
]

const materialOptions = [
  { label: '钢材', value: '钢材', id: 1 },
  { label: '铝材', value: '铝材', id: 2 },
  { label: '铜材', value: '铜材', id: 3 },
  { label: '塑料件', value: '塑料件', id: 4 },
  { label: '电子元件', value: '电子元件', id: 5 },
]

const mockProcessData = {
  1: {
    id: 1,
    processCode: 'PROC20240001',
    processName: '车削加工',
    productionStep:
      '使用数控车床对工件进行外圆车削加工，保证尺寸精度。首先装夹工件，然后选择合适的刀具，设定切削参数，进行粗加工和精加工。',
    devices: [
      { id: 1, deviceName: '数控车床', quantity: 2 },
      { id: 2, deviceName: '检测仪', quantity: 1 },
    ],
    operators: ['张三', '李四'],
    startTime: '2024-01-15 08:00:00',
    endTime: '2024-01-15 17:00:00',
    materials: [
      { id: 1, materialName: '钢材', quantity: 50 },
      { id: 2, materialName: '铝材', quantity: 20 },
    ],
  },
  2: {
    id: 2,
    processCode: 'PROC20240002',
    processName: '铣削加工',
    productionStep: '使用加工中心进行平面铣削和型腔加工',
    devices: [{ id: 1, deviceName: '加工中心', quantity: 1 }],
    operators: ['王五'],
    startTime: '2024-01-16 09:00:00',
    endTime: '2024-01-16 18:00:00',
    materials: [{ id: 1, materialName: '铝材', quantity: 30 }],
  },
  3: {
    id: 3,
    processCode: 'PROC20240003',
    processName: '钻孔工序',
    productionStep: '使用钻床对工件进行定位钻孔',
    devices: [{ id: 1, deviceName: '钻床', quantity: 1 }],
    operators: ['赵六'],
    startTime: '',
    endTime: '',
    materials: [],
  },
  4: {
    id: 4,
    processCode: 'PROC20240004',
    processName: '磨削精加工',
    productionStep: '使用磨床对工件表面进行精密磨削',
    devices: [{ id: 1, deviceName: '磨床', quantity: 1 }],
    operators: ['钱七', '张三'],
    startTime: '2024-01-17 08:30:00',
    endTime: '',
    materials: [{ id: 1, materialName: '铜材', quantity: 15 }],
  },
  5: {
    id: 5,
    processCode: 'PROC20240005',
    processName: '质量检测',
    productionStep: '使用检测仪对成品进行尺寸和外观检测',
    devices: [{ id: 1, deviceName: '检测仪', quantity: 2 }],
    operators: ['李四', '王五'],
    startTime: '',
    endTime: '',
    materials: [],
  },
}

const loadProcessData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = mockProcessData[id] || mockProcessData[1]
    processData.value = { ...data }
    Object.assign(formData, {
      processCode: data.processCode,
      processName: data.processName,
      productionStep: data.productionStep,
      devices: JSON.parse(JSON.stringify(data.devices || [])),
      operators: [...(data.operators || [])],
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      materials: JSON.parse(JSON.stringify(data.materials || [])),
    })
    loading.value = false
  }, 300)
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
        processCode: processData.value.processCode,
        processName: processData.value.processName,
        productionStep: processData.value.productionStep,
        devices: JSON.parse(JSON.stringify(processData.value.devices || [])),
        operators: [...(processData.value.operators || [])],
        startTime: processData.value.startTime || '',
        endTime: processData.value.endTime || '',
        materials: JSON.parse(JSON.stringify(processData.value.materials || [])),
      })
    })
    .catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      Object.assign(processData.value, {
        processCode: formData.processCode,
        processName: formData.processName,
        productionStep: formData.productionStep,
        devices: JSON.parse(JSON.stringify(formData.devices)),
        operators: [...formData.operators],
        startTime: formData.startTime,
        endTime: formData.endTime,
        materials: JSON.parse(JSON.stringify(formData.materials)),
      })
      mockProcessData[processData.value.id] = { ...processData.value }

      ElMessage.success('保存成功')
      isEdit.value = false
    }
  })
}

const handleBack = () => {
  router.push('/process-manage/process-manage-info')
}

const handleAddDevice = () => {
  formData.devices.push({
    id: Date.now(),
    deviceName: '',
    quantity: 1,
  })
}

const handleRemoveDevice = (index) => {
  formData.devices.splice(index, 1)
}

const handleAddMaterial = () => {
  formData.materials.push({
    id: Date.now(),
    materialName: '',
    quantity: 1,
  })
}

const handleRemoveMaterial = (index) => {
  formData.materials.splice(index, 1)
}

const handleExport = () => {
  const deviceStr =
    processData.value.devices?.map((d) => `${d.deviceName}(${d.quantity})`).join('、') || '无'
  const materialStr =
    processData.value.materials?.map((m) => `${m.materialName}(${m.quantity})`).join('、') || '无'
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
      物料BOM: materialStr,
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

onMounted(() => {
  loadProcessData()
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
              <el-table-column prop="quantity" label="支出数量" style="width: 50%">
                <template #default="scope"> {{ scope.row.quantity }} 台/套 </template>
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
              <el-select v-model="device.deviceName" placeholder="请选择设备" style="width: 200px">
                <el-option
                  v-for="item in deviceOptions"
                  :key="item.id"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-input-number
                v-model="device.quantity"
                :min="1"
                :max="100"
                placeholder="支出数量"
                style="width: 150px"
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
          <div class="form-grid">
            <el-form-item label="选择操作人员">
              <el-select
                v-model="formData.operators"
                multiple
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
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">物料BOM</span>
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
              <el-table-column prop="quantity" label="支出数量" style="width: 50%">
                <template #default="scope"> {{ scope.row.quantity }} 件 </template>
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
              <el-select
                v-model="material.materialName"
                placeholder="请选择物料"
                style="width: 200px"
              >
                <el-option
                  v-for="item in materialOptions"
                  :key="item.id"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-input-number
                v-model="material.quantity"
                :min="1"
                :max="1000"
                placeholder="支出数量"
                style="width: 150px"
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
