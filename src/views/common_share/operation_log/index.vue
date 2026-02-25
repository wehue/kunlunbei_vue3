<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  View,
} from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import DataCompare from '@/components/DataCompare/index.vue'
import * as XLSX from 'xlsx'
import { useOperationLogStore } from '@/stores/modules/operationLog'
import { useUserStore } from '@/stores/modules/user'

const proTableRef = ref()
const operationLogStore = useOperationLogStore()
const userStore = useUserStore()

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
  { prop: 'operation', label: '操作', width: 100, fixed: 'right' },
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
  }))
  exportToExcel(exportData, `操作日志_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const handleViewDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
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
                    : 'info'
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
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
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
  }
}
</style>
