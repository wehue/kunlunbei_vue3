<template>
  <div class="flowchart-analyze-entry">
    <el-tooltip content="工艺流程分析" placement="bottom">
      <el-icon class="toolBar-icon" @click="handleNavigate">
        <DataAnalysis />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()

const handleNavigate = () => {
  router.push('/flowchart-analyze')
}
</script>

<style scoped lang="scss">
.flowchart-analyze-entry {
  .toolBar-icon {
    font-size: 20px;
    color: var(--el-header-text-color);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: var(--el-color-primary);
      transform: scale(1.1);
    }
  }
}
</style>
