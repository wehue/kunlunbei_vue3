<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { getLoginLogList, exportLoginLog } from '@/api/loginLog'
import timeFormat from '@/utils/format_time'

const proTableRef = ref()

const loginStatusOptions = ref([
  { label: '成功', value: 1 },
  { label: '失败', value: 0 },
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
    登录状态: item.loginStatus === 1 ? '成功' : '失败',
    失败原因: item.failReason || '-',
  }))
  exportToExcel(exportData, `登录日志_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const getTableList = async (params) => {
  try {
    // 转换日期范围参数
    const apiParams = { ...params }
    if (params?.dateRange && params.dateRange.length === 2) {
      apiParams.startDate = params.dateRange[0]
      apiParams.endDate = params.dateRange[1]
      delete apiParams.dateRange
    }

    // 转换登录状态参数
    if (params?.loginStatus !== undefined) {
      apiParams.login_status = params.loginStatus
      delete apiParams.loginStatus
    }

    const res = await getLoginLogList(apiParams)
    console.log('获取登录日志成功', res)
    
    if (res.data.code === 200) {
      // 处理返回数据，添加序号
      const list = res.data.data.data || []
      const pageNum = params?.pageNum || 1
      const pageSize = params?.pageSize || 10

      const dataWithIndex = list.map((item, index) => ({
        ...item,
        index: (pageNum - 1) * pageSize + index + 1,
        // 映射后端字段到前端字段
        userId: item.user_Id?.userId || '',
        userName: item.user_Id?.userName || '',
        loginTime: item.login_Time
          ? timeFormat.formatDate(item.login_Time, 'YYYY-MM-DD HH:mm:ss')
          : '',
        loginStatus: item.login_Status === 1 ? '成功' : '失败',
        failReason: item.failReason || '',
      }))

      return {
        data: {
          list: dataWithIndex,
          total: res.data.data.total || 0,
        },
      }
    } else {
      ElMessage.error(res.data.message || '获取登录日志失败')
      return {
        data: {
          list: [],
          total: 0,
        },
      }
    }
  } catch (error) {
    ElMessage.error('获取登录日志失败')
    console.error('获取登录日志失败:', error)
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
