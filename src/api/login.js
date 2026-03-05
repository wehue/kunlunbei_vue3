import instance from '@/utils/request'

// 用户登录
export function userLogin(data) {
  return instance.post('/api/user/login', data)
}

// 用户登出
export function userLogout() {
  return instance.post('/api/user/logout')
}

// 刷新Token
export function refreshToken(data) {
  return instance.post('/api/v1/auth/refresh-token', data)
}
