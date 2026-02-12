import instance from '@/utils/request'

export default {
  login(data) {
    return instance.post('/api/login', data)
  },
  
  getUserInfo(id) {
    return instance.get('/api/user/info', { params: { id } })
  },
  
  updateUserInfo(data) {
    return instance.put('/api/user/update', data)
  }
}
