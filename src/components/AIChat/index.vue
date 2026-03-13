<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { ChatDotRound, Close } from '@element-plus/icons-vue'
import AiMarkdownViewer from '@/components/AiMarkdownViewer/index.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const sessionId = ref(localStorage.getItem('chatSessionId'))
const messages = ref([])
const messageInput = ref('')
const socket = ref(null)
const isSessionExpired = ref(false)
let isInitialized = false
let hasReceivedConnected = ref(false)

const sidebarWidth = ref(420)
const isResizing = ref(false)
const minWidth = 350
const maxWidth = 600

async function fetchNewSessionId(oldSessionId) {
  let url = `http://localhost:8080/ai/chat/generateSessionId`
  if (oldSessionId) url += `?oldSessionId=${encodeURIComponent(oldSessionId)}`

  try {
    const res = await fetch(url)

    if (!res.ok) {
      console.error('获取会话ID失败:', res.status, res.statusText)
      localStorage.removeItem('chatSessionId')
      return null
    }

    const id = await res.text()

    if (!id || id.includes('error') || id.includes('Error') || id.includes('{')) {
      console.error('无效的会话ID:', id)
      localStorage.removeItem('chatSessionId')
      return null
    }

    localStorage.setItem('chatSessionId', id)
    return id
  } catch (error) {
    console.error('获取会话ID请求失败:', error)
    localStorage.removeItem('chatSessionId')
    return null
  }
}

async function initSession() {
  if (!isInitialized) {
    const newSessionId = await fetchNewSessionId(null)
    if (!newSessionId) {
      appendMessage('系统：无法连接AI服务，请检查后端服务是否正常运行', 'system')
      isSessionExpired.value = true
      return
    }
    sessionId.value = newSessionId
    appendMessage('系统：会话已创建，可以开始聊天', 'system')
    isInitialized = true
  }
}

function initWebSocket() {
  if (!sessionId.value || isSessionExpired.value || socket.value?.readyState === WebSocket.OPEN) {
    return
  }

  if (socket.value) {
    socket.value.close(1000, 'Reinitializing connection')
  }

  const wsUrl = `ws://localhost:8080/ws/chat?sessionId=${encodeURIComponent(sessionId.value)}`

  try {
    socket.value = new WebSocket(wsUrl)
    hasReceivedConnected.value = false

    socket.value.onopen = () => {
      isSessionExpired.value = false
    }

    socket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      } catch (e) {
        console.error('消息解析失败:', e)
      }
    }

    socket.value.onerror = (error) => {
      console.error('WebSocket错误:', error)
    }

    socket.value.onclose = (event) => {
      if (event.code === 4001) return

      if ([1006, 1007].includes(event.code)) {
        handleSessionError(event.code)
      }
    }
  } catch (error) {
    console.error('WebSocket初始化失败:', error)
    appendMessage('系统：连接初始化失败', 'system')
  }
}

async function newChat() {
  messages.value = []
  isSessionExpired.value = false

  if (socket.value) {
    socket.value.close(1000, 'New chat requested')
    socket.value = null
  }

  const newSessionId = await fetchNewSessionId(sessionId.value)
  if (!newSessionId) {
    appendMessage('系统：无法创建新会话，请检查后端服务是否正常运行', 'system')
    isSessionExpired.value = true
    return
  }
  sessionId.value = newSessionId
  appendMessage('系统：新会话已创建，可以开始提问', 'system')

  initWebSocket()
}

function appendMessage(text, className, markdownContent = '') {
  messages.value.push({ text, className, markdownContent })
}

function handleWebSocketMessage(data) {
  if (data.type === 'connected') {
    hasReceivedConnected.value = true
    return
  }

  if (data.type === 'token' && data.content) {
    const last = messages.value[messages.value.length - 1]
    if (last && last.className === 'ai') {
      last.markdownContent += data.content
    }
    return
  }

  if (data.type === 'done') {
    return
  }

  if (data.type === 'error') {
    handleApiError(data)
    return
  }
}

function handleApiError(error) {
  if (['SESSION_EXPIRED', 'SESSION_INVALID'].includes(error.code)) {
    handleSessionError(error.code, error.message)
    return
  }

  appendMessage(`系统：错误: ${error.message || '未知错误'}`, 'system')
}

function handleSessionError(errorCode, errorMessage) {
  isSessionExpired.value = true
  localStorage.removeItem('chatSessionId')
  sessionId.value = null

  if (socket.value) {
    socket.value.close(4001, 'Session expired by server')
  }

  const message = errorMessage || (errorCode === 'SESSION_EXPIRED' ? '会话已过期' : '无效会话')
  appendMessage(`系统：${message}\n\n请点击下方 "新建聊天" 按钮开始新对话`, 'system')
}

function send() {
  if (isSessionExpired.value) {
    appendMessage('系统：会话已过期，请点击"新建聊天"开始新对话', 'system')
    return
  }

  if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
    appendMessage('系统：连接未建立，请等待或重试', 'system')
    return
  }

  const text = messageInput.value.trim()
  if (!text) return

  messageInput.value = ''
  appendMessage('你：' + text, 'user')

  if (hasReceivedConnected.value) {
    appendMessage('', 'ai', '')
  }

  socket.value.send(JSON.stringify({ message: text }))
}

function closeChat() {
  emit('close')
  if (socket.value) {
    socket.value.close(1000, 'Sidebar closed')
  }
}

watch(
  () => props.visible,
  async (newVal) => {
    if (!newVal) return

    if (!isInitialized) {
      await initSession()
    }

    if (isSessionExpired.value) return

    if (!sessionId.value) {
      const newSessionId = await fetchNewSessionId(null)
      if (!newSessionId) {
        appendMessage('系统：无法连接AI服务，请检查后端服务是否正常运行', 'system')
        isSessionExpired.value = true
        return
      }
      sessionId.value = newSessionId
    }

    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
      initWebSocket()
    }
  },
)

onUnmounted(() => {
  if (socket.value) {
    socket.value.close(1000, 'Component unmounted')
  }
})

function startResize(event) {
  isResizing.value = true
  event.preventDefault()
  event.stopPropagation()

  document.addEventListener('mousemove', resize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', resize)
  document.addEventListener('touchend', stopResize)
}

function resize(event) {
  if (!isResizing.value) return

  event.preventDefault()
  event.stopPropagation()

  const clientX = event.clientX || (event.touches && event.touches[0].clientX)
  if (!clientX) return

  const newWidth = window.innerWidth - clientX

  if (newWidth >= minWidth && newWidth <= maxWidth) {
    sidebarWidth.value = newWidth
  }
}

function stopResize() {
  isResizing.value = false

  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', resize)
  document.removeEventListener('touchend', stopResize)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="chat-sidebar-overlay" @click="closeChat">
      <div class="chat-sidebar" @click.stop :style="{ width: sidebarWidth + 'px' }">
        <div class="resize-handle" @mousedown="startResize" @touchstart="startResize"></div>

        <div class="chat-header">
          <div class="header-title">
            <el-icon :size="20"><ChatDotRound /></el-icon>
            <span>AI 智能助手</span>
          </div>
          <el-button class="close-btn" text circle @click="closeChat">
            <el-icon :size="20"><Close /></el-icon>
          </el-button>
        </div>

        <div class="messages-container">
          <div v-for="(msg, i) in messages" :key="i" :class="['msg', msg.className]">
            <AiMarkdownViewer v-if="msg.className === 'ai'" :content="msg.markdownContent" />
            <div v-else>{{ msg.text }}</div>
          </div>
        </div>

        <div class="input-area">
          <el-input
            v-model="messageInput"
            :disabled="isSessionExpired"
            placeholder="请输入你的问题…"
            @keyup.enter="send"
          >
            <template #append>
              <el-button type="primary" :disabled="isSessionExpired" @click="send">发送</el-button>
            </template>
          </el-input>
          <el-button class="new-chat-btn" @click="newChat">新建聊天</el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.chat-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.3s ease;
}

.chat-sidebar {
  height: 100vh;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-dark);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
  position: relative;
}

.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
  background-color: transparent;
  transition: background-color 0.2s ease;
}

.resize-handle:hover {
  background-color: var(--el-color-primary);
}

.resize-handle:active {
  background-color: var(--el-color-primary-light-3);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-color-primary);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  color: #fff !important;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--el-bg-color-page);
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 3px;
}

.msg {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.user {
  align-self: flex-end;
  background: var(--el-color-primary);
  border-bottom-right-radius: 4px;
  font-weight: 500;
  color: #fff;
}

.ai {
  align-self: flex-start;
  background: var(--el-bg-color);
  border-bottom-left-radius: 4px;
  color: var(--el-text-color-primary);
  box-shadow: var(--el-box-shadow-light);
  border: 1px solid var(--el-border-color-lighter);
}

.system {
  align-self: center;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 8px;
  max-width: 90%;
  text-align: center;
  border: 1px solid var(--el-color-warning-light-5);
}

.input-area {
  padding: 16px;
  border-top: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--el-bg-color);
}

.input-area :deep(.el-input-group__append) {
  padding: 0;
}

.input-area :deep(.el-input-group__append .el-button) {
  margin: 0;
}

.new-chat-btn {
  width: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
