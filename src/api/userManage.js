import instance from '@/utils/request'

export function getUserList(params) {
  return instance.get('/api/user/list', { params })
}

export function getUserDetail(id) {
  return instance.get(`/api/user/${id}`)
}

export function addUser(data) {
  return instance.post('/api/user', data)
}

export function updateUser(data) {
  return instance.put('/api/user', data)
}

export function deleteUser(id) {
  return instance.delete(`/api/user/${id}`)
}

export function batchFreezeUsers(ids) {
  return instance.put('/api/user/batch-freeze', { ids })
}

export function batchUnfreezeUsers(ids) {
  return instance.put('/api/user/batch-unfreeze', { ids })
}

export function batchDeleteUsers(ids) {
  return instance.put('/api/user/batch-delete', { ids })
}

export function resetPassword(id, data) {
  return instance.put(`/api/user/${id}/reset-password`, data)
}

export function toggleUserStatus(id, status) {
  return instance.put(`/api/user/${id}/status`, { status })
}
