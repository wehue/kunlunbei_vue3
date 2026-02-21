<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, ArrowLeft, Clock, Document, Refresh } from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores/modules/message'
import { useUserStore } from '@/stores/modules/user'

const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()

const loading = ref(false)
const submitLoading = ref(false)
const auditData = ref({})
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentVersionIndex = ref(0)
const versionHistoryVisible = ref(false)
const compareDialogVisible = ref(false)
const compareVersions = ref({ old: null, new: null })

const mockVersionHistory = ref([
  {
    version: 'V1.0',
    versionCode: 1,
    submitTime: '2024-01-10 09:30:00',
    applicant: '张三',
    status: '已驳回',
    rejectReason: '工艺流程顺序存在错误，请调整后重新提交',
    changeDescription: '初始版本提交',
    processCode: 'PR001',
    processName: '智能手机组装工艺路线',
    product: '智能手机A1',
    description: '该工艺路线用于智能手机A1的组装生产。',
    processFlow: '1. 主板安装 → 2. 电池组装 → 3. 屏幕贴合 → 4. 外壳封装 → 5. 功能测试 → 6. 包装',
    operators: '张三、李四',
    operationTime: '2024-01-10 08:00-17:00',
    equipmentUsage: '贴片机、测试仪、包装机',
  },
  {
    version: 'V1.1',
    versionCode: 2,
    submitTime: '2024-01-12 10:15:00',
    applicant: '张三',
    status: '已驳回',
    rejectReason: '缺少摄像头安装工序，请补充完整',
    changeDescription: '调整工艺流程顺序，屏幕贴合移至电池组装之前',
    processCode: 'PR001',
    processName: '智能手机组装工艺路线',
    product: '智能手机A1',
    description:
      '该工艺路线用于智能手机A1的组装生产，包括主板安装、屏幕贴合、电池组装、外壳封装等主要工序。',
    processFlow: '1. 主板安装 → 2. 屏幕贴合 → 3. 电池组装 → 4. 外壳封装 → 5. 功能测试 → 6. 包装',
    operators: '张三、李四',
    operationTime: '2024-01-12 08:00-17:00',
    equipmentUsage: '贴片机、点胶机、测试仪、包装机',
  },
  {
    version: 'V1.2',
    versionCode: 3,
    submitTime: '2024-01-15 09:30:00',
    applicant: '张三',
    status: '待审核',
    rejectReason: '',
    changeDescription: '新增摄像头安装工序，完善工艺流程',
    processCode: 'PR001',
    processName: '智能手机组装工艺路线',
    product: '智能手机A1',
    description:
      '该工艺路线用于智能手机A1的组装生产，包括主板安装、屏幕贴合、电池组装、摄像头安装、外壳封装等主要工序。',
    processFlow:
      '1. 主板安装 → 2. 屏幕贴合 → 3. 电池组装 → 4. 摄像头安装 → 5. 外壳封装 → 6. 功能测试 → 7. 包装',
    operators: '张三、李四、王五',
    operationTime: '2024-01-15 08:00-17:00',
    equipmentUsage: '贴片机、点胶机、测试仪、包装机',
  },
])

const mockAuditData = {
  1: {
    id: 1,
    processCode: 'PR001',
    processName: '智能手机组装工艺路线',
    version: 'V1.2',
    product: '智能手机A1',
    description:
      '该工艺路线用于智能手机A1的组装生产，包括主板安装、屏幕贴合、电池组装、摄像头安装、外壳封装等主要工序。',
    processFlow:
      '1. 主板安装 → 2. 屏幕贴合 → 3. 电池组装 → 4. 摄像头安装 → 5. 外壳封装 → 6. 功能测试 → 7. 包装',
    operators: '张三、李四、王五',
    operationTime: '2024-01-15 08:00-17:00',
    equipmentUsage: '贴片机、点胶机、测试仪、包装机',
    applicant: '张三',
    submitTime: '2024-01-15 09:30:00',
    hasVersionHistory: true,
  },
  2: {
    id: 2,
    processCode: 'PR002',
    processName: '平板电脑组装工艺路线',
    version: 'V1.1',
    product: '平板电脑B2',
    description: '该工艺路线用于平板电脑B2的组装生产，优化了屏幕贴合工序，提高了生产效率。',
    processFlow:
      '1. 主板安装 → 2. 屏幕贴合 → 3. 电池组装 → 4. 扬声器安装 → 5. 外壳封装 → 6. 系统测试 → 7. 包装',
    operators: '李四、赵六',
    operationTime: '2024-01-15 08:00-17:00',
    equipmentUsage: '贴片机、贴合机、测试仪、包装机',
    applicant: '李四',
    submitTime: '2024-01-15 10:15:00',
    hasVersionHistory: false,
  },
  3: {
    id: 3,
    processCode: 'PR003',
    processName: '智能手表组装工艺路线',
    version: 'V2.0',
    product: '智能手表C3',
    description: '该工艺路线用于智能手表C3的组装生产，新增了防水测试工序。',
    processFlow:
      '1. 主板安装 → 2. 屏幕贴合 → 3. 电池组装 → 4. 传感器安装 → 5. 外壳封装 → 6. 防水测试 → 7. 功能测试 → 8. 包装',
    operators: '王五、孙八',
    operationTime: '2024-01-15 08:00-17:00',
    equipmentUsage: '贴片机、贴合机、防水测试仪、测试仪、包装机',
    applicant: '王五',
    submitTime: '2024-01-15 11:20:00',
    hasVersionHistory: false,
  },
  4: {
    id: 4,
    processCode: 'PR004',
    processName: '蓝牙耳机制造工艺路线',
    version: 'V1.0',
    product: '蓝牙耳机D4',
    description: '该工艺路线用于蓝牙耳机D4的生产制造。',
    processFlow: '1. 主板焊接 → 2. 喇叭安装 → 3. 电池组装 → 4. 外壳封装 → 5. 功能测试 → 6. 包装',
    operators: '赵六、周九',
    operationTime: '2024-01-15 08:00-17:00',
    equipmentUsage: '贴片机、焊接机、测试仪、包装机',
    applicant: '赵六',
    submitTime: '2024-01-15 14:05:00',
    hasVersionHistory: false,
  },
  5: {
    id: 5,
    processCode: 'PR005',
    processName: '充电器生产工艺路线',
    version: 'V1.2',
    product: '充电器E5',
    description: '该工艺路线用于充电器E5的生产制造。',
    processFlow: '1. 电路板焊接 → 2. 外壳组装 → 3. 线缆连接 → 4. 功能测试 → 5. 包装',
    operators: '钱七、吴十',
    operationTime: '2024-01-15 08:00-17:00',
    equipmentUsage: '贴片机、焊接机、测试仪、包装机',
    applicant: '钱七',
    submitTime: '2024-01-15 15:30:00',
    hasVersionHistory: false,
  },
}

const currentVersion = computed(() => {
  return mockVersionHistory.value[currentVersionIndex.value] || mockVersionHistory.value[0]
})

const loadAuditData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = mockAuditData[id] || mockAuditData[1]
    auditData.value = { ...data }
    currentVersionIndex.value = mockVersionHistory.value.length - 1
    loading.value = false
  }, 300)
}

const approveAudit = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '审核通过' })
    }, 500)
  })
}

const rejectAudit = async (reason) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '已驳回申请' })
    }, 500)
  })
}

const sendNotification = (auditStatus, rejectReasonText = '') => {
  const currentAuditor = userStore.userInfo?.name || '审核人'
  messageStore.addMessage({
    title: '工艺路线审核结果通知',
    summary: `您提交的"${currentVersion.value.processName}"${currentVersion.value.changeDescription.includes('新增') || currentVersion.value.version === 'V1.0' ? '新增' : '修改'}申请已${auditStatus}`,
    auditStatus: auditStatus,
    processCode: currentVersion.value.processCode,
    processName: currentVersion.value.processName,
    operationType:
      currentVersion.value.changeDescription.includes('新增') ||
      currentVersion.value.version === 'V1.0'
        ? '新增'
        : '修改',
    applicant: currentVersion.value.applicant,
    submitTime: currentVersion.value.submitTime,
    auditor: currentAuditor,
    auditTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    rejectReason: rejectReasonText,
  })
}

const handleApprove = async () => {
  try {
    await ElMessageBox.confirm('确定通过该工艺路线申请吗？', '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    })

    submitLoading.value = true
    const result = await approveAudit()
    submitLoading.value = false

    if (result.success) {
      sendNotification('已通过')
      ElMessage.success('审核通过')
      router.push('/audit-manage/audit-pending')
    }
  } catch {
    submitLoading.value = false
  }
}

const handleReject = () => {
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const handleRejectSubmit = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  if (rejectReason.value.length > 100) {
    ElMessage.warning('驳回原因不能超过100字')
    return
  }

  try {
    await ElMessageBox.confirm('确定驳回该工艺路线申请吗？', '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    submitLoading.value = true
    const result = await rejectAudit(rejectReason.value)
    submitLoading.value = false

    if (result.success) {
      sendNotification('已驳回', rejectReason.value)
      ElMessage.success('已驳回申请')
      rejectDialogVisible.value = false
      router.push('/audit-manage/audit-pending')
    }
  } catch {
    submitLoading.value = false
  }
}

const handleBack = () => {
  router.push('/audit-manage/audit-pending')
}

const handleViewVersionHistory = () => {
  versionHistoryVisible.value = true
}

const handleSwitchVersion = (index) => {
  currentVersionIndex.value = index
  versionHistoryVisible.value = false
  ElMessage.success(`已切换到版本 ${mockVersionHistory.value[index].version}`)
}

const handleCompareVersion = (oldIndex, newIndex) => {
  compareVersions.value = {
    old: mockVersionHistory.value[oldIndex],
    new: mockVersionHistory.value[newIndex],
  }
  compareDialogVisible.value = true
}

const getStatusType = (status) => {
  switch (status) {
    case '待审核':
      return 'warning'
    case '已通过':
      return 'success'
    case '已驳回':
      return 'danger'
    default:
      return 'info'
  }
}

onMounted(() => {
  loadAuditData()
})
</script>

<template>
  <div class="audit-pending-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ currentVersion.processName }}</h2>
          <span class="page-subtitle">待审核详情</span>
        </div>
      </div>
      <div class="header-right">
        <el-button
          v-if="auditData.hasVersionHistory"
          type="info"
          :icon="Clock"
          @click="handleViewVersionHistory"
        >
          版本历史
        </el-button>
        <el-button type="success" :icon="Check" :loading="submitLoading" @click="handleApprove"
          >通过</el-button
        >
        <el-button type="danger" :icon="Close" :loading="submitLoading" @click="handleReject"
          >驳回</el-button
        >
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <div class="version-info-bar" v-if="auditData.hasVersionHistory">
        <el-tag type="primary" size="large">当前版本：{{ currentVersion.version }}</el-tag>
        <span class="version-meta">
          提交时间：{{ currentVersion.submitTime }} | 申请人：{{ currentVersion.applicant }}
        </span>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">基础信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">工艺编号</div>
            <div class="info-value">
              <el-tag size="default">{{ currentVersion.processCode }}</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">工艺路线名称</div>
            <div class="info-value">{{ currentVersion.processName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">版本</div>
            <div class="info-value">
              <el-tag type="primary" size="default">{{ currentVersion.version }}</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">所属产品</div>
            <div class="info-value">{{ currentVersion.product }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">申请人</div>
            <div class="info-value">{{ currentVersion.applicant }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">提交时间</div>
            <div class="info-value">{{ currentVersion.submitTime }}</div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">工艺详情</span>
        </div>
        <div class="extend-info">
          <div class="extend-item">
            <div class="extend-label">工艺描述</div>
            <div class="extend-content">
              <pre class="content-pre">{{ currentVersion.description || '暂无' }}</pre>
            </div>
          </div>
          <div class="extend-item">
            <div class="extend-label">工艺流程顺序</div>
            <div class="extend-content">
              <pre class="content-pre">{{ currentVersion.processFlow || '暂无' }}</pre>
            </div>
          </div>
          <div class="info-grid-inline">
            <div class="info-item-inline">
              <div class="info-label">操作人员</div>
              <div class="info-value">{{ currentVersion.operators }}</div>
            </div>
            <div class="info-item-inline">
              <div class="info-label">操作时间</div>
              <div class="info-value">{{ currentVersion.operationTime }}</div>
            </div>
            <div class="info-item-inline">
              <div class="info-label">设备使用情况</div>
              <div class="info-value">{{ currentVersion.equipmentUsage }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="versionHistoryVisible"
      title="版本历史"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="version-history-dialog"
    >
      <div class="version-history-content">
        <el-timeline>
          <el-timeline-item
            v-for="(version, index) in mockVersionHistory"
            :key="index"
            :timestamp="version.submitTime"
            placement="top"
            :type="getStatusType(version.status)"
          >
            <div class="version-card" :class="{ active: index === currentVersionIndex }">
              <div class="version-header">
                <div class="version-title">
                  <el-tag :type="getStatusType(version.status)" size="default">
                    {{ version.status }}
                  </el-tag>
                  <span class="version-number">{{ version.version }}</span>
                </div>
                <div class="version-actions">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click="handleSwitchVersion(index)"
                    :disabled="index === currentVersionIndex"
                  >
                    查看此版本
                  </el-button>
                  <el-button
                    v-if="index < mockVersionHistory.length - 1"
                    type="warning"
                    link
                    size="small"
                    @click="handleCompareVersion(index, mockVersionHistory.length - 1)"
                  >
                    与当前版本对比
                  </el-button>
                </div>
              </div>
              <div class="version-body">
                <div class="version-row">
                  <span class="label">修改说明：</span>
                  <span class="value">{{ version.changeDescription }}</span>
                </div>
                <div class="version-row">
                  <span class="label">申请人：</span>
                  <span class="value">{{ version.applicant }}</span>
                </div>
                <div v-if="version.rejectReason" class="version-row reject-reason">
                  <span class="label">驳回原因：</span>
                  <span class="value">{{ version.rejectReason }}</span>
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <el-dialog
      v-model="compareDialogVisible"
      title="版本对比"
      width="1000px"
      :close-on-click-modal="false"
      destroy-on-close
      class="compare-dialog"
    >
      <div class="compare-content" v-if="compareVersions.old && compareVersions.new">
        <div class="compare-header">
          <div class="compare-col">
            <el-tag type="info">{{ compareVersions.old.version }}</el-tag>
            <span class="compare-time">{{ compareVersions.old.submitTime }}</span>
          </div>
          <div class="compare-arrow">
            <el-icon><Refresh /></el-icon>
          </div>
          <div class="compare-col">
            <el-tag type="primary">{{ compareVersions.new.version }}</el-tag>
            <span class="compare-time">{{ compareVersions.new.submitTime }}</span>
          </div>
        </div>
        <div class="compare-body">
          <div class="compare-item">
            <div class="compare-label">工艺描述</div>
            <div class="compare-values">
              <div class="compare-value old">
                <pre>{{ compareVersions.old.description }}</pre>
              </div>
              <div class="compare-value new">
                <pre>{{ compareVersions.new.description }}</pre>
              </div>
            </div>
          </div>
          <div class="compare-item">
            <div class="compare-label">工艺流程顺序</div>
            <div class="compare-values">
              <div class="compare-value old">
                <pre>{{ compareVersions.old.processFlow }}</pre>
              </div>
              <div class="compare-value new">
                <pre>{{ compareVersions.new.processFlow }}</pre>
              </div>
            </div>
          </div>
          <div class="compare-item">
            <div class="compare-label">操作人员</div>
            <div class="compare-values">
              <div class="compare-value old">{{ compareVersions.old.operators }}</div>
              <div class="compare-value new">{{ compareVersions.new.operators }}</div>
            </div>
          </div>
          <div class="compare-item">
            <div class="compare-label">设备使用情况</div>
            <div class="compare-values">
              <div class="compare-value old">{{ compareVersions.old.equipmentUsage }}</div>
              <div class="compare-value new">{{ compareVersions.new.equipmentUsage }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="rejectDialogVisible"
      title="驳回原因"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
      class="reject-dialog"
    >
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        maxlength="100"
        show-word-limit
        placeholder="请输入驳回原因（不超过100字）"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleRejectSubmit"
            >确定驳回</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.audit-pending-detail-container {
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

      .el-button {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  }

  .version-info-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;
    background: #f0f9ff;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #b3d8ff;

    .version-meta {
      font-size: 14px;
      color: #606266;
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
          font-size: 22px;
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
          min-height: 60px;

          .info-label {
            width: 120px;
            padding: 18px 20px;
            background: #fafafa;
            font-size: 18px;
            color: #606266;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            font-weight: 500;
          }

          .info-value {
            flex: 1;
            padding: 18px 20px;
            font-size: 16px;
            color: #303133;
            display: flex;
            align-items: center;
          }
        }
      }

      .extend-info {
        padding: 20px;

        .extend-item {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }

          .extend-label {
            font-size: 18px;
            color: #606266;
            margin-bottom: 12px;
            font-weight: 500;
          }

          .extend-content {
            background: #fafafa;
            border-radius: 4px;
            padding: 16px;

            .content-pre {
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: inherit;
              line-height: 1.8;
              font-size: 16px;
              color: #303133;
            }
          }
        }

        .info-grid-inline {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #ebeef5;
          padding: 1px;
          margin-top: 20px;

          .info-item-inline {
            display: flex;
            align-items: stretch;
            background: #fff;
            min-height: 50px;

            .info-label {
              width: 110px;
              padding: 14px 16px;
              background: #fafafa;
              font-size: 16px;
              color: #606266;
              display: flex;
              align-items: center;
              flex-shrink: 0;
              font-weight: 500;
            }

            .info-value {
              flex: 1;
              padding: 14px 16px;
              font-size: 15px;
              color: #303133;
              display: flex;
              align-items: center;
            }
          }
        }
      }
    }
  }
}

.version-history-dialog {
  .version-history-content {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 10px;

    .version-card {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e4e7ed;
      transition: all 0.3s;

      &.active {
        border-color: #409eff;
        background: #f0f9ff;
      }

      .version-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .version-title {
          display: flex;
          align-items: center;
          gap: 12px;

          .version-number {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
          }
        }

        .version-actions {
          display: flex;
          gap: 8px;
        }
      }

      .version-body {
        .version-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: #909399;
            min-width: 80px;
          }

          .value {
            color: #303133;
            flex: 1;
          }

          &.reject-reason {
            .value {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
}

.compare-dialog {
  .compare-content {
    .compare-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      .compare-col {
        display: flex;
        align-items: center;
        gap: 12px;

        .compare-time {
          font-size: 14px;
          color: #909399;
        }
      }

      .compare-arrow {
        color: #409eff;
        font-size: 20px;
      }
    }

    .compare-body {
      .compare-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .compare-label {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 12px;
        }

        .compare-values {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;

          .compare-value {
            padding: 16px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 1.6;

            &.old {
              background: #fef0f0;
              border: 1px solid #fbc4c4;
              color: #f56c6c;
            }

            &.new {
              background: #f0f9ff;
              border: 1px solid #b3d8ff;
              color: #409eff;
            }

            pre {
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: inherit;
            }
          }
        }
      }
    }
  }
}

.reject-dialog {
  :deep(.el-dialog__header) {
    padding: 14px 21px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 20px;
    border-top: 1px solid #ebeef5;
  }
}

@media screen and (max-width: 1200px) {
  .audit-pending-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .extend-info {
          .info-grid-inline {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .audit-pending-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: 1fr;
        }

        .extend-info {
          .info-grid-inline {
            grid-template-columns: 1fr;
          }
        }
      }
    }
  }
}
</style>
