<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  RefreshLeft,
  View,
  WarningFilled,
  InfoFilled,
  CircleCheckFilled,
} from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import DataCompare from '@/components/DataCompare/index.vue'
import * as XLSX from 'xlsx'
import { useOperationLogStore } from '@/stores/modules/operationLog'
import { useUserStore } from '@/stores/modules/user'

const proTableRef = ref()
const operationLogStore = useOperationLogStore()
const userStore = useUserStore()

const currentRole = computed(() => userStore.userInfo.role)
const canRollback = computed(() => currentRole.value === 'admin')

const detailDialogVisible = ref(false)
const currentDetail = ref(null)
const rollbackConfirmVisible = ref(false)
const rollbackTarget = ref(null)

const operationTypeOptions = ref([
  { label: '新增', value: '新增' },
  { label: '修改', value: '修改' },
  { label: '审核', value: '审核' },
  { label: '删除', value: '删除' },
  { label: '查询', value: '查询' },
  { label: '导出', value: '导出' },
])

const operationResultOptions = ref([
  { label: '成功', value: '成功' },
  { label: '失败', value: '失败' },
])

const mockData = ref([
  {
    id: 1,
    operator: '张三',
    operatorId: 'U001',
    operationTime: '2024-01-15 08:30:25',
    operationContent: '新增设备信息：数控车床',
    operationType: '新增',
    operationResult: '成功',
    operationModule: '设备管理',
    canRollback: true,
    beforeData: null,
    afterData: { deviceName: '数控车床', deviceCode: 'DEV20240001' },
  },
  {
    id: 2,
    operator: '李四',
    operatorId: 'U002',
    operationTime: '2024-01-15 08:32:10',
    operationContent: '修改物料信息：钢材A型',
    operationType: '修改',
    operationResult: '成功',
    operationModule: '物料管理',
    canRollback: true,
    beforeData: { materialName: '钢材A型', stockQuantity: 100 },
    afterData: { materialName: '钢材A型', stockQuantity: 150 },
  },
  {
    id: 3,
    operator: '王五',
    operatorId: 'U003',
    operationTime: '2024-01-15 08:35:42',
    operationContent: '审核工艺路线：工艺路线001',
    operationType: '审核',
    operationResult: '成功',
    operationModule: '审核管理',
    canRollback: false,
    beforeData: null,
    afterData: null,
  },
  {
    id: 4,
    operator: '张三',
    operatorId: 'U001',
    operationTime: '2024-01-15 09:15:30',
    operationContent: '新增设备信息：数控车床',
    operationType: '新增',
    operationResult: '失败',
    operationModule: '设备管理',
    canRollback: false,
    beforeData: null,
    afterData: null,
  },
  {
    id: 5,
    operator: '赵六',
    operatorId: 'U004',
    operationTime: '2024-01-15 09:20:15',
    operationContent: '删除物料分类：废弃分类',
    operationType: '删除',
    operationResult: '成功',
    operationModule: '物料管理',
    canRollback: true,
    beforeData: { categoryName: '废弃分类', categoryId: 'CAT001' },
    afterData: null,
  },
  {
    id: 6,
    operator: '钱七',
    operatorId: 'U005',
    operationTime: '2024-01-15 09:25:50',
    operationContent: '修改用户信息：用户U001',
    operationType: '修改',
    operationResult: '成功',
    operationModule: '用户管理',
    canRollback: true,
    beforeData: { userName: '用户U001', status: '启用' },
    afterData: { userName: '用户U001', status: '禁用' },
  },
  {
    id: 7,
    operator: '李四',
    operatorId: 'U002',
    operationTime: '2024-01-15 10:05:22',
    operationContent: '审核BOM清单：BOM20240001',
    operationType: '审核',
    operationResult: '成功',
    operationModule: '审核管理',
    canRollback: false,
    beforeData: null,
    afterData: null,
  },
  {
    id: 8,
    operator: '孙八',
    operatorId: 'U006',
    operationTime: '2024-01-15 10:10:45',
    operationContent: '新增部门信息：研发中心',
    operationType: '新增',
    operationResult: '成功',
    operationModule: '部门管理',
    canRollback: true,
    beforeData: null,
    afterData: { deptName: '研发中心', deptCode: 'DEPT001' },
  },
  {
    id: 9,
    operator: '王五',
    operatorId: 'U003',
    operationTime: '2024-01-15 10:15:33',
    operationContent: '修改设备信息：加工中心',
    operationType: '修改',
    operationResult: '成功',
    operationModule: '设备管理',
    canRollback: true,
    beforeData: { deviceName: '加工中心', status: '运行中' },
    afterData: { deviceName: '加工中心', status: '维护中' },
  },
  {
    id: 10,
    operator: '周九',
    operatorId: 'U007',
    operationTime: '2024-01-15 10:20:18',
    operationContent: '删除用户信息：用户U005',
    operationType: '删除',
    operationResult: '失败',
    operationModule: '用户管理',
    canRollback: false,
    beforeData: null,
    afterData: null,
  },
  {
    id: 11,
    operator: '张三',
    operatorId: 'U001',
    operationTime: '2024-01-15 11:05:40',
    operationContent: '新增物料信息：铝材B型',
    operationType: '新增',
    operationResult: '成功',
    operationModule: '物料管理',
    canRollback: true,
    beforeData: null,
    afterData: { materialName: '铝材B型', materialCode: 'MAT20240011' },
  },
  {
    id: 12,
    operator: '吴十',
    operatorId: 'U008',
    operationTime: '2024-01-15 11:10:55',
    operationContent: '审核工序信息：工序005',
    operationType: '审核',
    operationResult: '成功',
    operationModule: '审核管理',
    canRollback: false,
    beforeData: null,
    afterData: null,
  },
  {
    id: 13,
    operator: '赵六',
    operatorId: 'U004',
    operationTime: '2024-01-15 14:05:12',
    operationContent: '修改仓库信息：原料仓库A',
    operationType: '修改',
    operationResult: '成功',
    operationModule: '仓库管理',
    canRollback: true,
    beforeData: { warehouseName: '原料仓库A', capacity: 1000 },
    afterData: { warehouseName: '原料仓库A', capacity: 1500 },
  },
  {
    id: 14,
    operator: '郑十一',
    operatorId: 'U009',
    operationTime: '2024-01-15 14:10:30',
    operationContent: '新增产品信息：智能手表A1',
    operationType: '新增',
    operationResult: '成功',
    operationModule: '产品管理',
    canRollback: true,
    beforeData: null,
    afterData: { productName: '智能手表A1', productCode: 'PRD20240001' },
  },
  {
    id: 15,
    operator: '李四',
    operatorId: 'U002',
    operationTime: '2024-01-15 14:15:45',
    operationContent: '删除设备信息：旧设备002',
    operationType: '删除',
    operationResult: '成功',
    operationModule: '设备管理',
    canRollback: true,
    beforeData: { deviceName: '旧设备002', deviceCode: 'DEV20230002' },
    afterData: null,
  },
  {
    id: 16,
    operator: '张三',
    operatorId: 'U001',
    operationTime: '2024-01-15 15:20:30',
    operationContent: '新增设备信息：数控车床',
    operationType: '新增',
    operationResult: '成功',
    operationModule: '设备管理',
    canRollback: true,
    beforeData: null,
    afterData: { deviceName: '数控车床', deviceCode: 'DEV20240002' },
  },
  {
    id: 17,
    operator: '王五',
    operatorId: 'U003',
    operationTime: '2024-01-15 16:30:00',
    operationContent: '查询设备列表',
    operationType: '查询',
    operationResult: '成功',
    operationModule: '设备管理',
    canRollback: false,
    beforeData: null,
    afterData: null,
  },
  {
    id: 18,
    operator: '李四',
    operatorId: 'U002',
    operationTime: '2024-01-15 17:00:00',
    operationContent: '导出物料清单',
    operationType: '导出',
    operationResult: '成功',
    operationModule: '物料管理',
    canRollback: false,
    beforeData: null,
    afterData: null,
  },
])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'operator', label: '操作人', search: { el: 'input', key: 'operator' } },
  {
    prop: 'operationTime',
    label: '操作时间',
    minWidth: 160,
    search: {
      el: 'date-picker',
      key: 'dateRange',
      props: {
        type: 'daterange',
        valueFormat: 'YYYY-MM-DD',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
      },
    },
  },
  {
    prop: 'operationType',
    label: '操作类型',
    search: { el: 'select', key: 'operationType' },
    enum: operationTypeOptions,
  },
  { prop: 'operationContent', label: '操作内容', minWidth: 250 },
  {
    prop: 'operationResult',
    label: '操作结果',
    search: { el: 'select', key: 'operationResult' },
    enum: operationResultOptions,
  },
  { prop: 'operationModule', label: '操作模块', minWidth: 100 },
  { prop: 'operation', label: '操作', width: 150, fixed: 'right' },
])

const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const handleExportBatch = (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要导出的数据')
    return
  }
  const exportData = selectedList.map((item) => ({
    操作人: item.operator,
    操作时间: item.operationTime,
    操作类型: item.operationType,
    操作内容: item.operationContent,
    操作结果: item.operationResult,
    操作模块: item.operationModule,
  }))
  exportToExcel(exportData, `操作日志_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const handleViewDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

const getRollbackCriteria = (row) => {
  const criteria = []

  if (row.operationResult !== '成功') {
    criteria.push({
      key: 'operationResult',
      label: '操作结果',
      passed: false,
      reason: '只有成功的操作才能回滚',
    })
  } else {
    criteria.push({
      key: 'operationResult',
      label: '操作结果',
      passed: true,
      reason: '操作执行成功',
    })
  }

  if (!row.canRollback) {
    criteria.push({
      key: 'canRollback',
      label: '回滚支持',
      passed: false,
      reason: '该操作类型不支持回滚',
    })
  } else {
    criteria.push({
      key: 'canRollback',
      label: '回滚支持',
      passed: true,
      reason: '该操作支持回滚',
    })
  }

  const supportedTypes = ['新增', '修改', '删除']
  if (!supportedTypes.includes(row.operationType)) {
    criteria.push({
      key: 'operationType',
      label: '操作类型',
      passed: false,
      reason: `${row.operationType}操作不支持回滚，仅支持新增、修改、删除操作`,
    })
  } else {
    criteria.push({
      key: 'operationType',
      label: '操作类型',
      passed: true,
      reason: `${row.operationType}操作支持回滚`,
    })
  }

  const hasData =
    (row.operationType === '新增' && row.afterData) ||
    (row.operationType === '删除' && row.beforeData) ||
    (row.operationType === '修改' && (row.beforeData || row.afterData))

  if (!hasData) {
    criteria.push({
      key: 'dataIntegrity',
      label: '数据完整性',
      passed: false,
      reason: '缺少必要的数据快照，无法执行回滚',
    })
  } else {
    criteria.push({
      key: 'dataIntegrity',
      label: '数据完整性',
      passed: true,
      reason: '数据快照完整，可以执行回滚',
    })
  }

  const operationTime = new Date(row.operationTime)
  const now = new Date()
  const hoursDiff = (now - operationTime) / (1000 * 60 * 60)

  if (hoursDiff > 72) {
    criteria.push({
      key: 'timeLimit',
      label: '时间限制',
      passed: false,
      reason: '操作超过72小时，为保护数据一致性，不支持回滚',
    })
  } else {
    criteria.push({
      key: 'timeLimit',
      label: '时间限制',
      passed: true,
      reason: `操作在${Math.floor(hoursDiff)}小时前，在可回滚时间范围内`,
    })
  }

  return criteria
}

const canPerformRollback = (row) => {
  if (!canRollback.value) return false
  const criteria = getRollbackCriteria(row)
  return criteria.every((c) => c.passed)
}

const getRollbackImpact = (row) => {
  const impacts = []

  switch (row.operationType) {
    case '新增':
      impacts.push({
        type: 'danger',
        description: '将删除新增的数据记录',
        detail: `删除${row.operationModule}中的数据`,
      })
      break
    case '修改':
      impacts.push({
        type: 'warning',
        description: '将恢复修改前的数据状态',
        detail: '字段值将恢复到修改前的值',
      })
      break
    case '删除':
      impacts.push({
        type: 'success',
        description: '将恢复被删除的数据',
        detail: '数据将重新出现在系统中',
      })
      break
  }

  if (row.operationModule === '用户管理') {
    impacts.push({
      type: 'warning',
      description: '可能影响用户登录和权限',
      detail: '相关用户可能需要重新登录',
    })
  }

  if (row.operationModule === '物料管理' || row.operationModule === '设备管理') {
    impacts.push({
      type: 'info',
      description: '可能影响关联业务数据',
      detail: '请检查相关的业务流程是否受影响',
    })
  }

  return impacts
}

const handleRollback = async (row) => {
  if (!canRollback.value) {
    ElMessage.warning('您没有回滚操作的权限')
    return
  }

  if (!canPerformRollback(row)) {
    ElMessage.warning('该操作不满足回滚条件')
    return
  }

  rollbackTarget.value = row
  rollbackConfirmVisible.value = true
}

const confirmRollback = async () => {
  const row = rollbackTarget.value
  if (!row) return

  try {
    const rollbackAction = getRollbackAction(row)
    mockData.value.push({
      id: mockData.value.length + 1,
      operator: userStore.userInfo.userName || '系统管理员',
      operatorId: userStore.userInfo.userId || 'U001',
      operationTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operationContent: `回滚操作：${row.operationContent}`,
      operationType: '回滚',
      operationResult: '成功',
      operationModule: row.operationModule,
      canRollback: false,
      beforeData: row.afterData,
      afterData: row.beforeData,
    })

    ElMessage.success(`操作已回滚：${rollbackAction}`)
    rollbackConfirmVisible.value = false
    rollbackTarget.value = null
    proTableRef.value?.getTableList()
  } catch {
    ElMessage.error('回滚操作失败')
  }
}

const handleRollbackFromDetail = async () => {
  await handleRollback(currentDetail.value)
  detailDialogVisible.value = false
}

const getRollbackAction = (row) => {
  switch (row.operationType) {
    case '新增':
      return `已删除新增的数据`
    case '修改':
      return `已恢复修改前的数据`
    case '删除':
      return `已恢复被删除的数据`
    default:
      return '已撤销操作'
  }
}

const filterData = (data, params) => {
  let filteredData = [...data]

  if (params?.operator) {
    filteredData = filteredData.filter((item) => item.operator.includes(params.operator))
  }

  if (params?.operationType) {
    filteredData = filteredData.filter((item) => item.operationType === params.operationType)
  }

  if (params?.operationResult) {
    filteredData = filteredData.filter((item) => item.operationResult === params.operationResult)
  }

  if (params?.dateRange && params.dateRange.length === 2) {
    filteredData = filteredData.filter((item) => {
      const operationDate = item.operationTime.split(' ')[0]
      return operationDate >= params.dateRange[0] && operationDate <= params.dateRange[1]
    })
  }

  return filteredData
}

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = filterData(mockData.value, params)

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
  <div class="operation-log-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader="scope">
        <el-button
          type="success"
          :icon="Download"
          :disabled="!scope.isSelected"
          @click="handleExportBatch(scope.selectedList)"
        >
          批量导出
        </el-button>
      </template>

      <template #operationType="scope">
        <el-tag
          :type="
            scope.row.operationType === '新增'
              ? 'success'
              : scope.row.operationType === '修改'
                ? 'warning'
                : scope.row.operationType === '审核'
                  ? 'primary'
                  : scope.row.operationType === '删除'
                    ? 'danger'
                    : scope.row.operationType === '回滚'
                      ? 'info'
                      : scope.row.operationType === '查询'
                        ? 'info'
                        : ''
          "
        >
          {{ scope.row.operationType }}
        </el-tag>
      </template>

      <template #operationResult="scope">
        <el-tag :type="scope.row.operationResult === '成功' ? 'success' : 'danger'">
          {{ scope.row.operationResult }}
        </el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleViewDetail(scope.row)"
          >详情</el-button
        >
        <el-button
          v-if="canPerformRollback(scope.row)"
          type="warning"
          link
          :icon="RefreshLeft"
          @click="handleRollback(scope.row)"
        >
          回滚
        </el-button>
      </template>
    </ProTable>

    <el-dialog v-model="detailDialogVisible" title="操作详情" width="900px" top="5vh">
      <div class="detail-content" v-if="currentDetail">
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="操作人">{{ currentDetail.operator }}</el-descriptions-item>
            <el-descriptions-item label="操作时间">{{
              currentDetail.operationTime
            }}</el-descriptions-item>
            <el-descriptions-item label="操作类型">
              <el-tag
                :type="
                  currentDetail.operationType === '新增'
                    ? 'success'
                    : currentDetail.operationType === '修改'
                      ? 'warning'
                      : currentDetail.operationType === '删除'
                        ? 'danger'
                        : 'info'
                "
              >
                {{ currentDetail.operationType }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="操作结果">
              <el-tag :type="currentDetail.operationResult === '成功' ? 'success' : 'danger'">
                {{ currentDetail.operationResult }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="操作模块" :span="2">{{
              currentDetail.operationModule
            }}</el-descriptions-item>
            <el-descriptions-item label="操作内容" :span="2">{{
              currentDetail.operationContent
            }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div
          v-if="currentDetail.beforeData || currentDetail.afterData"
          class="detail-section data-compare-section"
        >
          <div class="section-title">数据变更详情</div>
          <DataCompare
            :before-data="currentDetail.beforeData"
            :after-data="currentDetail.afterData"
            :operation-type="currentDetail.operationType"
          />
        </div>

        <div class="detail-section">
          <div class="section-title">回滚条件检查</div>
          <div class="rollback-criteria">
            <div
              v-for="criteria in getRollbackCriteria(currentDetail)"
              :key="criteria.key"
              class="criteria-item"
              :class="{ passed: criteria.passed, failed: !criteria.passed }"
            >
              <el-icon v-if="criteria.passed" class="icon-passed">
                <CircleCheckFilled />
              </el-icon>
              <el-icon v-else class="icon-failed">
                <WarningFilled />
              </el-icon>
              <div class="criteria-content">
                <div class="criteria-label">{{ criteria.label }}</div>
                <div class="criteria-reason">{{ criteria.reason }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="canPerformRollback(currentDetail)" class="detail-section">
          <div class="section-title">回滚影响分析</div>
          <div class="rollback-impacts">
            <div
              v-for="(impact, index) in getRollbackImpact(currentDetail)"
              :key="index"
              class="impact-item"
              :class="impact.type"
            >
              <el-icon>
                <InfoFilled />
              </el-icon>
              <div class="impact-content">
                <div class="impact-description">{{ impact.description }}</div>
                <div class="impact-detail">{{ impact.detail }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="canPerformRollback(currentDetail)"
          type="warning"
          :icon="RefreshLeft"
          @click="handleRollbackFromDetail"
        >
          回滚此操作
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rollbackConfirmVisible" title="回滚确认" width="600px">
      <div class="rollback-confirm-content" v-if="rollbackTarget">
        <div class="confirm-warning">
          <el-icon><WarningFilled /></el-icon>
          <span>您即将执行回滚操作，请仔细确认以下信息</span>
        </div>

        <div class="confirm-info">
          <div class="info-item">
            <span class="label">操作内容：</span>
            <span class="value">{{ rollbackTarget.operationContent }}</span>
          </div>
          <div class="info-item">
            <span class="label">操作时间：</span>
            <span class="value">{{ rollbackTarget.operationTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">操作类型：</span>
            <el-tag size="small">{{ rollbackTarget.operationType }}</el-tag>
          </div>
        </div>

        <div class="confirm-impacts">
          <div class="impact-title">回滚后将产生以下影响：</div>
          <div
            v-for="(impact, index) in getRollbackImpact(rollbackTarget)"
            :key="index"
            class="impact-item"
            :class="impact.type"
          >
            <el-icon><InfoFilled /></el-icon>
            <span>{{ impact.description }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="rollbackConfirmVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmRollback">确认回滚</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.operation-log-container {
  :deep(.table-search) {
    margin-bottom: 10px !important;
  }

  .detail-content {
    .detail-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        padding-left: 10px;
        border-left: 3px solid #409eff;
      }
    }

    .data-compare-section {
      margin-top: 16px;
    }

    .rollback-criteria {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .criteria-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid #ebeef5;

        &.passed {
          background: #f0f9ff;
          border-color: #67c23a;

          .icon-passed {
            color: #67c23a;
            font-size: 20px;
          }
        }

        &.failed {
          background: #fef0f0;
          border-color: #f56c6c;

          .icon-failed {
            color: #f56c6c;
            font-size: 20px;
          }
        }

        .criteria-content {
          flex: 1;

          .criteria-label {
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          .criteria-reason {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .rollback-impacts {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .impact-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 8px;

        &.danger {
          background: #fef0f0;
          border: 1px solid #fbc4c4;

          .el-icon {
            color: #f56c6c;
          }
        }

        &.warning {
          background: #fdf6ec;
          border: 1px solid #f5dab1;

          .el-icon {
            color: #e6a23c;
          }
        }

        &.success {
          background: #f0f9ff;
          border: 1px solid #c2e7b0;

          .el-icon {
            color: #67c23a;
          }
        }

        &.info {
          background: #f4f4f5;
          border: 1px solid #e9e9eb;

          .el-icon {
            color: #909399;
          }
        }

        .impact-content {
          flex: 1;

          .impact-description {
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          .impact-detail {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .rollback-confirm-content {
    .confirm-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fdf6ec;
      border-radius: 8px;
      color: #e6a23c;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .confirm-info {
      background: #f5f7fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;

      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 80px;
          color: #909399;
        }

        .value {
          color: #303133;
        }
      }
    }

    .confirm-impacts {
      .impact-title {
        font-weight: 500;
        color: #303133;
        margin-bottom: 12px;
      }

      .impact-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        margin-bottom: 8px;
        border-radius: 6px;

        &.danger {
          background: #fef0f0;
          color: #f56c6c;
        }

        &.warning {
          background: #fdf6ec;
          color: #e6a23c;
        }

        &.success {
          background: #f0f9ff;
          color: #67c23a;
        }

        &.info {
          background: #f4f4f5;
          color: #909399;
        }
      }
    }
  }
}
</style>
