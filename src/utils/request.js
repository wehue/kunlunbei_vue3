import { useUserStore } from '@/stores/modules/user'
import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

const baseURL = '/'

const instance = axios.create({
  baseURL,
  timeout: 100000,
})

// 创建 userStore 实例
const userStore = useUserStore()

instance.interceptors.request.use(
  (config) => {
    if (userStore.token) {
      // 添加 X-AUTH-TOKEN 和 token 头
      config.headers['X-AUTH-TOKEN'] = userStore.token
      config.headers.token = userStore.token
    }
    return config
  },
  (err) => Promise.reject(err),
)

instance.interceptors.response.use(
  (res) => {
    // 检测并更新token
    if (res.data && res.data.token) {
      userStore.token = res.data.token
    }
    
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
