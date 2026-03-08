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
