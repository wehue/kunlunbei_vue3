import instance from '@/utils/request'

export function getWarehouseList(params) {
  return instance.get('/api/warehouse/list', { params })
}

export function getWarehouseDetail(id) {
  return instance.get(`/api/warehouse/${id}`)
}

export function addWarehouse(data) {
  return instance.post('/api/warehouse', data)
}

export function updateWarehouse(data) {
  return instance.put('/api/warehouse', data)
}

export function deleteWarehouse(id) {
  return instance.delete(`/api/warehouse/${id}`)
}

export function checkWarehouseRelation(id) {
  return instance.get(`/api/warehouse/check-relation/${id}`)
}

export function getWarehouseTypeOptions() {
  return instance.get('/api/warehouse/types')
}
