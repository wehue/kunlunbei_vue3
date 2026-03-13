<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Delete, Refresh } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import { useMessageStore } from '@/stores/modules/message'
import { getMessageList, deleteMessages, markAllMessagesAsRead } from '@/api/message'

const messageStore = useMessageStore()

const proTableRef = ref()
const filterType = ref('all')
const selectedList = ref([])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'noticeId', label: '消息编码', minWidth: 80 },
  { prop: 'workingPlanName', label: '消息标题', minWidth: 180 },
  { prop: 'noticeStatus', label: '审核状态', width: 160 },
  { prop: 'createTime', label: '接收时间', minWidth: 160 },
])

const allMessages = ref([])

const unreadCount = computed(() => {
  return allMessages.value.filter((item) => !item.isRead).length
})

const messages = computed(() => allMessages.value)

const handleFilterChange = (type) => {
  filterType.value = type
  proTableRef.value?.getTableList()
}

const handleDeleteSelected = async () => {
  if (selectedList.value.length === 0) {
    ElMessage.warning('请先选择要删除的消息')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedList.value.length} 条消息吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // 逐个删除消息
    for (const item of selectedList.value) {
      await deleteMessages(item.noticeId)
    }

    const deleteIds = selectedList.value.map((item) => item.noticeId)
    messageStore.deleteMessages(deleteIds)
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
    // 用户取消
  }
}

const handleMarkAllAsRead = async () => {
  try {
    await markAllMessagesAsRead()
    messageStore.markAllAsRead()
    ElMessage.success('已将所有消息标记为已读')
    proTableRef.value?.getTableList()
  } catch (error) {
    ElMessage.error('标记全部已读失败')
  }
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
  proTableRef.value?.getTableList()
}

const getTableList = async (params) => {
  try {
    const response = await getMessageList(params)
    console.log('获取消息列表成功', response)

    // 确保 list 是一个数组，根据实际返回结构获取数据
    const list = Array.isArray(response.data.data?.data) ? response.data.data.data : []
    const total = list.length

    // 状态枚举映射
    const statusMap = {
      W: '待提交',
      F: '审核中',
      T: '已通过',
      Y: '已驳回',
    }

    // 添加序号和转换数据结构
    const dataWithIndex = list.map((item, index) => {
      // 获取状态值并转换
      const statusValue = item.noticeTitle?.status || ''
      const statusText = statusMap[statusValue] || statusValue || '未知状态'

      return {
        ...item,
        index: ((params?.pageNum || 1) - 1) * (params?.pageSize || 10) + index + 1,
        // 映射字段
        noticeId: item.noticeId,
        isRead: item.description === '已读',
        workingPlanName:
          item.noticeTitle?.workingPlanName ||
          item.noticeTitle?.name ||
          item.noticeTitle?.title ||
          '消息通知',
        noticeStatus: statusText,
        createTime: formatDate(item.createTime) || '',
      }
    })

    // 存储转换后的消息数据用于计算数量
    allMessages.value = dataWithIndex

    // 根据 filterType 进行筛选
    let filteredData = [...dataWithIndex]
    if (filterType.value === 'unread') {
      filteredData = filteredData.filter((item) => !item.isRead)
    } else if (filterType.value === 'read') {
      filteredData = filteredData.filter((item) => item.isRead)
    }

    // 直接返回数据，符合 useTable hook 的期望
    const result = {
      data: {
        list: filteredData,
        total: filteredData.length,
      },
    }
    return result
  } catch (error) {
    console.error('获取消息列表失败:', error)
    ElMessage.error('获取消息列表失败')
    return {
      data: {
        list: [],
        total: 0,
      },
    }
  }
}

const getAuditStatusType = (status) => {
  switch (status) {
    case 'T':
    case '已通过':
      return 'success'
    case 'Y':
    case '已驳回':
      return 'danger'
    case 'F':
    case '审核中':
      return 'warning'
    case 'W':
    case '待提交':
      return 'info'
    default:
      return 'info'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const handleSelectionChange = (selection) => {
  selectedList.value = selection
}
</script>

<template>
  <div class="message-info-container">
    <div class="page-header">
      <h2 class="page-title">消息通知</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新</el-button>
        <el-button :icon="Check" @click="handleMarkAllAsRead">全部标为已读</el-button>
        <el-button type="danger" :icon="Delete" @click="handleDeleteSelected">删除选中</el-button>
      </div>
    </div>

    <div class="filter-tabs">
      <el-radio-group v-model="filterType" @change="handleFilterChange">
        <el-radio-button value="all">
          全部消息
          <el-badge v-if="messages.length" :value="messages.length" class="tab-badge" />
        </el-radio-button>
        <el-radio-button value="unread">
          未读消息
          <el-badge v-if="unreadCount" :value="unreadCount" class="tab-badge" type="danger" />
        </el-radio-button>
        <el-radio-button value="read">已读消息</el-radio-button>
      </el-radio-group>
    </div>

    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{}"
      :search-config="{ show: false }"
      @selection-change="handleSelectionChange"
    >
      <template #workingPlanName="scope">
        <div class="message-title" :class="{ unread: !scope.row.isRead }">
          <span class="unread-dot" v-if="!scope.row.isRead"></span>
          审核工艺路线：
          {{ scope.row.workingPlanName }}
        </div>
      </template>

      <template #noticeId="scope">
        <div class="message-id" :class="{ unread: !scope.row.isRead }">
          {{ scope.row.noticeId }}
        </div>
      </template>

      <template #noticeStatus="scope">
        <el-tag :type="getAuditStatusType(scope.row.noticeStatus)" size="default">
          {{ scope.row.noticeStatus }}
        </el-tag>
      </template>

      <template #createTime="scope">
        <div class="send-time" :class="{ unread: !scope.row.isRead }">
          {{ formatDate(scope.row.createTime) }}
        </div>
      </template>
    </ProTable>
  </div>
</template>

<style lang="scss" scoped>
.message-info-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px 20px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .page-title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .filter-tabs {
    margin-bottom: 16px;
    padding: 12px 20px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .el-radio-group {
      display: flex;
      gap: 0;
    }

    .tab-badge {
      margin-left: 6px;

      :deep(.el-badge__content) {
        height: 16px;
        line-height: 16px;
        padding: 0 5px;
        font-size: 11px;
      }
    }
  }

  .message-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    color: #606266;

    &.unread {
      font-weight: 600;
      color: #303133;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f56c6c;
      flex-shrink: 0;
    }
  }

  .message-id {
    font-size: 13px;
    color: #909399;

    &.unread {
      color: #606266;
    }
  }

  .send-time {
    font-size: 13px;
    color: #909399;

    &.unread {
      color: #606266;
    }
  }

  :deep(.el-table__row) {
    &.unread-row {
      background-color: #f0f9ff;
    }
  }

  :deep(.table-search) {
    display: none;
  }
}
</style>
