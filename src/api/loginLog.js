import instance from '@/utils/request'

// 获取登录日志列表
export function getLoginLogList(params) {
  return instance.get('/api/login-log/list', { params })
}

// 导出登录日志
export function exportLoginLog(params) {
  return instance.get('/api/login-log/export', { params, responseType: 'blob' })
}
