import instance from '@/utils/request'

// 获取注册验证码
export const getRegisterVerifyCode = (email) => {
  return instance.post(
    '/api/user/getRegisterVerifyCode',
    {},
    {
      params: { email },
    },
  )
}

// 用户注册
export const registerUser = (data) => {
  return instance.post('/api/user/register', data)
}
