<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'

const proTableRef = ref()

const loginStatusOptions = ref([
  { label: '成功', value: '成功' },
  { label: '失败', value: '失败' },
])

const mockData = ref([
  {
    id: 1,
    userId: 'U001',
    userName: '张三',
    loginTime: '2024-01-15 08:30:25',
    loginStatus: '成功',
    failReason: '',
  },
  {
    id: 2,
    userId: 'U002',
    userName: '李四',
    loginTime: '2024-01-15 08:32:10',
    loginStatus: '成功',
    failReason: '',
  },
  {
    id: 3,
    userId: 'U003',
    userName: '王五',
    loginTime: '2024-01-15 08:35:42',
    loginStatus: '失败',
    failReason: '密码错误',
  },
  {
    id: 4,
    userId: 'U001',
    userName: '张三',
    loginTime: '2024-01-15 09:15:30',
    loginStatus: '成功',
    failReason: '',
  },
  {
    id: 5,
    userId: 'U004',
    userName: '赵六',
    loginTime: '2024-01-15 09:20:15',
    loginStatus: '成功',
    failReason: '',
  },
  {
    id: 6,
    userId: 'U005',
    userName: '钱七',
    loginTime: '2024-01-15 09:25:50',
    loginStatus: '失败',
    failReason: '账号不存在',
  },
  {
    id: 7,
    userId: 'U002',
    userName: '李四',
    loginTime: '2024-01-15 10:05:22',
    loginStatus: '成功',
    failReason: '',
  },
  {
    id: 8,
    userId: 'U006',
    userName: '孙八',
    loginTime: '2024-01-15 10:10:45',
    loginStatus: '成功',
    failReason: '',
  },
  {
    id: 9,
    userId: 'U003',
    userName: '王五',
    loginTime: '2024-01-15 10:15:33',
    loginStatus: '成功',
    failReason: '',
  },
  {
    id: 10,
    userId: 'U007',
    userName: '周九',
    loginTime: '2024-01-15 10:20:18',
    loginStatus: '失败',
    failReason: '密码错误',
  },
  {
    id: 11,
    userId: 'U001',
    userName: '张三',
    loginTime: '2024-01-15 11:05:40',
    loginStatus: '成功',
    failReason: '',
  },
  {
    id: 12,
    userId: 'U008',
    userName: '吴十',
    loginTime: '2024-01-15 11:10:55',
    loginStatus: '成功',
    failReason: '',
  },
  {
    id: 13,
    userId: 'U004',
    userName: '赵六',
    loginTime: '2024-01-15 14:05:12',
    loginStatus: '成功',
    failReason: '',
  },
  {
    id: 14,
    userId: 'U009',
    userName: '郑十一',
    loginTime: '2024-01-15 14:10:30',
    loginStatus: '失败',
    failReason: '账号被锁定',
  },
  {
    id: 15,
    userId: 'U002',
    userName: '李四',
    loginTime: '2024-01-15 14:15:45',
    loginStatus: '成功',
    failReason: '',
  },
])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'userId', label: '用户ID', search: { el: 'input', key: 'userId' } },
  { prop: 'userName', label: '用户名', search: { el: 'input', key: 'userName' } },
  {
    prop: 'loginTime',
    label: '登录时间',
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
    prop: 'loginStatus',
    label: '登录状态',
    search: { el: 'select', key: 'loginStatus' },
    enum: loginStatusOptions,
  },
  { prop: 'failReason', label: '失败原因', minWidth: 120 },
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
    用户ID: item.userId,
    用户名: item.userName,
    登录时间: item.loginTime,
    登录状态: item.loginStatus,
    失败原因: item.failReason || '-',
  }))
  exportToExcel(exportData, `登录日志_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const filterData = (data, params) => {
  let filteredData = [...data]

  if (params?.userId) {
    filteredData = filteredData.filter((item) => item.userId.includes(params.userId))
  }

  if (params?.userName) {
    filteredData = filteredData.filter((item) => item.userName.includes(params.userName))
  }

  if (params?.loginStatus) {
    filteredData = filteredData.filter((item) => item.loginStatus === params.loginStatus)
  }

  if (params?.dateRange && params.dateRange.length === 2) {
    filteredData = filteredData.filter((item) => {
      const loginDate = item.loginTime.split(' ')[0]
      return loginDate >= params.dateRange[0] && loginDate <= params.dateRange[1]
    })
  }

  return filteredData
}

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredData = filterData(mockData.value, params)

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
  <div class="login-log-container">
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

      <template #loginStatus="scope">
        <el-tag :type="scope.row.loginStatus === '成功' ? 'success' : 'danger'">
          {{ scope.row.loginStatus }}
        </el-tag>
      </template>

      <template #failReason="scope">
        <span :class="{ 'fail-reason': scope.row.failReason }">
          {{ scope.row.failReason || '-' }}
        </span>
      </template>
    </ProTable>
  </div>
</template>

<style lang="scss" scoped>
.login-log-container {
  :deep(.table-search) {
    margin-bottom: 10px !important;
  }

  .fail-reason {
    color: #f56c6c;
  }
}
</style>
