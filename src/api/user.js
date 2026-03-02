import instance from '@/utils/request'

export function getUserList(params) {
  return instance.get('/api/user/find', { params })
}

export function getUserDetailById(userId) {
  return instance.get('/api/user/findByUserId', { params: { userId } })
}

export function createUser(data) {
  return instance.post('/api/user/create', data)
}

export function addUser(data) {
  return instance.post('/api/user', data)
}

export function updateUser(data) {
  return instance.put('/api/user', data)
}

export function updateUserInfo(data) {
  return instance.put('/api/user/update', data)
}

export function deleteUser(userId) {
  return instance.put('/api/user/delete', null, { params: { userId } })
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
