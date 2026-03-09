import instance from '@/utils/request'

// 获取工序列表
export function getProcessList(params) {
  return instance.get('/api/workingProcedure/find', { params })
}

// 创建工序
export function createProcess(data) {
  return instance.post('/api/workingProcedure/create', data)
}

// 获取工序详情
export function getProcessDetail(params) {
  return instance.get('/api/workingProcedure/findByWorkingProcedureId', { params })
}

// 更新工序
export function updateProcess(data) {
  return instance.put('/api/workingProcedure/update', data)
}

// 删除工序
export function deleteProcess(params) {
  return instance.put('/api/workingProcedure/delete', {}, { params })
}

// 创建工艺路线
export function createProcessRoute(data) {
  return instance.post('/api/workingPlan/create', data)
}

// 获取工艺路线列表
export function getProcessRouteList(params) {
  return instance.get('/api/workingPlan/find', { params })
}

// 获取工艺路线详情
export function getProcessRouteDetail(params) {
  return instance.get('/api/workingPlan/findByWorkingPlanId', { params })
}

// 更新工艺路线
export function updateProcessRoute(data) {
  return instance.put('/api/workingPlan/update', data)
}

// 删除工艺路线
export function deleteProcessRoute(params) {
  return instance.put('/api/workingPlan/delete', {}, { params })
}