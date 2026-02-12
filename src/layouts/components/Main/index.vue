<template>
  <Maximize v-show="maximize" />
  <Tabs v-show="tabs" />
  <el-main>
    <slot></slot>
  </el-main>
</template>

<script setup>
import { ref, onBeforeUnmount, provide, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useGlobalStore } from '@/stores/modules/global'
import Maximize from './components/Maximize.vue'
import Tabs from '@/layouts/components/Tabs/index.vue'

const globalStore = useGlobalStore()
const { maximize, isCollapse, tabs } = storeToRefs(globalStore)

const isRouterShow = ref(true)
const refreshCurrentPage = (val) => (isRouterShow.value = val)
provide('refresh', refreshCurrentPage)

watch(
  () => maximize.value,
  () => {
    const app = document.getElementById('app')
    if (app) {
      if (maximize.value) app.classList.add('main-maximize')
      else app.classList.remove('main-maximize')
    }
  },
  { immediate: true },
)

const screenWidth = ref(0)
const listeningWindow = useDebounceFn(() => {
  screenWidth.value = document.body.clientWidth
  if (!isCollapse.value && screenWidth.value < 1200) globalStore.setGlobalState('isCollapse', true)
  if (isCollapse.value && screenWidth.value > 1200) globalStore.setGlobalState('isCollapse', false)
}, 100)
window.addEventListener('resize', listeningWindow, false)
onBeforeUnmount(() => {
  window.removeEventListener('resize', listeningWindow)
})
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
