import instance from '@/utils/request'

// 获取部门列表
export function getDeptList(params) {
  return instance.get('/api/department/find', { params })
}

// 获取部门详情
export function getDeptDetail(id) {
  return instance.get(`/api/department/${id}`)
}

// 创建部门
export function addDept(data) {
  return instance.post('/api/department/create', data)
}

// 更新部门
export function updateDept(data) {
  return instance.put('/api/department/update', data)
}

// 删除部门
export function deleteDept(departmentId) {
  return instance.put('/api/department/delete', null, { params: { departmentId } })
}

// 检查部门关联
export function checkDeptRelation(id) {
  return instance.get(`/api/department/check-relation/${id}`)
}

// 获取部门选项
export function getDeptOptions() {
  return instance.get('/api/department/getDepartmentOptions')
}
