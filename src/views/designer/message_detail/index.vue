<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores/modules/message'

const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()

const loading = ref(false)

const messageId = computed(() => route.params.id)
const messageData = computed(() => {
  const msg = messageStore.messages.find((m) => m.id === Number(messageId.value))
  return msg || {}
})

const loadMessageData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

const handleBack = () => {
  router.push('/message-manage/message-info')
}

const getAuditStatusType = (status) => {
  switch (status) {
    case '已通过':
      return 'success'
    case '已驳回':
      return 'danger'
    case '待审核':
      return 'warning'
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
          <h2 class="page-title">工艺路线审核结果通知</h2>
          <span class="page-subtitle">消息详情</span>
        </div>
      </div>
      <div class="header-right">
        <el-tag :type="getAuditStatusType(messageData.auditStatus)" size="large">
          {{ messageData.auditStatus }}
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
            <div class="info-label">消息编码</div>
            <div class="info-value">
              <el-tag size="default">{{ messageData.messageCode }}</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">审核状态</div>
            <div class="info-value">
              <el-tag :type="getAuditStatusType(messageData.auditStatus)" size="default">
                {{ messageData.auditStatus }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">操作类型</div>
            <div class="info-value">
              <el-tag
                :type="messageData.operationType === '新增' ? 'success' : 'warning'"
                size="default"
              >
                {{ messageData.operationType }}申请
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">工艺路线信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">工艺编码</div>
            <div class="info-value">{{ messageData.processCode }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">工艺路线名称</div>
            <div class="info-value">{{ messageData.processName }}</div>
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
            <div class="info-value">{{ messageData.applicant }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">提交时间</div>
            <div class="info-value">{{ messageData.submitTime }}</div>
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
            <div class="info-value">{{ messageData.auditor }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">审核时间</div>
            <div class="info-value">{{ messageData.auditTime }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">审核结果</div>
            <div class="info-value">
              <el-tag :type="getAuditStatusType(messageData.auditStatus)" size="default">
                {{ messageData.auditStatus }}
              </el-tag>
            </div>
          </div>
        </div>
        <div v-if="messageData.auditStatus === '已驳回'" class="reject-reason-section">
          <div class="reject-label">驳回原因</div>
          <div class="reject-content">
            <pre class="content-pre">{{ messageData.rejectReason }}</pre>
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
