import instance from '@/utils/request'

export function getDeviceList(params) {
  return instance.get('/api/equipment/find', { params })
}

export function getDeviceDetail(id) {
  return instance.get(`/api/equipment/${id}`)
}

export function addDevice(data) {
  return instance.post('/api/equipment', data)
}

export function updateDevice(data) {
  return instance.put('/api/equipment', data)
}

export function deleteDevice(id) {
  return instance.delete(`/api/equipment/${id}`)
}

export function getBrandList() {
  return instance.get('/api/device/brands')
}

export function getLocationList() {
  return instance.get('/api/device/locations')
}
