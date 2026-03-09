import instance from '@/utils/request'

// 获取消息列表
export function getMessageList(params) {
  return instance.get('/api/notice/find', { params })
}

// 删除消息
export function deleteMessages(noticeIds) {
  return instance.delete('/api/message/delete', { data: { noticeIds } })
}

// 标记全部消息已读并获取消息列表
export function markAllMessagesAsRead() {
  return instance.get('/api/notice/find', { params: { READ: 'read' } })
}
