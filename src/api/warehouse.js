import instance from '@/utils/request'

// 获取仓库列表（支持条件模糊查询）
export function getWarehouseList(params) {
  return instance.get('/api/warhouse/find', { params })
}

// 获取仓库详情（根据仓库ID）
export function getWarehouseDetail(warhouseId) {
  return instance.get('/api/warhouse/findByWarhouseId', { params: { warhouseId } })
}

// 创建仓库
export function createWarehouse(data) {
  return instance.post('/api/warhouse/create', data)
}

// 修改仓库
export function updateWarehouse(data) {
  return instance.put('/api/warhouse/update', data)
}

// 删除仓库
export function deleteWarehouse(warhouseId) {
  return instance.put('/api/warhouse/delete', null, { params: { warhouseId } })
}

// 检查仓库关系
export function checkWarehouseRelation(id) {
  return instance.get(`/api/warehouse/check-relation/${id}`)
}

// 获取仓库类型下拉框
export function getWarehouseTypeOptions() {
  return instance.get('/api/warehouse/types')
}
