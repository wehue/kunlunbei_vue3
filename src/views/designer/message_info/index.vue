<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Check, Delete, Refresh } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import { useMessageStore } from '@/stores/modules/message'

const router = useRouter()
const messageStore = useMessageStore()

const proTableRef = ref()
const filterType = ref('all')
const selectedList = ref([])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'title', label: '消息标题', minWidth: 180 },
  { prop: 'summary', label: '消息摘要', minWidth: 280 },
  { prop: 'auditStatus', label: '审核状态', width: 100 },
  { prop: 'sendTime', label: '发送时间', minWidth: 160 },
  { prop: 'operation', label: '操作', width: 100, fixed: 'right' },
])

const unreadCount = computed(() => messageStore.unreadCount)
const messages = computed(() => messageStore.messages)

const handleFilterChange = (type) => {
  filterType.value = type
  proTableRef.value?.getTableList()
}

const handleView = (row) => {
  messageStore.markAsRead(row.id)
  router.push(`/message-manage/message-detail/${row.id}`)
}

const handleMarkAsRead = (row) => {
  messageStore.markAsRead(row.id)
  ElMessage.success('已标记为已读')
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
    const deleteIds = selectedList.value.map((item) => item.id)
    messageStore.deleteMessages(deleteIds)
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch {
    // 用户取消
  }
}

const handleMarkAllAsRead = () => {
  messageStore.markAllAsRead()
  ElMessage.success('已将所有消息标记为已读')
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
  proTableRef.value?.getTableList()
}

const filterData = (data) => {
  let filteredData = [...data]

  if (filterType.value === 'unread') {
    filteredData = filteredData.filter((item) => !item.isRead)
  } else if (filterType.value === 'read') {
    filteredData = filteredData.filter((item) => item.isRead)
  }

  filteredData.sort((a, b) => new Date(b.sendTime) - new Date(a.sendTime))

  return filteredData
}

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredData = filterData(messages.value)

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

const getAuditStatusType = (status) => {
  switch (status) {
    case '已通过':
      return 'success'
    case '已驳回':
      return 'danger'
    default:
      return 'info'
  }
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
      <template #title="scope">
        <div class="message-title" :class="{ unread: !scope.row.isRead }">
          <span class="unread-dot" v-if="!scope.row.isRead"></span>
          {{ scope.row.title }}
        </div>
      </template>

      <template #summary="scope">
        <div class="message-summary" :class="{ unread: !scope.row.isRead }">
          {{ scope.row.summary }}
        </div>
      </template>

      <template #auditStatus="scope">
        <el-tag :type="getAuditStatusType(scope.row.auditStatus)" size="default">
          {{ scope.row.auditStatus }}
        </el-tag>
      </template>

      <template #sendTime="scope">
        <div class="send-time" :class="{ unread: !scope.row.isRead }">
          {{ scope.row.sendTime }}
        </div>
      </template>

      <template #operation="scope">
        <div class="operation-buttons">
          <el-button type="primary" link :icon="View" @click="handleView(scope.row)"
            >查看详情</el-button
          >
          <el-button
            v-if="!scope.row.isRead"
            type="success"
            link
            :icon="Check"
            @click="handleMarkAsRead(scope.row)"
            >标为已读</el-button
          >
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

  .message-summary {
    font-size: 13px;
    color: #909399;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

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

  .operation-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
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
