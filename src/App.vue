<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'
import { useUserStore } from '@/stores/modules/user'

const authStore = useAuthStore()
const userStore = useUserStore()

onMounted(() => {
  if (userStore.userInfo?.role) {
    authStore.getAuthMenuList()
  }
})
</script>

<template>
  <router-view />
</template>

<style scoped></style>
