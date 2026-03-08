import instance from '@/utils/request'

// 获取工序列表
export function getProcessList(params) {
  return instance.get('/api/workingProcedure/find', { params })
}
