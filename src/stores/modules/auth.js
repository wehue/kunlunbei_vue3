import { defineStore } from 'pinia'
import router from '@/router'
import { useUserStore } from './user'

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

      // 从根路由开始处理
      const rootRoutes = router.options.routes

      // 递归构建面包屑路径
      const processRoutes = (routes, parentPath = '', parentBreadcrumb = []) => {
        routes.forEach((route) => {
          // 跳过隐藏的路由
          if (route.meta && route.meta.isHide) {
            return
          }

          // 构建当前路由的完整路径
          let currentPath = route.path
          if (!currentPath.startsWith('/')) {
            if (parentPath) {
              currentPath = `${parentPath}/${currentPath}`
            } else {
              currentPath = `/${currentPath}`
            }
          }
          // 清理路径，去掉多余的 /
          currentPath = currentPath.replace(/\/+/g, '/')

          // 构建当前路由的面包屑项 - 只有有title的才添加
          if (route.meta && route.meta.title) {
            const currentBreadcrumbItem = {
              path: currentPath,
              meta: route.meta || {},
            }

            // 构建完整的面包屑路径（包含所有父级）
            const currentBreadcrumbList = [...parentBreadcrumb, currentBreadcrumbItem]

            // 存储面包屑路径
            breadcrumbList[currentPath] = currentBreadcrumbList

            // 递归处理子路由
            if (route.children && route.children.length > 0) {
              processRoutes(route.children, currentPath, currentBreadcrumbList)
            }
          } else if (route.children && route.children.length > 0) {
            // 没有title的路由，直接传递父面包屑继续处理子路由
            processRoutes(route.children, currentPath, parentBreadcrumb)
          }
        })
      }

      processRoutes(rootRoutes)
      return breadcrumbList
    },
  },
  actions: {
    async getAuthMenuList() {
      const userStore = useUserStore()
      const currentRole = userStore.userInfo?.role

      if (!currentRole) {
        this.authMenuList = []
        return
      }

      const routes = router.options.routes
      const menuList = []

      const processRoute = (route, parentPath = '') => {
        // 过滤出有角色权限的路由
        if (route.meta && route.meta.roles && !route.meta.roles.includes(currentRole.toLowerCase())) {
          return null
        }

        // 构建当前路由的完整路径
        let currentPath = route.path
        if (!currentPath.startsWith('/')) {
          if (parentPath) {
            currentPath = `${parentPath}/${currentPath}`
          } else {
            currentPath = `/${currentPath}`
          }
        }
        // 清理路径，去掉多余的 /
        currentPath = currentPath.replace(/\/+/g, '/')

        // 处理子路由
        let children = []
        if (route.children && route.children.length > 0) {
          children = route.children.map((child) => processRoute(child, currentPath)).filter(Boolean)
        }

        // 构建菜单项
        if (route.meta && !route.meta.isHide) {
          // 有子路由的菜单项不需要 component
          if (children.length > 0 || route.component) {
            const menuItem = {
              path: currentPath,
              name: route.name,
              meta: route.meta,
            }

            if (children.length > 0) {
              menuItem.children = children
            }

            return menuItem
          }
        }

        return null
      }

      // 处理所有路由
      routes.forEach((route) => {
        if (route.children && route.children.length > 0) {
          route.children.forEach((child) => {
            // 传递根路径 '/' 作为父路径
            const menuItem = processRoute(child, '/')
            if (menuItem) {
              menuList.push(menuItem)
            }
          })
        } else {
          const menuItem = processRoute(route, '/')
          if (menuItem) {
            menuList.push(menuItem)
          }
        }
      })

      // 将首页菜单移到最前面
      const homeMenu = menuList.filter((item) => item.meta && item.meta.isAffix)
      const otherMenu = menuList.filter((item) => !(item.meta && item.meta.isAffix))
      this.authMenuList = [...homeMenu, ...otherMenu]
    },
    setAuthMenuList(menuList) {
      this.authMenuList = menuList
    },
    setRouteName(name) {
      this.routeName = name
    },
  },
})
