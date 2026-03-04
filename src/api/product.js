import instance from '@/utils/request'

// 获取产品列表（支持条件模糊查询）
export function getProductFind(params) {
  return instance.get('/api/product/find', { params })
}

// 创建产品
export function createProduct(data) {
  return instance.post('/api/product/create', data)
}

// 修改产品
export function updateProduct(data) {
  return instance.put('/api/product/update', data)
}

// 删除产品
export function deleteProduct(productId) {
  return instance.put('/api/product/delete', null, { params: { productId } })
}
