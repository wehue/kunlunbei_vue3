import instance from '@/utils/request'

// 获取待审核列表
export function getPendingList() {
  return instance.get('/api/audit/pending/list')
}

// 批量审核
export function batchAudit(data) {
  return instance.put('/audit/batch', data)
}

// 查询审核记录列表
export function getAuditRecords(params) {
  return instance.get('/audit/records', { params })
}

// 查询审核详情
export function getAuditDetail(id) {
  return instance.get(`/audit/detail/${id}`)
}
