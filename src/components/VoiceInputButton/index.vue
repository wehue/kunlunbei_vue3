<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  apiUrl: {
    type: String,
    default: 'http://localhost:8080/ai/asr/recognize',
  },
  autoFill: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'result', 'error'])

const isRecording = ref(false)
const isProcessing = ref(false)
const statusMessage = ref('')
let mediaRecorder = null
let audioChunks = []

async function handleVoiceInput() {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      await processAudio()
      stream.getTracks().forEach((track) => track.stop())
    }

    mediaRecorder.start()
    isRecording.value = true
    statusMessage.value = '正在录音...'
  } catch (error) {
    console.error('录音失败:', error)
    statusMessage.value = '录音权限被拒绝'
    emit('error', '录音权限被拒绝')
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop()
    isRecording.value = false
    statusMessage.value = '正在处理...'
    isProcessing.value = true
  }
}

async function processAudio() {
  try {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })

    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.wav')

    const response = await fetch(props.apiUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('语音识别失败')
    }

    const result = await response.text()

    statusMessage.value = '识别完成'
    emit('result', result)

    if (props.autoFill) {
      emit('update:modelValue', result)
    }
  } catch (error) {
    console.error('处理音频失败:', error)
    statusMessage.value = '识别失败'
    emit('error', error.message)
  } finally {
    isProcessing.value = false
    setTimeout(() => {
      statusMessage.value = ''
    }, 1500)
  }
}
</script>

<template>
  <button
    type="button"
    class="voice-input-btn"
    :class="{ recording: isRecording }"
    @click="handleVoiceInput"
    :disabled="isProcessing"
    :title="isRecording ? '停止录音' : '开始语音输入'"
  >
    <span v-if="!isRecording && !isProcessing" class="icon">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    </span>
    <span v-else-if="isRecording" class="icon recording-icon">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    </span>
    <span v-else class="icon">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    </span>

    <span v-if="statusMessage" class="status">{{ statusMessage }}</span>
  </button>
</template>

<style scoped>
.voice-input-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: none;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background-color: var(--el-bg-color);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  z-index: 1;
  color: var(--el-text-color-regular);
}

.input-with-voice:focus-within .voice-input-btn {
  display: inline-flex;
}

.voice-input-btn:hover {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.voice-input-btn.recording {
  background-color: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger);
  color: var(--el-color-danger);
}

.voice-input-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recording-icon {
  animation: pulse 1s infinite;
}

.status {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
