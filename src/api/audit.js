import instance from '@/utils/request'

// 获取待审核列表
export function getPendingList(params) {
  return instance.get('/api/audit/pending/list', { params })
}

// 获取审核记录列表
export function getAuditRecordsList(params) {
  return instance.get('/api/audit/record/list', { params })
}

// 获取待办审核详情（根据工艺路线ID）
export function getPendingAuditDetail(workingPlanId) {
  return instance.get('/api/audit/findByWorkingPlanId', { params: { workingPlanId } })
}

// 通过审核
export function approveAudit(data) {
  return instance.put('/api/audit/approve', data)
}

// 驳回审核
export function rejectAudit(data) {
  return instance.put('/api/audit/reject', data)
}


