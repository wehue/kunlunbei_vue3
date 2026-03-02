import instance from '@/utils/request'

export function getProductFind() {
  return instance.get('/api/product/find')
}

export function createProduct(data) {
  return instance.post('/api/product/create', data)
}

export function updateProduct(data) {
  return instance.put('/api/product/update', data)
}

export function deleteProduct(productId) {
  return instance.put('/api/product/delete', null, { params: { productId } })
}
