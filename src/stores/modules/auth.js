import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useAuthStore = defineStore({
  id: 'kunlun-auth',
  state: () => ({
    authMenuList: [],
    routeName: ''
  }),
  getters: {
    authMenuListGet: (state) => state.authMenuList,
    showMenuListGet: (state) => {
      return state.authMenuList.filter(item => !item.meta?.isHide)
    },
    flatMenuListGet: (state) => {
      const flatList = []
      const flatten = (menuList) => {
        menuList.forEach(item => {
          if (item.children && item.children.length > 0) {
            flatten(item.children)
          } else {
            flatList.push(item)
          }
        })
      }
      flatten(state.authMenuList)
      return flatList
    }
  },
  actions: {
    async getAuthMenuList() {
      try {
        const res = await request.get('/api/menu/list')
        if (res.data.code === 0) {
          this.authMenuList = res.data.data
        }
      } catch (err) {
        console.error('获取菜单失败', err)
      }
    },
    setAuthMenuList(menuList) {
      this.authMenuList = menuList
    },
    setRouteName(name) {
      this.routeName = name
    }
  }
})
