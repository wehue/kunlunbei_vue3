function menuUtil() {
  return {
    getFlatMenuList(menuList) {
      const flatList = []
      const flatten = (list) => {
        list.forEach(item => {
          if (item.children && item.children.length > 0) {
            flatten(item.children)
          } else {
            flatList.push(item)
          }
        })
      }
      flatten(menuList)
      return flatList
    },

    getShowMenuList(menuList) {
      const showList = []
      const filter = (list) => {
        list.forEach(item => {
          if (!item.meta?.isHide) {
            if (item.children && item.children.length > 0) {
              const children = filter(item.children)
              if (children.length > 0) {
                showList.push({
                  ...item,
                  children
                })
              }
            } else {
              showList.push(item)
            }
          }
        })
      }
      filter(menuList)
      return showList
    },

    getAllBreadcrumbList(menuList) {
      const breadcrumbMap = {}
      const traverse = (list, parentPath = []) => {
        list.forEach(item => {
          const currentPath = [...parentPath, item]
          if (!item.children || item.children.length === 0) {
            breadcrumbMap[item.path] = currentPath
          } else {
            traverse(item.children, currentPath)
          }
        })
      }
      traverse(menuList)
      return breadcrumbMap
    },

    getActiveMenu(menuList, path) {
      for (const item of menuList) {
        if (item.path === path) {
          return item
        }
        if (item.children && item.children.length > 0) {
          const found = this.getActiveMenu(item.children, path)
          if (found) return found
        }
      }
      return null
    }
  }
}

export default menuUtil
