<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Delete,
  DataAnalysis,
  PictureFilled,
  SuccessFilled,
  WarningFilled,
} from '@element-plus/icons-vue'

const router = useRouter()

const fileInput = ref(null)
const selectedFile = ref(null)
const isAnalyzing = ref(false)
const analysisResult = ref(null)
const dragOver = ref(false)

const imagePreview = computed(() => {
  if (!selectedFile.value) return ''
  return URL.createObjectURL(selectedFile.value)
})

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    analysisResult.value = null
  }
}

const handleDrop = (event) => {
  dragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file
    analysisResult.value = null
  } else {
    ElMessage.warning('请上传图片文件')
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  dragOver.value = true
}

const handleDragLeave = () => {
  dragOver.value = false
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const clearFile = () => {
  selectedFile.value = null
  analysisResult.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const analyzeFlowchart = async () => {
  if (!selectedFile.value) return

  isAnalyzing.value = true
  analysisResult.value = null

  try {
    const formData = new FormData()
    formData.append('imageFile', selectedFile.value)

    const response = await fetch('http://localhost:8080/ai/flowchartProcessAnalyze/analyze', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('分析请求失败')
    }

    const result = await response.json()
    analysisResult.value = result

    handleAnalysisResult(result)
  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析失败: ' + error.message)
  } finally {
    isAnalyzing.value = false
  }
}

const handleAnalysisResult = (result) => {
  const status = result.status
  const processes = result.missingProcesses || []

  if (status === 1) {
    const processNames = processes.map((p) => p.processName).join('、')
    ElMessage.warning({
      message: `分析完成，存在缺失的工序：${processNames}，请先配置工序`,
      duration: 5000,
    })
    localStorage.setItem(
      'processConfigHint',
      JSON.stringify({
        show: true,
        message: '分析完成，存在缺失的工序，请先配置工序',
        missingProcesses: processes,
      }),
    )
    router.push('/process-manage/process-manage-info')
  } else if (status === 0) {
    ElMessage.success({
      message: '分析完成，所有工序均已存在，可以直接配置工艺路线',
      duration: 5000,
    })
    localStorage.setItem(
      'routeConfigHint',
      JSON.stringify({
        show: true,
        message: '分析完成，所有工序均已存在，可以直接配置工艺路线',
      }),
    )
    router.push('/process-route-manage/process-route-manage-info')
  }
}
</script>

<template>
  <div class="flowchart-analyze-container">
    <div class="page-header">
      <h2 class="page-title">工艺流程分析</h2>
      <p class="page-desc">上传工艺流程图，AI将智能识别并分析工序配置情况</p>
    </div>

    <div class="content-card">
      <div class="upload-section">
        <div class="section-title">上传流程图</div>

        <div
          class="upload-area"
          :class="{ 'drag-over': dragOver, 'has-file': selectedFile }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          @click="triggerFileSelect"
        >
          <input
            type="file"
            accept="image/*"
            @change="handleFileChange"
            ref="fileInput"
            class="hidden-input"
          />

          <template v-if="!selectedFile">
            <el-icon class="upload-icon" :size="48"><PictureFilled /></el-icon>
            <p class="upload-text">点击或拖拽图片到此处上传</p>
            <p class="upload-hint">支持 JPG、PNG 等常见图片格式</p>
          </template>

          <template v-else>
            <div class="preview-container">
              <img :src="imagePreview" alt="流程图预览" class="preview-image" />
            </div>
            <div class="file-info">
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </template>
        </div>
      </div>

      <div class="action-section">
        <el-button v-if="selectedFile" type="danger" :icon="Delete" @click="clearFile">
          重新选择
        </el-button>
        <el-button
          type="primary"
          :icon="DataAnalysis"
          :disabled="!selectedFile || isAnalyzing"
          :loading="isAnalyzing"
          @click="analyzeFlowchart"
        >
          {{ isAnalyzing ? '分析中...' : '智能分析' }}
        </el-button>
      </div>

      <div v-if="analysisResult" class="result-section">
        <div class="section-title">分析结果</div>
        <div class="result-content" :class="{ 'has-missing': analysisResult.status === 1 }">
          <template v-if="analysisResult.status === 0">
            <el-icon class="result-icon success" :size="24"><SuccessFilled /></el-icon>
            <p class="result-text success">所有工序均已存在，可以直接配置工艺路线</p>
          </template>
          <template v-else>
            <el-icon class="result-icon warning" :size="24"><WarningFilled /></el-icon>
            <p class="result-text warning">存在缺失的工序，请先配置以下工序：</p>
            <div class="missing-processes">
              <el-tag
                v-for="process in analysisResult.missingProcesses"
                :key="process.processIndex"
                type="warning"
                class="process-tag"
              >
                {{ process.processIndex }}. {{ process.processName }}
              </el-tag>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flowchart-analyze-container {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 20px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 8px 0;
  }

  .page-desc {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }
}

.content-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--el-box-shadow-light);
}

.upload-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
  }
}

.upload-area {
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--el-bg-color-page);

  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &.drag-over {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &.has-file {
    padding: 20px;
  }

  .hidden-input {
    display: none;
  }

  .upload-icon {
    color: var(--el-text-color-placeholder);
    margin-bottom: 16px;
  }

  .upload-text {
    font-size: 16px;
    color: var(--el-text-color-regular);
    margin: 0 0 8px 0;
  }

  .upload-hint {
    font-size: 14px;
    color: var(--el-text-color-placeholder);
    margin: 0;
  }

  .preview-container {
    max-width: 400px;
    margin: 0 auto 16px;

    .preview-image {
      max-width: 100%;
      max-height: 300px;
      border-radius: 4px;
      box-shadow: var(--el-box-shadow-light);
    }
  }

  .file-info {
    .file-name {
      font-size: 14px;
      color: var(--el-text-color-primary);
      margin: 0 0 4px 0;
      font-weight: 500;
    }

    .file-size {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.result-section {
  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
  }

  .result-content {
    padding: 20px;
    border-radius: 8px;
    background: var(--el-color-success-light-9);
    border: 1px solid var(--el-color-success-light-5);

    &.has-missing {
      background: var(--el-color-warning-light-9);
      border-color: var(--el-color-warning-light-5);
    }

    .result-icon {
      margin-bottom: 12px;

      &.success {
        color: var(--el-color-success);
      }

      &.warning {
        color: var(--el-color-warning);
      }
    }

    .result-text {
      font-size: 14px;
      margin: 0 0 12px 0;

      &.success {
        color: var(--el-color-success-dark-2);
      }

      &.warning {
        color: var(--el-color-warning-dark-2);
      }
    }

    .missing-processes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .process-tag {
        font-size: 13px;
      }
    }
  }
}
</style>
