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
      avatar: '',
    })

    const roleHomeMap = {
      Admin: '/admin-index',
      Designer: '/designer-index',
      Supervisor: '/supervisor-index',
    }

    const homeUrl = computed(() => {
      return roleHomeMap[userInfo.value?.role] || '/admin-index'
    })

    const setToken = (t) => {
      token.value = t
    }

    const setUserInfo = (info) => {
      userInfo.value = info || { id: '', name: '', role: '', avatar: '' }
      if (info?.role) {
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
        avatar: '',
      }
      const authStore = useAuthStore()
      authStore.setAuthMenuList([])
    }

    watch(
      () => userInfo.value?.role,
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
    }
  },
  {
    persist: {
      key: 'kunlun-user',
      storage: localStorage,
    },
  },
)
