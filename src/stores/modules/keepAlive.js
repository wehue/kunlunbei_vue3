import { defineStore } from 'pinia'

export const useKeepAliveStore = defineStore('kunlun-keepAlive', {
  state: () => ({
    keepAliveName: [],
  }),
  actions: {
    addKeepAliveName(name) {
      if (!this.keepAliveName.includes(name)) {
        this.keepAliveName.push(name)
      }
    },
    removeKeepAliveName(name) {
      const index = this.keepAliveName.indexOf(name)
      if (index !== -1) {
        this.keepAliveName.splice(index, 1)
      }
    },
    setKeepAliveName(names) {
      this.keepAliveName = names
    },
  },
})
