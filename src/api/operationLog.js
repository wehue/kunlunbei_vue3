import instance from '@/utils/request'

// 获取操作日志列表
export function getOperationLogList(params) {
  return instance.get('/api/operation-log/list', { params })
}

// 导出操作日志
export function exportOperationLog(params) {
  return instance.get('/api/operation-log/export', { params, responseType: 'blob' })
}
