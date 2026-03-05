import instance from '@/utils/request'

// 获取部件（物料）分类列表
export function getPartCategoryList() {
  return instance.get('/api/partCategory/find')
}
// 添加部件（物料）分类
export function addPartCategory(data) {
  return instance.post('/api/partCategory/create', data)
}
// 删除部件（物料）分类
export function deletePartCategory(categoryId) {
  return instance.put('/api/partCategory/delete', {}, { params: { categoryId } })
}
// 修改部件（物料）分类
export function updatePartCategory(data) {
  return instance.put('/api/partCategory/update', data)
}

// 获取部件（物料）列表
export function getPartList(params) {
  return instance.get('/api/part/find', { params })
}

// 获取部件（物料）详情
export function getPartDetail(id) {
  return instance.get('/api/part/findById', { params: { id } })
}

// 添加部件（物料）
export function addPart(data) {
  return instance.post('/api/part/create', data)
}

// 删除部件（物料）
export function deletePart(data) {
  return instance.put('/api/part/delete', data)
}

// 修改部件（物料）
export function updatePart(data) {
  return instance.put('/api/part/update', data)
}
