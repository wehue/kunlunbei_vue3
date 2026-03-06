import instance from '@/utils/request'

// 获取登录日志列表
export function getLoginLogList(params) {
  return instance.get('/api/loginLogs/find', { params })
}

// 导出登录日志
export function exportLoginLog(params) {
  return instance.get('/api/loginLogs/export', { params, responseType: 'blob' })
}
