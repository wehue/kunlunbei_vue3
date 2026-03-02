import { useUserStore } from '@/stores'
import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

const baseURL = '/'

const instance = axios.create({
  baseURL,
  timeout: 100000,
})

instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  (err) => Promise.reject(err),
)

instance.interceptors.response.use(
  (res) => {
    const code = res.data.code
    if (code === 0 || code === 200 || Array.isArray(res.data)) {
      return res
    }
    if (code !== undefined) {
      ElMessage({ message: res.data.message || '服务异常', type: 'error' })
      return Promise.reject(res.data)
    }
    return res
  },
  (err) => {
    ElMessage({ message: err.response?.data?.message || '服务异常', type: 'error' })
    console.log(err)
    if (err.response?.status === 401) {
      router.push('/login')
    }
    return Promise.reject(err)
  },
)

export default instance
export { baseURL }
