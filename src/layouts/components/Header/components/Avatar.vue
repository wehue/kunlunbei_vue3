<template>
  <el-dropdown trigger="click">
    <div class="avatar">
      <img :src="avatarUrl" alt="avatar" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
        <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const userStore = useUserStore()

const avatarUrl = computed(() => {
  return userStore.userInfo?.avatar || '@/assets/images/avatar.gif'
})

const goToProfile = () => {
  router.push('/personal-center')
}

const logout = () => {
  ElMessageBox.confirm('您是否确认退出登录?', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    userStore.logout()
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.replace('/login')
    ElMessage.success('退出登录成功！')
  })
}
</script>

<style scoped lang="scss">
.avatar {
  width: 40px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 50%;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
