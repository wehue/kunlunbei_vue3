<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getMessageList } from '@/api/message'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const messageData = ref({})

const messageId = computed(() => route.params.id)

const loadMessageData = async () => {
  loading.value = true
  try {
    const response = await getMessageList()
    const messages = Array.isArray(response.data.data?.data) ? response.data.data.data : []
    // 查找当前消息
    const msg = messages.find((m) => m.noticeId === messageId.value)
    if (msg) {
      messageData.value = msg
    }
  } catch (error) {
    console.error('获取消息详情失败:', error)
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.push('/message-manage/message-info')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getAuditStatusText = (status) => {
  switch (status) {
    case 'T':
      return '已通过'
    case 'Y':
      return '已驳回'
    case 'F':
      return '审核中'
    case 'W':
      return '待提交'
    default:
      return status
  }
}

const getAuditStatusType = (status) => {
  switch (status) {
    case 'T':
    case '已通过':
      return 'success'
    case 'Y':
    case '已驳回':
      return 'danger'
    case 'F':
    case '审核中':
      return 'warning'
    case 'W':
    case '待提交':
      return 'info'
    default:
      return 'info'
  }
}

onMounted(() => {
  loadMessageData()
})
</script>

<template>
  <div class="message-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ messageData.noticeTitle?.name || '工艺路线审核结果通知' }}</h2>
          <span class="page-subtitle">消息详情</span>
        </div>
      </div>
      <div class="header-right">
        <el-tag
          :type="getAuditStatusType(messageData.noticeTitle?.status || messageData.description)"
          size="large"
        >
          {{ getAuditStatusText(messageData.noticeTitle?.status || messageData.description) }}
        </el-tag>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">消息信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">消息ID</div>
            <div class="info-value">
              <el-tag size="default">{{ messageData.noticeId }}</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">审核状态</div>
            <div class="info-value">
              <el-tag
                :type="
                  getAuditStatusType(messageData.noticeTitle?.status || messageData.description)
                "
                size="default"
              >
                {{ getAuditStatusText(messageData.noticeTitle?.status || messageData.description) }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">创建时间</div>
            <div class="info-value">{{ formatDate(messageData.createTime) }}</div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">工艺路线信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">工艺编号</div>
            <div class="info-value">{{ messageData.processCode || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">工艺名称</div>
            <div class="info-value">
              {{ messageData.processName || messageData.noticeTitle?.workingPlanName || '-' }}
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">所属产品</div>
            <div class="info-value">{{ messageData.productName || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">工艺描述</div>
            <div class="info-value">{{ messageData.description || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">版本</div>
            <div class="info-value">{{ messageData.version || 'V1.0' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">审核状态</div>
            <div class="info-value">
              <el-tag
                :type="
                  getAuditStatusType(messageData.noticeTitle?.status || messageData.description)
                "
                size="default"
              >
                {{ getAuditStatusText(messageData.noticeTitle?.status || messageData.description) }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">工艺总时长</div>
            <div class="info-value">{{ messageData.totalTime || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">创建时间</div>
            <div class="info-value">{{ formatDate(messageData.createTime) || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">操作时间</div>
            <div class="info-value">{{ formatDate(messageData.lastUpdateTime) || '-' }}</div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">申请信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">申请人</div>
            <div class="info-value">{{ messageData.creator || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">提交时间</div>
            <div class="info-value">{{ formatDate(messageData.createTime) || '-' }}</div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">审核信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">审核人</div>
            <div class="info-value">{{ messageData.modifier || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">审核时间</div>
            <div class="info-value">{{ formatDate(messageData.lastUpdateTime) || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">审核结果</div>
            <div class="info-value">
              <el-tag
                :type="
                  getAuditStatusType(messageData.noticeTitle?.status || messageData.description)
                "
                size="default"
              >
                {{ getAuditStatusText(messageData.noticeTitle?.status || messageData.description) }}
              </el-tag>
            </div>
          </div>
        </div>
        <div
          v-if="
            (messageData.noticeTitle?.status || messageData.description) === 'Y' ||
            (messageData.noticeTitle?.status || messageData.description) === '已驳回'
          "
          class="reject-reason-section"
        >
          <div class="reject-label">驳回原因</div>
          <div class="reject-content">
            <pre class="content-pre">{{ messageData.rejectReason || '暂无驳回原因' }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message-detail-container {
  padding: 2px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 18px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;

      .title-area {
        .page-title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1.3;
        }

        .page-subtitle {
          font-size: 16px;
          color: #909399;
        }
      }
    }

    .header-right {
      display: flex;
      gap: 12px;

      .el-tag {
        font-size: 16px;
        padding: 8px 16px;
      }
    }
  }

  .detail-content {
    .section-card {
      background: #fff;
      border-radius: 4px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #ebeef5;

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          position: relative;
          padding-left: 12px;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 16px;
            background: #409eff;
            border-radius: 2px;
          }
        }
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        background: #ebeef5;
        padding: 1px;

        .info-item {
          display: flex;
          align-items: stretch;
          background: #fff;
          min-height: 56px;

          .info-label {
            width: 100px;
            padding: 16px 18px;
            background: #fafafa;
            font-size: 14px;
            color: #606266;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            font-weight: 500;
          }

          .info-value {
            flex: 1;
            padding: 16px 18px;
            font-size: 14px;
            color: #303133;
            display: flex;
            align-items: center;
          }
        }
      }

      .reject-reason-section {
        padding: 20px;
        border-top: 1px solid #ebeef5;

        .reject-label {
          font-size: 14px;
          color: #f56c6c;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .reject-content {
          background: #fef0f0;
          border-radius: 4px;
          padding: 16px;
          border: 1px solid #fbc4c4;

          .content-pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: inherit;
            line-height: 1.8;
            font-size: 14px;
            color: #f56c6c;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .message-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .message-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>
