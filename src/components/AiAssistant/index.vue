<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import AIChat from '@/components/AIChat/index.vue'

const showChat = ref(false)

const toggleChat = () => {
  showChat.value = !showChat.value
}

const handleCloseChat = () => {
  showChat.value = false
}

const dragPosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const hasMoved = ref(false)

const handleMouseDown = (e) => {
  if (showChat.value) return
  isDragging.value = true
  hasMoved.value = false
  dragStart.value = {
    x: e.clientX - dragPosition.value.x,
    y: e.clientY - dragPosition.value.y,
  }
  e.preventDefault()
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return

  let newX = e.clientX - dragStart.value.x
  let newY = e.clientY - dragStart.value.y

  const maxX = window.innerWidth - 60
  const maxY = window.innerHeight - 60

  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))

  if (Math.abs(newX - dragPosition.value.x) > 5 || Math.abs(newY - dragPosition.value.y) > 5) {
    hasMoved.value = true
  }

  dragPosition.value = { x: newX, y: newY }
}

const handleMouseUp = () => {
  isDragging.value = false
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="ai-assistant">
    <div
      class="ai-ball"
      :class="{ active: showChat, dragging: isDragging }"
      :style="{ transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)` }"
      @mousedown="handleMouseDown"
      @click="!hasMoved && toggleChat()"
    >
      <el-icon :size="28"><ChatDotRound /></el-icon>
      <span class="ball-tooltip">AI助手</span>
    </div>

    <AIChat :visible="showChat" @close="handleCloseChat" />
  </div>
</template>

<style lang="scss" scoped>
.ai-assistant {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 9998;
}

.ai-ball {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--el-box-shadow-light);
  transition: all 0.3s ease;
  color: #fff;
  position: relative;
  user-select: none;

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--el-box-shadow-base);

    .ball-tooltip {
      opacity: 1;
      transform: translateX(-50%) translateY(-8px);
    }
  }

  &.active {
    background: var(--el-color-primary-light-3);
    transform: scale(1.1);
  }

  &.dragging {
    cursor: grabbing;
    transform: scale(1.15);
    box-shadow: var(--el-box-shadow-dark);
  }

  .ball-tooltip {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%) translateY(0);
    background: var(--el-bg-color);
    color: var(--el-text-color-primary);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-lighter);
  }

  .el-icon {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
}
</style>
