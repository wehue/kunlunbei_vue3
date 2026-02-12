<template>
  <el-dropdown trigger="click" :teleported="false">
    <div class="more-button">
      <el-icon><ArrowDown /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="refresh">
          <el-icon><Refresh /></el-icon>刷新
        </el-dropdown-item>
        <el-dropdown-item @click="maximize">
          <el-icon><FullScreen /></el-icon>最大化
        </el-dropdown-item>
        <el-dropdown-item divided @click="closeCurrentTab">
          <el-icon><Remove /></el-icon>关闭当前标签
        </el-dropdown-item>
        <el-dropdown-item @click="tabStore.closeTabsOnSide(route.fullPath, 'left')">
          <el-icon><DArrowLeft /></el-icon>关闭左侧标签
        </el-dropdown-item>
        <el-dropdown-item @click="tabStore.closeTabsOnSide(route.fullPath, 'right')">
          <el-icon><DArrowRight /></el-icon>关闭右侧标签
        </el-dropdown-item>
        <el-dropdown-item divided @click="closeOtherTabs">
          <el-icon><CircleClose /></el-icon>关闭其他标签
        </el-dropdown-item>
        <el-dropdown-item @click="closeAllTab">
          <el-icon><FolderDelete /></el-icon>关闭所有标签
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { inject, nextTick } from 'vue'
import { useTabsStore } from '@/stores/modules/tabs'
import { useGlobalStore } from '@/stores/modules/global'
import { useKeepAliveStore } from '@/stores/modules/keepAlive'
import { useUserStore } from '@/stores/modules/user'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowDown,
  Refresh,
  FullScreen,
  Remove,
  DArrowLeft,
  DArrowRight,
  CircleClose,
  FolderDelete,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const tabStore = useTabsStore()
const globalStore = useGlobalStore()
const keepAliveStore = useKeepAliveStore()
const userStore = useUserStore()

const refreshCurrentPage = inject('refresh')
const refresh = () => {
  setTimeout(() => {
    if (route.meta.isKeepAlive) keepAliveStore.removeKeepAliveName(route.fullPath)
    refreshCurrentPage(false)
    nextTick(() => {
      if (route.meta.isKeepAlive)
        keepAliveStore.setKeepAliveName([...keepAliveStore.keepAliveName, route.fullPath])
      refreshCurrentPage(true)
    })
  }, 0)
}

const maximize = () => {
  globalStore.setGlobalState('maximize', true)
}

const closeCurrentTab = () => {
  if (route.meta.isAffix) return
  tabStore.removeTabs(route.fullPath)
}

const closeOtherTabs = () => {
  tabStore.closeTabsOnSide(route.fullPath, 'other')
}

const closeAllTab = () => {
  tabStore.closeAllTabs()
  router.push(userStore.homeUrl)
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
