import instance from '@/utils/request'

// 获取用户列表
export function getUserList(params) {
  return instance.get('/api/user/find', { params })
}

// 获取用户详情
export function getUserDetailById(userId) {
  return instance.get('/api/user/findByUserId', { params: { userId } })
}

// 创建用户
export function createUser(data) {
  return instance.post('/api/user/create', data)
}

// 修改用户
export function addUser(data) {
  return instance.post('/api/user', data)
}

// 修改用户信息
export function updateUserInfo(data) {
  return instance.put('/api/user/update', data)
}

// 删除用户
export function deleteUser(userId) {
  return instance.put('/api/user/batch', { ids: [userId], userStatus: 'Deleted' })
}

// 批量冻结用户
export function batchFreezeUsers(ids) {
  return instance.put('/api/user/batch', { ids, userStatus: 'Frozen' })
}

// 批量解冻用户
export function batchUnfreezeUsers(ids) {
  return instance.put('/api/user/batch', { ids, userStatus: 'Active' })
}

// 批量删除用户
export function batchDeleteUsers(ids) {
  return instance.put('/api/user/batch', { ids, userStatus: 'Deleted' })
}

// 重置用户密码
export function resetPassword(userId, password) {
  return instance.put('/api/user/resetPassword', null, { params: { userId, password } })
}

// 切换用户状态
export function toggleUserStatus(id, status) {
  return instance.put(`/api/user/${id}/status`, { status })
}

// 修改密码
export function updatePassword(data) {
  return instance.post('/api/user/updatePassword', data)
}

// 获取管理员首页卡片数据
export function getAdminConsole1() {
  return instance.get('/api/user/adminConsole1')
}

// 获取管理员首页用户登录人次趋势
export function getAdminConsole2() {
  return instance.get('/api/user/adminConsole2')
}
