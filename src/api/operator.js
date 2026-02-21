import instance from '@/utils/request'

export function getOperatorList(params) {
  return instance.get('/api/operator/list', { params })
}

export function getOperatorDetail(id) {
  return instance.get(`/api/operator/${id}`)
}

export function addOperator(data) {
  return instance.post('/api/operator', data)
}

export function updateOperator(data) {
  return instance.put('/api/operator', data)
}

export function deleteOperator(id) {
  return instance.delete(`/api/operator/${id}`)
}
