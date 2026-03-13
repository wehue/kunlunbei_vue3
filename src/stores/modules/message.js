import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMessageList, markAllMessagesAsRead, deleteMessages as deleteMessagesApi, getMessageDetail } from '@/api/message'

export const useMessageStore = defineStore('message', () => {
  const messages = ref([])
  const loading = ref(false)

  const unreadCount = computed(() => {
    return messages.value.filter((item) => !item.isRead).length
  })

  const recentMessages = computed(() => {
    return [...messages.value]
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, 5)
  })

  // 从后端获取消息列表
  const fetchMessages = async () => {
    loading.value = true
    try {
      const response = await getMessageList()
      if (response.data && response.data.code === 200) {
        messages.value = response.data.data || []
      }
    } catch (error) {
      console.error('获取消息列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const addMessage = (message) => {
    messages.value.unshift(message)
    return message
  }

  const markAsRead = async (noticeId) => {
    const message = messages.value.find((m) => m.noticeId === noticeId)
    if (message) {
      message.isRead = true
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await markAllMessagesAsRead()
      if (response.data && response.data.code === 200) {
        messages.value.forEach((item) => {
          item.isRead = true
        })
      }
    } catch (error) {
      console.error('标记全部已读失败:', error)
    }
  }

  const deleteMessages = async (noticeIds) => {
    try {
      for (const noticeId of noticeIds) {
        await deleteMessagesApi(noticeId)
      }
      messages.value = messages.value.filter((item) => !noticeIds.includes(item.noticeId))
    } catch (error) {
      console.error('删除消息失败:', error)
    }
  }

  let pollTimer = null
  let lastMessageCount = 0

  const startPolling = (onNewMessage) => {
    if (pollTimer) return

    // 先获取一次初始消息
    fetchMessages().then(() => {
      lastMessageCount = messages.value.length
    })

    pollTimer = setInterval(async () => {
      try {
        await fetchMessages()
        // 检查是否有新消息
        if (messages.value.length > lastMessageCount) {
          const newMessages = messages.value.slice(0, messages.value.length - lastMessageCount)
          lastMessageCount = messages.value.length
          // 触发新消息通知
          if (onNewMessage && newMessages.length > 0) {
            newMessages.forEach(newMsg => {
              onNewMessage(newMsg)
            })
          }
        }
      } catch (error) {
        console.error('轮询获取消息失败:', error)
      }
    }, 30000)
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    messages,
    loading,
    unreadCount,
    recentMessages,
    fetchMessages,
    addMessage,
    markAsRead,
    markAllAsRead,
    deleteMessages,
    startPolling,
    stopPolling,
  }
})
