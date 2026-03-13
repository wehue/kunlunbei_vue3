<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { View, Search, Refresh } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import { getAuditRecordsList } from '@/api/audit'

const router = useRouter()

const proTableRef = ref()

const auditStatusOptions = ref([
  { label: '待提交', value: 'W' },
  { label: '审核中', value: 'F' },
  { label: '已通过', value: 'T' },
  { label: '已驳回', value: 'Y' },
])

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取审核状态标签
const getAuditStatusLabel = (status) => {
  const map = {
    W: '待提交',
    F: '审核中',
    T: '已通过',
    Y: '已驳回',
  }
  return map[status] || status
}

// 获取审核状态类型
const getAuditStatusType = (status) => {
  const map = {
    W: 'info',
    F: 'warning',
    T: 'success',
    Y: 'danger',
  }
  return map[status] || 'info'
}

const columns = reactive([
  { type: 'index', label: '序号', width: 80 },
  {
    prop: 'processCode',
    label: '工艺编号',
    minWidth: 100,
    search: { el: 'input', key: 'workingPlanId' },
  },
  {
    prop: 'processName',
    label: '工艺路线名称',
    minWidth: 120,
    search: { el: 'input', key: 'workingPlanName' },
  },
  {
    prop: 'auditStatus',
    label: '审核状态',
    width: 110,
    search: { el: 'select', key: 'status' },
    enum: auditStatusOptions.value,
  },
  { prop: 'applicant', label: '申请人', width: 160 },
  { prop: 'submitTime', label: '提交时间', minWidth: 140 },
  { prop: 'operation', label: '操作', width: 170, fixed: 'right' },
])

const handleView = (row) => {
  router.push(`/audit-manage/audit-record-detail/${row.processCode}`)
}

const getTableList = async (params) => {
  try {
    // 构建查询参数，只传递有值的参数
    const queryParams = {
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
    }

    // 只在参数有值时才添加到查询对象中
    if (params?.workingPlanId) {
      queryParams.workingPlanId = params.workingPlanId
    }
    if (params?.workingPlanName) {
      queryParams.workingPlanName = params.workingPlanName
    }
    if (params?.status) {
      queryParams.status = params.status
    }

    const response = await getAuditRecordsList(queryParams)
    console.log('获取审核记录列表成功:', response)
    console.log('查询参数:', queryParams)

    let data = response.data?.data?.data || response.data?.data || []
    if (!Array.isArray(data)) {
      data = []
    }

    // 映射字段
    const mappedData = data.map((item, index) => ({
      id: item.id,
      processCode: item.workingPlanId || '',
      processName: item.workingPlanName || '',
      auditStatus: item.status || '',
      applicant: item.applicant?.userName || '',
      submitTime: formatDateTime(item.submitTime || ''),
      index: ((params?.pageNum || 1) - 1) * (params?.pageSize || 10) + index + 1,
    }))

    return {
      data: {
        list: mappedData,
        total: response.data?.data?.total || mappedData.length,
      },
    }
  } catch (error) {
    console.error('获取审核记录列表失败:', error)
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
  <div class="audit-record-container">
    <ProTable ref="proTableRef" :columns="columns" :request-api="getTableList" :init-param="{}">
      <template #auditStatus="scope">
        <el-tag :type="getAuditStatusType(scope.row.auditStatus)">
          {{ getAuditStatusLabel(scope.row.auditStatus) }}
        </el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)"
          >查看详情</el-button
        >
      </template>
    </ProTable>
  </div>
</template>

<style lang="scss" scoped>
.audit-record-container {
  :deep(.table-search) {
    margin-bottom: 16px !important;
  }
}
</style>
