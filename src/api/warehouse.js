import instance from '@/utils/request'

export function getWarehouseList() {
  return instance.get('/api/warhouse/find')
}

export function getWarehouseDetail(warhouseId) {
  return instance.get('/api/warhouse/findByWarhouseId', { params: { warhouseId } })
}

export function createWarehouse(data) {
  return instance.post('/api/warhouse/create', data)
}

export function updateWarehouse(data) {
  return instance.put('/api/warhouse/update', data)
}

export function deleteWarehouse(warhouseId) {
  return instance.put('/api/warhouse/delete', null, { params: { warhouseId } })
}

export function checkWarehouseRelation(id) {
  return instance.get(`/api/warehouse/check-relation/${id}`)
}

export function getWarehouseTypeOptions() {
  return instance.get('/api/warehouse/types')
}
