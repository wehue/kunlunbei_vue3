import instance from '@/utils/request'

export function getDeptList(params) {
  return instance.get('/api/department/find', { params })
}

export function getDeptDetail(id) {
  return instance.get(`/api/department/${id}`)
}

export function addDept(data) {
  return instance.post('/api/department/create', data)
}

export function updateDept(data) {
  return instance.put('/api/department/update', data)
}

export function deleteDept(departmentId) {
  return instance.put('/api/department/delete', null, { params: { departmentId } })
}

export function checkDeptRelation(id) {
  return instance.get(`/api/department/check-relation/${id}`)
}

export function getDeptOptions() {
  return instance.get('/api/department/getDepartmentOptions')
}
