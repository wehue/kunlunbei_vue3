import instance from '@/utils/request'

export function getProductionStaffList(params) {
  return instance.get('/api/productionStaff/find', { params })
}

export function getProductionStaffDetail(id) {
  return instance.get(`/api/productionStaff/${id}`)
}

export function addProductionStaff(data) {
  return instance.post('/api/productionStaff/create', data)
}

export function updateProductionStaff(data) {
  return instance.put('/api/productionStaff/update', data)
}

export function deleteProductionStaff(productionStaffId) {
  return instance.delete('/api/productionStaff/delete', { params: { productionStaffId } })
}
