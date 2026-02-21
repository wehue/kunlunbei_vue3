<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const currentRole = computed(() => userStore.userInfo.role)

const proTableRef = ref()
const dateRange = ref([])
const enableDedup = ref(false)

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
    ipAddress: '192.168.1.100',
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
    ipAddress: '192.168.1.101',
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
    ipAddress: '192.168.1.102',
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
    ipAddress: '192.168.1.100',
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
    ipAddress: '192.168.1.103',
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
    ipAddress: '192.168.1.104',
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
    ipAddress: '192.168.1.101',
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
    ipAddress: '192.168.1.105',
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
    ipAddress: '192.168.1.102',
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
    ipAddress: '192.168.1.106',
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
    ipAddress: '192.168.1.100',
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
    ipAddress: '192.168.1.107',
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
    ipAddress: '192.168.1.103',
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
    ipAddress: '192.168.1.108',
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
    ipAddress: '192.168.1.101',
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
    ipAddress: '192.168.1.100',
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
    ipAddress: '192.168.1.102',
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
    ipAddress: '192.168.1.101',
  },
])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'operator', label: '操作人', search: { el: 'input', key: 'operator' } },
  { prop: 'operationTime', label: '操作时间', minWidth: 160 },
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
  { prop: 'ipAddress', label: 'IP地址', minWidth: 120 },
])

const handleDateRangeChange = (val) => {
  if (val && val.length === 2) {
    proTableRef.value.searchParam.startTime = val[0]
    proTableRef.value.searchParam.endTime = val[1]
  } else {
    proTableRef.value.searchParam.startTime = ''
    proTableRef.value.searchParam.endTime = ''
  }
}

const deduplicateData = (data) => {
  const seen = new Map()
  return data.filter((item) => {
    const key = `${item.operator}_${item.operationContent}_${item.operationType}_${item.operationResult}`
    if (seen.has(key)) {
      return false
    }
    seen.set(key, true)
    return true
  })
}

const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const handleExportCurrent = () => {
  const params = proTableRef.value?.searchParam || {}
  let filteredData = filterData(mockData.value, params)
  if (enableDedup.value) {
    filteredData = deduplicateData(filteredData)
  }
  const exportData = filteredData.map((item) => ({
    操作人: item.operator,
    操作时间: item.operationTime,
    操作类型: item.operationType,
    操作内容: item.operationContent,
    操作结果: item.operationResult,
    操作模块: item.operationModule,
    IP地址: item.ipAddress,
  }))
  exportToExcel(exportData, `操作日志_${new Date().toLocaleDateString()}`)
  ElMessage.success('导出成功')
}

const handleExportAll = () => {
  let dataToExport = [...mockData.value]
  if (enableDedup.value) {
    dataToExport = deduplicateData(dataToExport)
  }
  const exportData = dataToExport.map((item) => ({
    操作人: item.operator,
    操作时间: item.operationTime,
    操作类型: item.operationType,
    操作内容: item.operationContent,
    操作结果: item.operationResult,
    操作模块: item.operationModule,
    IP地址: item.ipAddress,
  }))
  exportToExcel(exportData, `操作日志_全部_${new Date().toLocaleDateString()}`)
  ElMessage.success('导出成功')
}

const handleExportSelected = (selectedList) => {
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
    IP地址: item.ipAddress,
  }))
  exportToExcel(exportData, `操作日志_选中_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
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

  if (params?.startTime && params?.endTime) {
    filteredData = filteredData.filter((item) => {
      const operationDate = item.operationTime.split(' ')[0]
      return operationDate >= params.startTime && operationDate <= params.endTime
    })
  }

  return filteredData
}

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = filterData(mockData.value, params)

      if (enableDedup.value && currentRole.value === 'supervisor') {
        filteredData = deduplicateData(filteredData)
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
  <div class="operation-log-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader="scope">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="margin-right: 12px"
          @change="handleDateRangeChange"
        />
        <el-checkbox
          v-if="currentRole === 'supervisor'"
          v-model="enableDedup"
          style="margin-right: 12px"
        >
          启用去重
        </el-checkbox>
        <el-button type="success" :icon="Download" @click="handleExportCurrent"
          >导出当前结果</el-button
        >
        <el-button type="success" :icon="Download" @click="handleExportAll">导出全部</el-button>
        <el-button
          type="success"
          :icon="Download"
          :disabled="!scope.isSelected"
          @click="handleExportSelected(scope.selectedList)"
        >
          导出选中
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
