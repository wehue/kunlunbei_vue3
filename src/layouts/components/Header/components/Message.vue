<template>
  <div class="message">
    <el-popover placement="bottom" :width="360" trigger="click" v-model:visible="popoverVisible">
      <template #reference>
        <el-badge :value="unreadCount" class="item" :hidden="unreadCount === 0" :max="99">
          <el-icon class="toolBar-icon"><Bell /></el-icon>
        </el-badge>
      </template>
      <div class="message-popover">
        <div class="message-header">
          <span class="title">消息通知</span>
          <el-button type="primary" link size="small" @click="handleMarkAllRead">
            全部已读
          </el-button>
        </div>
        <div class="message-list" v-if="recentMessages.length > 0">
          <div
            v-for="item in recentMessages"
            :key="item.id"
            class="message-item"
            :class="{ unread: !item.isRead }"
            @click="handleMessageClick(item)"
          >
            <div class="message-icon">
              <el-icon :class="item.auditStatus === '已通过' ? 'success' : 'danger'">
                <CircleCheck v-if="item.auditStatus === '已通过'" />
                <CircleClose v-else />
              </el-icon>
            </div>
            <div class="message-content">
              <div class="message-title">
                <span class="unread-dot" v-if="!item.isRead"></span>
                {{ item.title }}
              </div>
              <div class="message-summary">{{ item.summary }}</div>
              <div class="message-time">{{ item.sendTime }}</div>
            </div>
          </div>
        </div>
        <div class="message-empty" v-else>
          <el-empty description="暂无消息" :image-size="80" />
        </div>
        <div class="message-footer">
          <el-button type="primary" link @click="handleViewAll">查看全部消息</el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores/modules/message'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()

const popoverVisible = ref(false)

const unreadCount = computed(() => messageStore.unreadCount)
const recentMessages = computed(() => messageStore.recentMessages)

const handleMessageClick = (item) => {
  messageStore.markAsRead(item.id)
  popoverVisible.value = false
  router.push(`/message-manage/message-detail/${item.id}`)
}

const handleMarkAllRead = () => {
  messageStore.markAllAsRead()
}

const handleViewAll = () => {
  popoverVisible.value = false
  router.push('/message-manage/message-info')
}
</script>

<style scoped lang="scss">
.message {
  .toolBar-icon {
    font-size: 20px;
    color: var(--el-header-text-color);
    cursor: pointer;
  }

  :deep(.el-badge__content) {
    border: none;
  }
}

.message-popover {
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 12px;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .message-list {
    max-height: 320px;
    overflow-y: auto;

    .message-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;
      }

      &.unread {
        background-color: #f0f9ff;

        &:hover {
          background-color: #e6f4ff;
        }
      }

      .message-icon {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: 20px;

          &.success {
            color: #67c23a;
          }

          &.danger {
            color: #f56c6c;
          }
        }
      }

      .message-content {
        flex: 1;
        min-width: 0;

        .message-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;

          .unread-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #f56c6c;
            flex-shrink: 0;
          }
        }

        .message-summary {
          font-size: 13px;
          color: #606266;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 4px;
        }

        .message-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .message-empty {
    padding: 20px 0;
  }

  .message-footer {
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
    margin-top: 12px;
    text-align: center;
  }
}
</style>
