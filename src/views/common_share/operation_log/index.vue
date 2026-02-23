<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, RefreshLeft, View } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
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

const handleRollback = async (row) => {
  if (!canRollback.value) {
    ElMessage.warning('您没有回滚操作的权限')
    return
  }

  if (!row.canRollback) {
    ElMessage.warning('该操作不支持回滚')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要回滚操作"${row.operationContent}"吗？此操作将撤销该次变更。`,
      '回滚确认',
      {
        confirmButtonText: '确定回滚',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

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
    proTableRef.value?.getTableList()
  } catch {
    // 用户取消
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
          v-if="canRollback && scope.row.canRollback && scope.row.operationResult === '成功'"
          type="warning"
          link
          :icon="RefreshLeft"
          @click="handleRollback(scope.row)"
        >
          回滚
        </el-button>
      </template>
    </ProTable>

    <el-dialog v-model="detailDialogVisible" title="操作详情" width="600px">
      <el-descriptions :column="1" border v-if="currentDetail">
        <el-descriptions-item label="操作人">{{ currentDetail.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{
          currentDetail.operationTime
        }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{
          currentDetail.operationType
        }}</el-descriptions-item>
        <el-descriptions-item label="操作内容">{{
          currentDetail.operationContent
        }}</el-descriptions-item>
        <el-descriptions-item label="操作结果">
          <el-tag :type="currentDetail.operationResult === '成功' ? 'success' : 'danger'">
            {{ currentDetail.operationResult }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作模块">{{
          currentDetail.operationModule
        }}</el-descriptions-item>
        <el-descriptions-item label="变更前数据" v-if="currentDetail.beforeData">
          <pre class="data-preview">{{ JSON.stringify(currentDetail.beforeData, null, 2) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="变更后数据" v-if="currentDetail.afterData">
          <pre class="data-preview">{{ JSON.stringify(currentDetail.afterData, null, 2) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="是否可回滚">
          <el-tag :type="currentDetail.canRollback ? 'success' : 'info'">
            {{ currentDetail.canRollback ? '可回滚' : '不可回滚' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="
            canRollback && currentDetail?.canRollback && currentDetail?.operationResult === '成功'
          "
          type="warning"
          :icon="RefreshLeft"
          @click="handleRollbackFromDetail"
        >
          回滚此操作
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.operation-log-container {
  :deep(.table-search) {
    margin-bottom: 10px !important;
  }

  .data-preview {
    margin: 0;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.6;
    max-height: 200px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
