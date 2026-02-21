import instance from '@/utils/request'

export function getProductList(params) {
  return instance.get('/api/product/list', { params })
}

export function getProductDetail(id) {
  return instance.get(`/api/product/${id}`)
}

export function addProduct(data) {
  return instance.post('/api/product', data)
}

export function updateProduct(data) {
  return instance.put('/api/product', data)
}

export function deleteProduct(id) {
  return instance.delete(`/api/product/${id}`)
}
