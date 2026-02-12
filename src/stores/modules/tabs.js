import { defineStore } from 'pinia'

export const useTabsStore = defineStore({
  id: 'kunlun-tabs',
  state: () => ({
    tabsMenuList: [],
  }),
  getters: {},
  actions: {
    addTabs(tabItem) {
      const isExist = this.tabsMenuList.some((item) => item.path === tabItem.path)
      if (!isExist) {
        this.tabsMenuList.push(tabItem)
      }
    },
    removeTabs(path, isCurrent) {
      const index = this.tabsMenuList.findIndex((item) => item.path === path)
      if (index !== -1) {
        this.tabsMenuList.splice(index, 1)
      }
    },
    setTabs(tabsList) {
      this.tabsMenuList = tabsList
    },
    closeTabsOnSide(path, type) {
      const currentIndex = this.tabsMenuList.findIndex((item) => item.path === path)
      if (currentIndex !== -1) {
        if (type === 'left') {
          this.tabsMenuList = this.tabsMenuList.slice(currentIndex)
        } else if (type === 'right') {
          this.tabsMenuList = this.tabsMenuList.slice(0, currentIndex + 1)
        } else if (type === 'other') {
          this.tabsMenuList = [this.tabsMenuList[currentIndex]]
        }
      }
    },
    closeMultipleTabs(tabs) {
      this.tabsMenuList = tabs
    },
    closeAllTabs() {
      this.tabsMenuList = []
    },
  },
  persist: {
    key: 'kunlun-tabs',
    storage: localStorage,
  },
})
