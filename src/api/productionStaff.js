import instance from '@/utils/request'

// 获取操作人员列表（支持条件模糊查询）·
export function getProductionStaffList(params) {
  return instance.get('/api/productionStaff/find', { params })
}

// 获取操作人员详情（根据ID）
export function getProductionStaffDetail(id) {
  return instance.get(`/api/productionStaff/${id}`)
}

// 添加操作人员
export function addProductionStaff(data) {
  return instance.post('/api/productionStaff/create', data)
}

// 修改操作人员
export function updateProductionStaff(data) {
  return instance.put('/api/productionStaff/update', data)
}

// 删除操作人员
export function deleteProductionStaff(productionStaffId) {
  return instance.delete('/api/productionStaff/delete', { params: { productionStaffId } })
}
