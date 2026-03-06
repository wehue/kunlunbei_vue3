<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Download, Delete, Edit } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'
import { getProcessList } from '@/api/process'

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
  operators: [],
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
  isEdit.value = false
  Object.assign(formData, {
    id: null,
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

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    processCode: row.processCode,
    processName: row.processName,
    productionStep: row.productionStep,
    devices: JSON.parse(JSON.stringify(row.devices || [])),
    operators: [...(row.operators || [])],
    startTime: row.startTime,
    endTime: row.endTime,
    materials: JSON.parse(JSON.stringify(row.materials || [])),
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = mockData.value.findIndex((item) => item.id === formData.id)
        if (index > -1) {
          mockData.value[index] = {
            ...mockData.value[index],
            processName: formData.processName,
            productionStep: formData.productionStep,
            devices: JSON.parse(JSON.stringify(formData.devices)),
            operators: [...formData.operators],
            startTime: formData.startTime,
            endTime: formData.endTime,
            materials: JSON.parse(JSON.stringify(formData.materials)),
          }
        }
        ElMessage.success('修改成功')
      } else {
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
      }
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

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该工序吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const index = mockData.value.findIndex((item) => item.id === row.id)
    if (index > -1) {
      mockData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
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

    // 转换数据格式，只保留需要的字段
    const transformedData = processList.map((item, index) => ({
      id: item.id,
      processCode: item.workingProcedureId,
      processName: item.workingProcedureName,
      productionStep: item.productionSteps,
      index: index + 1,
    }))

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
