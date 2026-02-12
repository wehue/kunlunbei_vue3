import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('kunlun-global', {
  state: () => ({
    isCollapse: false,
    accordion: true,
    breadcrumb: true,
    breadcrumbIcon: true,
    tabs: true,
    tabsIcon: true,
    maximize: false,
  }),
  getters: {},
  actions: {
    setGlobalState(key, value) {
      this[key] = value
    },
    setCollapse(isCollapse) {
      this.isCollapse = isCollapse
    },
  },
  persist: {
    key: 'kunlun-global',
    storage: localStorage,
  },
})
