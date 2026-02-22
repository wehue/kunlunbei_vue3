<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Download, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'

const { hasPermission, isDesignerRole } = usePermission()
const router = useRouter()

const proTableRef = ref()
const dialogVisible = ref(false)
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

const mockData = ref([
  {
    id: 1,
    processCode: 'PROC20240001',
    processName: '车削加工',
    productionStep: '使用数控车床对工件进行外圆车削加工，保证尺寸精度',
  },
  {
    id: 2,
    processCode: 'PROC20240002',
    processName: '铣削加工',
    productionStep: '使用加工中心进行平面铣削和型腔加工',
  },
  {
    id: 3,
    processCode: 'PROC20240003',
    processName: '钻孔工序',
    productionStep: '使用钻床对工件进行定位钻孔',
  },
  {
    id: 4,
    processCode: 'PROC20240004',
    processName: '磨削精加工',
    productionStep: '使用磨床对工件表面进行精密磨削',
  },
  {
    id: 5,
    processCode: 'PROC20240005',
    processName: '质量检测',
    productionStep: '使用检测仪对成品进行尺寸和外观检测',
  },
  {
    id: 6,
    processCode: 'PROC20240006',
    processName: '热处理',
    productionStep: '对工件进行淬火处理，提高硬度',
  },
  {
    id: 7,
    processCode: 'PROC20240007',
    processName: '表面处理',
    productionStep: '对工件表面进行喷砂和防锈处理',
  },
  {
    id: 8,
    processCode: 'PROC20240008',
    processName: '组装工序',
    productionStep: '将各零部件按图纸要求进行组装',
  },
])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'processCode', label: '工序编号', search: { el: 'input', key: 'processCode' } },
  { prop: 'processName', label: '工序名称', search: { el: 'input', key: 'processName' } },
  { prop: 'productionStep', label: '生产步骤', minWidth: 300 },
  { prop: 'operation', label: '操作', width: 150, fixed: 'right' },
])

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

const rules = {
  processName: [{ required: true, message: '请输入工序名称', trigger: 'blur' }],
  productionStep: [{ required: true, message: '请输入生产步骤', trigger: 'blur' }],
}

const generateProcessCode = () => {
  const year = new Date().getFullYear()
  const maxId = mockData.value.reduce((max, item) => {
    const id = parseInt(item.id)
    return id > max ? id : max
  }, 0)
  const newId = String(maxId + 1).padStart(4, '0')
  return `PROC${year}${newId}`
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

const handleAdd = () => {
  Object.assign(formData, {
    processCode: generateProcessCode(),
    processName: '',
    productionStep: '',
    devices: [],
    operators: [],
    startTime: '',
    endTime: '',
    materials: [],
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      const maxId = mockData.value.reduce((max, item) => {
        const id = parseInt(item.id)
        return id > max ? id : max
      }, 0)

      const newProcess = {
        id: maxId + 1,
        processCode: formData.processCode,
        processName: formData.processName,
        productionStep: formData.productionStep,
        devices: JSON.parse(JSON.stringify(formData.devices)),
        operators: [...formData.operators],
        startTime: formData.startTime,
        endTime: formData.endTime,
        materials: JSON.parse(JSON.stringify(formData.materials)),
      }

      mockData.value.push(newProcess)
      ElMessage.success('新增成功')
      dialogVisible.value = false
      proTableRef.value?.getTableList()
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleView = (row) => {
  router.push(`/process-manage/process-manage-detail/${row.id}`)
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
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockData.value]

      if (params?.processCode) {
        filteredData = filteredData.filter((item) => item.processCode.includes(params.processCode))
      }

      if (params?.processName) {
        filteredData = filteredData.filter((item) => item.processName.includes(params.processName))
      }

      const pageNum = params?.pageNum || 1
      const pageSize = params?.pageSize || 10
      const startIndex = (pageNum - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)

      const dataWithIndex = paginatedData.map((item, index) => ({
        ...item,
        index: startIndex + index + 1,
      }))

      resolve({
        data: {
          list: dataWithIndex,
          total: filteredData.length,
        },
      })
    }, 300)
  })
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
        <el-button v-if="isDesignerRole" type="primary" :icon="Plus" @click="handleAdd">
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
        <el-button type="success" link :icon="Download" @click="handleExportSingle(scope.row)">
          导出
        </el-button>
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
          <span class="dialog-title">新增工序</span>
        </div>
      </template>
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-section">
          <div class="section-title">
            <span class="title-text">基本信息</span>
          </div>
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
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="title-text">操作人员</span>
          </div>
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
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="title-text">物料BOM</span>
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
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 4px 8px;
              justify-items: stretch;
              align-items: stretch;

              .el-button {
                width: 100%;
                min-width: 60px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
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
