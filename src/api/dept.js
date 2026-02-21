import instance from '@/utils/request'

export function getDeptList(params) {
  return instance.get('/api/dept/list', { params })
}

export function getDeptDetail(id) {
  return instance.get(`/api/dept/${id}`)
}

export function addDept(data) {
  return instance.post('/api/dept', data)
}

export function updateDept(data) {
  return instance.put('/api/dept', data)
}

export function deleteDept(id) {
  return instance.delete(`/api/dept/${id}`)
}

export function checkDeptRelation(id) {
  return instance.get(`/api/dept/check-relation/${id}`)
}

export function getDeptOptions() {
  return instance.get('/api/dept/options')
}
