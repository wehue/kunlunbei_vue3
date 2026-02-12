<template>
  <div class="maximize" @click="exitMaximize">
    <el-icon><Close /></el-icon>
  </div>
</template>

<script setup>
import { useGlobalStore } from '@/stores/modules/global'
import { Close } from '@element-plus/icons-vue'

const globalStore = useGlobalStore()
const exitMaximize = () => {
  globalStore.setGlobalState('maximize', false)
}
</script>

<style scoped lang="scss">
.maximize {
  position: fixed;
  top: -25px;
  right: -25px;
  z-index: 999;
  width: 55px;
  height: 55px;
  cursor: pointer;
  background-color: var(--el-color-info);
  border-radius: 50%;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: var(--el-color-info-dark-2);
  }
  .el-icon {
    font-size: 16px;
    color: #ffffff;
    margin-top: 20px;
    margin-left: 5px;
  }
}
</style>
