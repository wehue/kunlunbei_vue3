<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const auditData = ref({})

const mockAuditData = {
  1: {
    id: 1,
    processCode: 'PR001',
    processName: '智能手机组装工艺路线',
    version: 'V1.0',
    product: '智能手机A1',
    description:
      '该工艺路线用于智能手机A1的组装生产，包括主板安装、屏幕贴合、电池组装、外壳封装等主要工序。',
    processFlow:
      '1. 主板安装 → 2. 屏幕贴合 → 3. 电池组装 → 4. 摄像头安装 → 5. 外壳封装 → 6. 功能测试 → 7. 包装',
    operators: '张三、李四、王五',
    operationTime: '2024-01-10 08:00-17:00',
    equipmentUsage: '贴片机、点胶机、测试仪、包装机',
    applicant: '张三',
    submitTime: '2024-01-10 09:30:00',
    auditor: '李四',
    auditTime: '2024-01-10 14:20:00',
    auditStatus: '已通过',
    rejectReason: '',
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
    operationTime: '2024-01-11 08:00-17:00',
    equipmentUsage: '贴片机、贴合机、测试仪、包装机',
    applicant: '李四',
    submitTime: '2024-01-11 10:15:00',
    auditor: '张三',
    auditTime: '2024-01-11 16:30:00',
    auditStatus: '已驳回',
    rejectReason: '工艺流程顺序存在错误，屏幕贴合应在电池组装之前进行，请修改后重新提交。',
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
    operationTime: '2024-01-12 08:00-17:00',
    equipmentUsage: '贴片机、贴合机、防水测试仪、测试仪、包装机',
    applicant: '王五',
    submitTime: '2024-01-12 11:20:00',
    auditor: '李四',
    auditTime: '2024-01-12 15:45:00',
    auditStatus: '已通过',
    rejectReason: '',
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
    operationTime: '2024-01-13 08:00-17:00',
    equipmentUsage: '贴片机、焊接机、测试仪、包装机',
    applicant: '赵六',
    submitTime: '2024-01-13 14:05:00',
    auditor: '王五',
    auditTime: '2024-01-13 17:10:00',
    auditStatus: '已通过',
    rejectReason: '',
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
    operationTime: '2024-01-14 08:00-17:00',
    equipmentUsage: '贴片机、焊接机、测试仪、包装机',
    applicant: '钱七',
    submitTime: '2024-01-14 15:30:00',
    auditor: '张三',
    auditTime: '2024-01-14 18:00:00',
    auditStatus: '已驳回',
    rejectReason: '缺少安全测试工序，充电器产品必须包含安全测试环节，请补充后重新提交。',
  },
}

const loadAuditData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = mockAuditData[id] || mockAuditData[1]
    auditData.value = { ...data }
    loading.value = false
  }, 300)
}

const handleBack = () => {
  router.push('/audit-manage/audit-record')
}

onMounted(() => {
  loadAuditData()
})
</script>

<template>
  <div class="audit-record-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ auditData.processName }}</h2>
          <span class="page-subtitle">审核记录详情</span>
        </div>
      </div>
      <div class="header-right">
        <el-tag :type="auditData.auditStatus === '已通过' ? 'success' : 'danger'" size="large">
          {{ auditData.auditStatus }}
        </el-tag>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">基本信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">工艺编号</div>
            <div class="info-value">
              <el-tag size="default">{{ auditData.processCode }}</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">工艺路线名称</div>
            <div class="info-value">{{ auditData.processName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">版本</div>
            <div class="info-value">
              <el-tag type="primary" size="default">{{ auditData.version }}</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">所属产品</div>
            <div class="info-value">{{ auditData.product }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">申请人</div>
            <div class="info-value">{{ auditData.applicant }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">提交时间</div>
            <div class="info-value">{{ auditData.submitTime }}</div>
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
              <pre class="content-pre">{{ auditData.description || '暂无' }}</pre>
            </div>
          </div>
          <div class="extend-item">
            <div class="extend-label">工艺流程顺序</div>
            <div class="extend-content">
              <pre class="content-pre">{{ auditData.processFlow || '暂无' }}</pre>
            </div>
          </div>
          <div class="info-grid-inline">
            <div class="info-item-inline">
              <div class="info-label">操作人员</div>
              <div class="info-value">{{ auditData.operators }}</div>
            </div>
            <div class="info-item-inline">
              <div class="info-label">操作时间</div>
              <div class="info-value">{{ auditData.operationTime }}</div>
            </div>
            <div class="info-item-inline">
              <div class="info-label">设备使用情况</div>
              <div class="info-value">{{ auditData.equipmentUsage }}</div>
            </div>
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
            <div class="info-value">{{ auditData.auditor }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">审核时间</div>
            <div class="info-value">{{ auditData.auditTime }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">审核状态</div>
            <div class="info-value">
              <el-tag
                :type="auditData.auditStatus === '已通过' ? 'success' : 'danger'"
                size="default"
              >
                {{ auditData.auditStatus }}
              </el-tag>
            </div>
          </div>
        </div>
        <div v-if="auditData.rejectReason" class="reject-reason">
          <div class="reject-label">驳回原因</div>
          <div class="reject-content">
            <pre class="content-pre">{{ auditData.rejectReason }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.audit-record-detail-container {
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

      .reject-reason {
        padding: 20px;
        border-top: 1px solid #ebeef5;

        .reject-label {
          font-size: 18px;
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
            font-size: 16px;
            color: #f56c6c;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .audit-record-detail-container {
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
  .audit-record-detail-container {
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
