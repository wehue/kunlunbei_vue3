<template>
  <el-dialog v-model="dialogVisible" title="个人信息" width="500px" draggable>
    <el-form :model="userInfo" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="userInfo.name" disabled />
      </el-form-item>
      <el-form-item label="角色">
        <el-input v-model="userInfo.role" disabled />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const dialogVisible = ref(false)
const userInfo = computed(() => userStore.userInfo || { name: '', role: '' })

const openDialog = () => {
  dialogVisible.value = true
}

defineExpose({ openDialog })
</script>
