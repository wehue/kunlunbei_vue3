import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './auth'

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
      // 当用户角色变化时，重新获取菜单
      if (info.role) {
        const authStore = useAuthStore()
        authStore.getAuthMenuList()
      }
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
      // 退出登录时清空菜单
      const authStore = useAuthStore()
      authStore.setAuthMenuList([])
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
          // 初始化时获取菜单
          if (userInfo.value.role) {
            const authStore = useAuthStore()
            authStore.getAuthMenuList()
          }
        } catch (e) {
          console.error('Failed to parse userInfo from storage', e)
        }
      }
    }

    // 监听角色变化，重新获取菜单
    watch(
      () => userInfo.value.role,
      (newRole) => {
        if (newRole) {
          const authStore = useAuthStore()
          authStore.getAuthMenuList()
        }
      },
    )

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
