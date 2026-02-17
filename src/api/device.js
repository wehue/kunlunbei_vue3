import instance from '@/utils/request'

export function getDeviceList(params) {
  return instance.get('/api/device/list', { params })
}

export function getDeviceDetail(id) {
  return instance.get(`/api/device/${id}`)
}

export function addDevice(data) {
  return instance.post('/api/device', data)
}

export function updateDevice(data) {
  return instance.put('/api/device', data)
}

export function deleteDevice(id) {
  return instance.delete(`/api/device/${id}`)
}

export function getBrandList() {
  return instance.get('/api/device/brands')
}

export function getLocationList() {
  return instance.get('/api/device/locations')
}
