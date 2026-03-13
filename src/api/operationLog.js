import instance from '@/utils/request'

// 查询操作日志列表
export function getOperationLogsList(params) {
  return instance.get('/api/operationLog/find', { params })
}
