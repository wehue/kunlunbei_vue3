import instance from '@/utils/request'

// 找回密码
export const findPassword = (data) => {
  return instance({
    url: '/api/user/findPassword',
    method: 'POST',
    data,
  })
}

// 获取邮箱验证码
export const getVerifyCode = (params) => {
  return instance({
    url: '/api/user/getVerifyCode',
    method: 'POST',
    params,
  })
}
