import instance from '@/utils/request'

export function getOperationLogList(params) {
  return instance.get('/api/operation-log/list', { params })
}

export function exportOperationLog(params) {
  return instance.get('/api/operation-log/export', { params, responseType: 'blob' })
}
