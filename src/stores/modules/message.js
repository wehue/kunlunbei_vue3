import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMessageStore = defineStore('message', () => {
  const messages = ref([
    {
      id: 1,
      messageCode: 'MSG20240115001',
      title: '工艺路线审核结果通知',
      summary: '您提交的"智能手机组装工艺路线"新增申请已通过审核',
      auditStatus: '已通过',
      processCode: 'PR001',
      processName: '智能手机组装工艺路线',
      operationType: '新增',
      sendTime: '2024-01-15 14:20:00',
      isRead: false,
    },
    {
      id: 2,
      messageCode: 'MSG20240115002',
      title: '工艺路线审核结果通知',
      summary: '您提交的"平板电脑组装工艺路线"修改申请已被驳回',
      auditStatus: '已驳回',
      processCode: 'PR002',
      processName: '平板电脑组装工艺路线',
      operationType: '修改',
      sendTime: '2024-01-15 16:30:00',
      isRead: false,
    },
    {
      id: 3,
      messageCode: 'MSG20240116001',
      title: '工艺路线审核结果通知',
      summary: '您提交的"智能手表组装工艺路线"新增申请已通过审核',
      auditStatus: '已通过',
      processCode: 'PR003',
      processName: '智能手表组装工艺路线',
      operationType: '新增',
      sendTime: '2024-01-16 15:45:00',
      isRead: true,
    },
    {
      id: 4,
      messageCode: 'MSG20240117001',
      title: '工艺路线审核结果通知',
      summary: '您提交的"蓝牙耳机制造工艺路线"新增申请已被驳回',
      auditStatus: '已驳回',
      processCode: 'PR004',
      processName: '蓝牙耳机制造工艺路线',
      operationType: '新增',
      sendTime: '2024-01-17 17:10:00',
      isRead: true,
    },
    {
      id: 5,
      messageCode: 'MSG20240118001',
      title: '工艺路线审核结果通知',
      summary: '您提交的"充电器生产工艺路线"修改申请已通过审核',
      auditStatus: '已通过',
      processCode: 'PR005',
      processName: '充电器生产工艺路线',
      operationType: '修改',
      sendTime: '2024-01-18 18:00:00',
      isRead: true,
    },
  ])

  const unreadCount = computed(() => {
    return messages.value.filter((item) => !item.isRead).length
  })

  const recentMessages = computed(() => {
    return [...messages.value]
      .sort((a, b) => new Date(b.sendTime) - new Date(a.sendTime))
      .slice(0, 5)
  })

  const addMessage = (message) => {
    const newId = Math.max(...messages.value.map((m) => m.id), 0) + 1
    const newMessage = {
      id: newId,
      messageCode: `MSG${Date.now()}`,
      isRead: false,
      sendTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      ...message,
    }
    messages.value.unshift(newMessage)
    return newMessage
  }

  const markAsRead = (id) => {
    const message = messages.value.find((m) => m.id === id)
    if (message) {
      message.isRead = true
    }
  }

  const markAllAsRead = () => {
    messages.value.forEach((item) => {
      item.isRead = true
    })
  }

  const deleteMessages = (ids) => {
    messages.value = messages.value.filter((item) => !ids.includes(item.id))
  }

  const mockNewMessages = [
    {
      title: '工艺路线审核结果通知',
      summary: '您提交的"汽车零部件加工工艺路线"新增申请已通过审核',
      auditStatus: '已通过',
      processCode: 'PR006',
      processName: '汽车零部件加工工艺路线',
      operationType: '新增',
    },
    {
      title: '工艺路线审核结果通知',
      summary: '您提交的"电子元件焊接工艺路线"修改申请已被驳回，请修改后重新提交',
      auditStatus: '已驳回',
      processCode: 'PR007',
      processName: '电子元件焊接工艺路线',
      operationType: '修改',
    },
    {
      title: '工艺路线审核结果通知',
      summary: '您提交的"精密模具制造工艺路线"新增申请已通过审核',
      auditStatus: '已通过',
      processCode: 'PR008',
      processName: '精密模具制造工艺路线',
      operationType: '新增',
    },
    {
      title: '工艺路线审核结果通知',
      summary: '您提交的"钣金件冲压工艺路线"修改申请已被驳回',
      auditStatus: '已驳回',
      processCode: 'PR009',
      processName: '钣金件冲压工艺路线',
      operationType: '修改',
    },
    {
      title: '工艺路线审核结果通知',
      summary: '您提交的"塑料件注塑工艺路线"新增申请已通过审核',
      auditStatus: '已通过',
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
          summary: mockMessage.summary.replace('您提交的', `您提交的"${mockMessage.processName}"`),
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
