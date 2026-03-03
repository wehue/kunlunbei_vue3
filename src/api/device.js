import instance from '@/utils/request'

// 获取设备列表
export function getDeviceList(params) {
  return instance.get('/api/equipment/find', { params })
}

// 获取设备详情
export function getDeviceDetailByEquipmentId(equipmentId) {
  return instance.get('/api/equipment/findByEquipmentId', { params: { equipmentId } })
}

// 添加设备
export function addDevice(data) {
  return instance.post('/api/equipment/create', data)
}

// 修改设备
export function updateDevice(data) {
  return instance.put('/api/equipment/update', data)
}

// 删除设备
export function deleteDevice(equipmentId) {
  return instance.put('/api/equipment/delete', {}, { params: { equipmentId } })
}

// 获取品牌列表
export function getBrandList() {
  return instance.get('/api/equipment/queryEquipmentBrand')
}

// 获取位置列表
export function getLocationList() {
  return instance.get('/api/equipment/queryEquipmentLocation')
}
