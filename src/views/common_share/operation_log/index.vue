<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { getOperationLogsList } from '@/api/operationLog'
import timeFormat from '@/utils/format_time'

const proTableRef = ref()

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

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'operatorName', label: '操作人', search: { el: 'input', key: 'operatorId' } },
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
  { prop: 'operationRecord', label: '操作内容', minWidth: 250 },
  {
    prop: 'description',
    label: '操作结果',
    search: { el: 'select', key: 'operationResult' },
    enum: operationResultOptions,
  },
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
    操作人: item.operatorName,
    操作时间: item.operationTime,
    操作类型: item.operationType,
    操作内容: item.operationRecord,
    操作结果: item.description,
  }))
  exportToExcel(exportData, `操作日志_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const getTableList = async (params) => {
  try {
    const apiParams = {
      operatorId: params?.operatorId,
      startDate: params?.dateRange?.[0],
      endDate: params?.dateRange?.[1],
      operationType: params?.operationType,
      operationResult: params?.operationResult,
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
    }

    console.log('请求参数:', apiParams)
    const response = await getOperationLogsList(apiParams)
    console.log('获取操作日志成功', response)

    let list = []
    let total = 0

    if (response.data && response.data.code === 200) {
      const backendData = response.data.data
      if (backendData && Array.isArray(backendData.data)) {
        list = backendData.data
        total = backendData.totalCount || 0
      } else if (backendData && Array.isArray(backendData)) {
        list = backendData
        total = response.data.totalCount || 0
      }
    } else if (response.data && Array.isArray(response.data)) {
      list = response.data
      total = response.totalCount || list.length
    }

    const pageNum = apiParams.pageNum || 1
    const pageSize = apiParams.pageSize || 10

    const dataWithIndex = list.map((item, index) => ({
      ...item,
      index: (pageNum - 1) * pageSize + index + 1,
      operatorName: item.operator?.userName || item.operatorName || '',
      operationTime: item.operationTime
        ? timeFormat.formatDate(item.operationTime, 'YYYY-MM-DD HH:mm:ss')
        : '',
      operationType: item.operationType || '',
      operationRecord: item.operationRecord || '',
      description: item.description || '',
    }))

    console.log('处理后的数据:', { list: dataWithIndex, total })

    return {
      data: {
        list: dataWithIndex,
        total: total,
      },
    }
  } catch (error) {
    console.error('获取操作日志失败:', error)
    ElMessage.error('获取操作日志失败，请稍后重试')
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

      <template #description="scope">
        <el-tag :type="scope.row.description === '成功' ? 'success' : 'danger'">
          {{ scope.row.description }}
        </el-tag>
      </template>
    </ProTable>
  </div>
</template>

<style lang="scss" scoped>
.operation-log-container {
  :deep(.table-search) {
    margin-bottom: 10px !important;
  }
}
</style>
