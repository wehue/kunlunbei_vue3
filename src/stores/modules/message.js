import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMessageStore = defineStore('message', () => {
  const messages = ref([
    {
      noticeId: 1,
      messageCode: 'MSG20240115001',
      noticeTitle: {
        workingPlanName: '工艺路线审核结果通知',
        status: '已通过',
      },
      summary: '您提交的"智能手机组装工艺路线"新增申请已通过审核',
      processCode: 'PR001',
      processName: '智能手机组装工艺路线',
      operationType: '新增',
      createTime: '2024-01-15 14:20:00',
      isRead: false,
    },
    {
      noticeId: 2,
      messageCode: 'MSG20240115002',
      noticeTitle: {
        workingPlanName: '工艺路线审核结果通知',
        status: '已驳回',
      },
      summary: '您提交的"平板电脑组装工艺路线"修改申请已被驳回',
      processCode: 'PR002',
      processName: '平板电脑组装工艺路线',
      operationType: '修改',
      createTime: '2024-01-15 16:30:00',
      isRead: false,
    },
    {
      noticeId: 3,
      messageCode: 'MSG20240116001',
      noticeTitle: {
        workingPlanName: '工艺路线审核结果通知',
        status: '已通过',
      },
      summary: '您提交的"智能手表组装工艺路线"新增申请已通过审核',
      processCode: 'PR003',
      processName: '智能手表组装工艺路线',
      operationType: '新增',
      createTime: '2024-01-16 15:45:00',
      isRead: true,
    },
    {
      noticeId: 4,
      messageCode: 'MSG20240117001',
      noticeTitle: {
        workingPlanName: '工艺路线审核结果通知',
        status: '已驳回',
      },
      summary: '您提交的"蓝牙耳机制造工艺路线"新增申请已被驳回',
      processCode: 'PR004',
      processName: '蓝牙耳机制造工艺路线',
      operationType: '新增',
      createTime: '2024-01-17 17:10:00',
      isRead: true,
    },
    {
      noticeId: 5,
      messageCode: 'MSG20240118001',
      noticeTitle: {
        workingPlanName: '工艺路线审核结果通知',
        status: '已通过',
      },
      summary: '您提交的"充电器生产工艺路线"修改申请已通过审核',
      processCode: 'PR005',
      processName: '充电器生产工艺路线',
      operationType: '修改',
      createTime: '2024-01-18 18:00:00',
      isRead: true,
    },
  ])

  const unreadCount = computed(() => {
    return messages.value.filter((item) => !item.isRead).length
  })

  const recentMessages = computed(() => {
    return [...messages.value]
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, 5)
  })

  const addMessage = (message) => {
    const newNoticeId = Math.max(...messages.value.map((m) => m.noticeId), 0) + 1
    const newMessage = {
      noticeId: newNoticeId,
      messageCode: `MSG${Date.now()}`,
      isRead: false,
      createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ...message,
    }
    messages.value.unshift(newMessage)
    return newMessage
  }

  const markAsRead = (noticeId) => {
    const message = messages.value.find((m) => m.noticeId === noticeId)
    if (message) {
      message.isRead = true
    }
  }

  const markAllAsRead = () => {
    messages.value.forEach((item) => {
      item.isRead = true
    })
  }

  const deleteMessages = (noticeIds) => {
    messages.value = messages.value.filter((item) => !noticeIds.includes(item.noticeId))
  }

  const mockNewMessages = [
    {
      noticeTitle: {
        workingPlanName: '工艺路线审核结果通知',
        status: '已通过',
      },
      summary: '您提交的"汽车零部件加工工艺路线"新增申请已通过审核',
      processCode: 'PR006',
      processName: '汽车零部件加工工艺路线',
      operationType: '新增',
    },
    {
      noticeTitle: {
        workingPlanName: '工艺路线审核结果通知',
        status: '已驳回',
      },
      summary: '您提交的"电子元件焊接工艺路线"修改申请已被驳回，请修改后重新提交',
      processCode: 'PR007',
      processName: '电子元件焊接工艺路线',
      operationType: '修改',
    },
    {
      noticeTitle: {
        workingPlanName: '工艺路线审核结果通知',
        status: '已通过',
      },
      summary: '您提交的"精密模具制造工艺路线"新增申请已通过审核',
      processCode: 'PR008',
      processName: '精密模具制造工艺路线',
      operationType: '新增',
    },
    {
      noticeTitle: {
        workingPlanName: '工艺路线审核结果通知',
        status: '已驳回',
      },
      summary: '您提交的"钣金件冲压工艺路线"修改申请已被驳回',
      processCode: 'PR009',
      processName: '钣金件冲压工艺路线',
      operationType: '修改',
    },
    {
      noticeTitle: {
        workingPlanName: '工艺路线审核结果通知',
        status: '已通过',
      },
      summary: '您提交的"塑料件注塑工艺路线"新增申请已通过审核',
      processCode: 'PR010',
      processName: '塑料件注塑工艺路线',
      operationType: '新增',
    },
  ]

  let pollTimer = null
  let messageIndex = 0

  const startPolling = (onNewMessage) => {
    if (pollTimer) return

    pollTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        const mockMessage = mockNewMessages[messageIndex % mockNewMessages.length]
        messageIndex++
        const newMsg = addMessage({
          ...mockMessage,
        })
        if (onNewMessage) {
          onNewMessage(newMsg)
        }
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
    unreadCount,
    recentMessages,
    addMessage,
    markAsRead,
    markAllAsRead,
    deleteMessages,
    startPolling,
    stopPolling,
  }
})
