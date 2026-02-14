<script setup>
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

const switchRole = (role) => {
  userStore.setUserInfo({
    id: role,
    name: role === 'admin' ? '管理员' : role === 'supervisor' ? '主管' : '设计师',
    role: role,
  })
}
</script>

<template>
  <div class="role-test">
    <h2>角色切换测试</h2>
    <el-button @click="switchRole('admin')">切换到管理员</el-button>
    <el-button @click="switchRole('supervisor')">切换到主管</el-button>
    <el-button @click="switchRole('designer')">切换到设计师</el-button>
    <div class="current-role">
      <p>当前角色：{{ userStore.userInfo.name }} ({{ userStore.userInfo.role }})</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.role-test {
  padding: 20px;
  .current-role {
    margin-top: 20px;
    font-size: 16px;
    color: #606266;
  }
}
</style>
