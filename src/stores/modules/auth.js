import { defineStore } from 'pinia'
import router from '@/router'

export const useAuthStore = defineStore('kunlun-auth', {
  state: () => ({
    authMenuList: [],
    routeName: '',
  }),
  getters: {
    authMenuListGet: (state) => state.authMenuList,
    showMenuListGet: (state) => {
      return state.authMenuList.filter((item) => !item.meta?.isHide)
    },
    flatMenuListGet: (state) => {
      const flatList = []
      const flatten = (menuList) => {
        menuList.forEach((item) => {
          if (item.children && item.children.length > 0) {
            flatten(item.children)
          } else {
            flatList.push(item)
          }
        })
      }
      flatten(state.authMenuList)
      return flatList
    },
    breadcrumbListGet: (state) => {
      const breadcrumbList = {}
      const processRoutes = (routes, parentPath = '') => {
        routes.forEach((route) => {
          if (route.meta && !route.meta.isHide) {
            const fullPath = route.path.startsWith('/')
              ? route.path
              : (parentPath + '/' + route.path).replace(/\/+/g, '/')
            breadcrumbList[fullPath] = [{ path: fullPath, meta: route.meta }]
          }
          if (route.children) {
            processRoutes(route.children, route.path)
          }
        })
      }
      processRoutes(router.options.routes)
      return breadcrumbList
    },
  },
  actions: {
    async getAuthMenuList() {
      const routes = router.options.routes
      const menuList = []

      routes.forEach((route) => {
        if (route.children && route.children.length > 0) {
          route.children.forEach((child) => {
            if (child.meta && !child.meta.isHide) {
              menuList.push({
                path: '/' + child.path,
                name: child.name,
                meta: child.meta,
              })
            }
          })
        } else if (route.meta && !route.meta.isHide && route.component) {
          menuList.push({
            path: route.path,
            name: route.name,
            meta: route.meta,
          })
        }
      })

      this.authMenuList = menuList
    },
    setAuthMenuList(menuList) {
      this.authMenuList = menuList
    },
    setRouteName(name) {
      this.routeName = name
    },
  },
})
