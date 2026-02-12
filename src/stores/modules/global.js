import { defineStore } from 'pinia'

export const useGlobalStore = defineStore({
  id: 'kunlun-global',
  state: () => ({
    isCollapse: false,
    accordion: true,
    breadcrumb: true,
    tabs: true,
    footer: true
  }),
  getters: {},
  actions: {
    setGlobalState(key, value) {
      this[key] = value
    },
    setCollapse(isCollapse) {
      this.isCollapse = isCollapse
    }
  },
  persist: {
    key: 'kunlun-global',
    storage: localStorage
  }
})
