import instance from '@/utils/request'

// 获取工序列表
export function getProcessList(params) {
  return instance.get('/api/workingProcedure/find', { params })
}

// 创建工序
export function createProcess(data) {
  return instance.post('/api/workingProcedure/create', data)
}

// 更新工序
export function updateProcess(data) {
  return instance.put('/api/workingProcedure/update', data)
}
