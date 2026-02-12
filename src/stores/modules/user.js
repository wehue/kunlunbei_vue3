import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref({
      id: '',
      name: '',
      role: '',
    })

    const roleHomeMap = {
      admin: '/admin-index',
      designer: '/designer-index',
      supervisor: '/supervisor-index',
    }

    const homeUrl = computed(() => {
      return roleHomeMap[userInfo.value.role] || '/admin-index'
    })

    const setToken = (t) => {
      token.value = t
      localStorage.setItem('token', t)
    }

    const setUserInfo = (info) => {
      userInfo.value = info
      localStorage.setItem('userInfo', JSON.stringify(info))
    }

    const logout = () => {
      token.value = ''
      userInfo.value = {
        id: '',
        name: '',
        role: '',
      }
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }

    const initFromStorage = () => {
      const savedToken = localStorage.getItem('token')
      const savedUserInfo = localStorage.getItem('userInfo')
      if (savedToken) {
        token.value = savedToken
      }
      if (savedUserInfo) {
        try {
          userInfo.value = JSON.parse(savedUserInfo)
        } catch (e) {
          console.error('Failed to parse userInfo from storage', e)
        }
      }
    }

    return {
      token,
      userInfo,
      homeUrl,
      setToken,
      setUserInfo,
      logout,
      initFromStorage,
    }
  },
  {
    persist: {
      key: 'kunlun-user',
      storage: localStorage,
    },
  },
)
