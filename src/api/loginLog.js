import instance from '@/utils/request'

export function getLoginLogList(params) {
  return instance.get('/api/login-log/list', { params })
}

export function exportLoginLog(params) {
  return instance.get('/api/login-log/export', { params, responseType: 'blob' })
}
