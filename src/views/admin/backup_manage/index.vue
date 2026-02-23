<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  Upload,
  Refresh,
  Delete,
  View,
  WarningFilled,
  Document,
} from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

const backupHistory = ref([
  {
    id: 1,
    backupName: '系统全量备份_20240115',
    backupTime: '2024-01-15 08:00:00',
    backupType: '全量备份',
    dataSize: '2.5MB',
    operator: '系统管理员',
    status: '成功',
  },
  {
    id: 2,
    backupName: '设备数据备份_20240116',
    backupTime: '2024-01-16 08:00:00',
    backupType: '增量备份',
    dataSize: '0.8MB',
    operator: '系统管理员',
    status: '成功',
  },
  {
    id: 3,
    backupName: '物料数据备份_20240117',
    backupTime: '2024-01-17 08:00:00',
    backupType: '增量备份',
    dataSize: '1.2MB',
    operator: '系统管理员',
    status: '成功',
  },
  {
    id: 4,
    backupName: '系统全量备份_20240118',
    backupTime: '2024-01-18 08:00:00',
    backupType: '全量备份',
    dataSize: '2.8MB',
    operator: '系统管理员',
    status: '成功',
  },
  {
    id: 5,
    backupName: '用户数据备份_20240119',
    backupTime: '2024-01-19 08:00:00',
    backupType: '增量备份',
    dataSize: '0.3MB',
    operator: '系统管理员',
    status: '失败',
  },
])

const backupModules = ref([
  { key: 'devices', label: '设备数据', selected: true, count: 89 },
  { key: 'materials', label: '物料数据', selected: true, count: 1256 },
  { key: 'processes', label: '工序数据', selected: true, count: 342 },
  { key: 'routes', label: '工艺路线数据', selected: true, count: 156 },
  { key: 'users', label: '用户数据', selected: false, count: 45 },
  { key: 'departments', label: '部门数据', selected: false, count: 12 },
  { key: 'warehouses', label: '仓库数据', selected: false, count: 8 },
  { key: 'products', label: '产品数据', selected: false, count: 12 },
])

const backupDialogVisible = ref(false)
const restoreDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentBackup = ref(null)
const uploadRef = ref()
const uploadFile = ref(null)
const backupProgress = ref(0)
const isBackingUp = ref(false)

const selectedModules = computed(() => backupModules.value.filter((m) => m.selected))

const handleSelectAll = () => {
  backupModules.value.forEach((m) => (m.selected = true))
}

const handleDeselectAll = () => {
  backupModules.value.forEach((m) => (m.selected = false))
}

const handleCreateBackup = async () => {
  if (selectedModules.value.length === 0) {
    ElMessage.warning('请至少选择一个备份模块')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要备份选中的 ${selectedModules.value.length} 个模块数据吗？`,
      '备份确认',
      {
        confirmButtonText: '确定备份',
        cancelButtonText: '取消',
        type: 'info',
      },
    )

    isBackingUp.value = true
    backupProgress.value = 0

    const progressInterval = setInterval(() => {
      if (backupProgress.value < 90) {
        backupProgress.value += 10
      }
    }, 200)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    clearInterval(progressInterval)
    backupProgress.value = 100

    const backupData = {}
    selectedModules.value.forEach((module) => {
      backupData[module.key] = {
        label: module.label,
        count: module.count,
        data: generateMockData(module.key, module.count),
      }
    })

    const ws = XLSX.utils.json_to_sheet([
      { 备份信息: '昆仑贝生产管理系统数据备份' },
      { 备份时间: new Date().toLocaleString() },
      { 操作人: userStore.userInfo?.userName || '系统管理员' },
      { 备份模块: selectedModules.value.map((m) => m.label).join('、') },
      {},
      { 模块: '数据内容见下方各工作表' },
    ])

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '备份信息')

    Object.keys(backupData).forEach((key) => {
      const moduleData = backupData[key]
      if (moduleData.data.length > 0) {
        const moduleWs = XLSX.utils.json_to_sheet(moduleData.data)
        XLSX.utils.book_append_sheet(wb, moduleWs, moduleData.label.slice(0, 10))
      }
    })

    const fileName = `系统备份_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`
    XLSX.writeFile(wb, fileName)

    backupHistory.value.unshift({
      id: backupHistory.value.length + 1,
      backupName: fileName.replace('.xlsx', ''),
      backupTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      backupType:
        selectedModules.value.length === backupModules.value.length ? '全量备份' : '增量备份',
      dataSize: `${(Math.random() * 3 + 0.5).toFixed(1)}MB`,
      operator: userStore.userInfo?.userName || '系统管理员',
      status: '成功',
    })

    ElMessage.success('数据备份成功，文件已下载')
    backupDialogVisible.value = false
    isBackingUp.value = false
    backupProgress.value = 0
  } catch {
    isBackingUp.value = false
    backupProgress.value = 0
  }
}

const generateMockData = (key, count) => {
  const data = []
  for (let i = 0; i < Math.min(count, 10); i++) {
    data.push({
      序号: i + 1,
      编号: `${key.toUpperCase()}${String(i + 1).padStart(4, '0')}`,
      名称: `${key === 'devices' ? '设备' : key === 'materials' ? '物料' : '数据'}${i + 1}`,
      状态: '正常',
      创建时间: new Date().toISOString().slice(0, 10),
    })
  }
  return data
}

const handleRestoreBackup = async () => {
  if (!uploadFile.value) {
    ElMessage.warning('请先选择要恢复的备份文件')
    return
  }

  try {
    await ElMessageBox.confirm(
      '恢复数据将覆盖当前系统中的相关数据，此操作不可逆，确定要继续吗？',
      '恢复警告',
      {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    ElMessage.success('数据恢复成功')
    restoreDialogVisible.value = false
    uploadFile.value = null
  } catch {
    // 用户取消
  }
}

const handleFileChange = (file) => {
  uploadFile.value = file.raw
  return false
}

const handleDownloadBackup = (row) => {
  ElMessage.success(`正在下载备份文件：${row.backupName}.xlsx`)
}

const handleViewDetail = (row) => {
  currentBackup.value = row
  detailDialogVisible.value = true
}

const handleDeleteBackup = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除备份"${row.backupName}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const index = backupHistory.value.findIndex((item) => item.id === row.id)
    if (index > -1) {
      backupHistory.value.splice(index, 1)
      ElMessage.success('备份记录已删除')
    }
  } catch {
    // 用户取消
  }
}

const getStatusType = (status) => {
  return status === '成功' ? 'success' : 'danger'
}
</script>

<template>
  <div class="backup-manage-container">
    <div class="page-header">
      <h2 class="page-title">数据备份管理</h2>
      <div class="header-actions">
        <el-button type="primary" :icon="Download" @click="backupDialogVisible = true"
          >创建备份</el-button
        >
        <el-button type="success" :icon="Upload" @click="restoreDialogVisible = true"
          >恢复数据</el-button
        >
      </div>
    </div>

    <div class="backup-stats">
      <div class="stat-card">
        <div class="stat-value">{{ backupHistory.length }}</div>
        <div class="stat-label">备份总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ backupHistory.filter((b) => b.status === '成功').length }}</div>
        <div class="stat-label">成功备份</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">
          {{ backupHistory.filter((b) => b.backupType === '全量备份').length }}
        </div>
        <div class="stat-label">全量备份</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ backupModules.reduce((sum, m) => sum + m.count, 0) }}</div>
        <div class="stat-label">数据总量</div>
      </div>
    </div>

    <div class="backup-modules">
      <div class="section-title">
        <span>数据模块概览</span>
        <div class="title-actions">
          <el-button size="small" @click="handleSelectAll">全选</el-button>
          <el-button size="small" @click="handleDeselectAll">取消全选</el-button>
        </div>
      </div>
      <div class="module-grid">
        <div
          v-for="module in backupModules"
          :key="module.key"
          class="module-card"
          :class="{ selected: module.selected }"
        >
          <el-checkbox v-model="module.selected" />
          <div class="module-info">
            <div class="module-name">{{ module.label }}</div>
            <div class="module-count">{{ module.count }} 条数据</div>
          </div>
        </div>
      </div>
    </div>

    <div class="backup-history">
      <div class="section-title">
        <span>备份历史记录</span>
      </div>
      <el-table :data="backupHistory" border stripe>
        <el-table-column prop="backupName" label="备份名称" min-width="200" />
        <el-table-column prop="backupTime" label="备份时间" width="180" />
        <el-table-column prop="backupType" label="备份类型" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.backupType === '全量备份' ? 'primary' : 'success'"
              size="small"
            >
              {{ scope.row.backupType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dataSize" label="数据大小" width="100" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link :icon="View" @click="handleViewDetail(scope.row)"
              >详情</el-button
            >
            <el-button
              v-if="scope.row.status === '成功'"
              type="success"
              link
              :icon="Download"
              @click="handleDownloadBackup(scope.row)"
            >
              下载
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDeleteBackup(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="backupDialogVisible" title="创建数据备份" width="600px">
      <div class="backup-dialog-content">
        <div class="backup-warning">
          <el-icon><WarningFilled /></el-icon>
          <span>备份文件将自动下载到本地，请妥善保管备份文件</span>
        </div>

        <div class="selected-modules">
          <div class="label">已选择备份模块：</div>
          <div class="module-tags">
            <el-tag
              v-for="module in selectedModules"
              :key="module.key"
              type="info"
              style="margin: 4px"
            >
              {{ module.label }} ({{ module.count }}条)
            </el-tag>
            <span v-if="selectedModules.length === 0" class="no-selection">未选择任何模块</span>
          </div>
        </div>

        <el-progress
          v-if="isBackingUp"
          :percentage="backupProgress"
          :status="backupProgress === 100 ? 'success' : ''"
          style="margin-top: 20px"
        />
      </div>
      <template #footer>
        <el-button @click="backupDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="isBackingUp"
          :disabled="selectedModules.length === 0"
          @click="handleCreateBackup"
        >
          {{ isBackingUp ? '备份中...' : '开始备份' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="restoreDialogVisible" title="恢复数据" width="500px">
      <div class="restore-dialog-content">
        <div class="restore-warning">
          <el-icon><WarningFilled /></el-icon>
          <span>警告：恢复数据将覆盖当前系统中的相关数据，此操作不可逆！</span>
        </div>

        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">将备份文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">只能上传 xlsx/xls 格式的备份文件</div>
          </template>
        </el-upload>

        <div v-if="uploadFile" class="uploaded-file">
          <el-icon><Document /></el-icon>
          <span>{{ uploadFile.name }}</span>
          <el-button type="danger" link @click="uploadFile = null">移除</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="restoreDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!uploadFile" @click="handleRestoreBackup">
          开始恢复
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="备份详情" width="500px">
      <el-descriptions :column="1" border v-if="currentBackup">
        <el-descriptions-item label="备份名称">{{ currentBackup.backupName }}</el-descriptions-item>
        <el-descriptions-item label="备份时间">{{ currentBackup.backupTime }}</el-descriptions-item>
        <el-descriptions-item label="备份类型">
          <el-tag
            :type="currentBackup.backupType === '全量备份' ? 'primary' : 'success'"
            size="small"
          >
            {{ currentBackup.backupType }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="数据大小">{{ currentBackup.dataSize }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentBackup.operator }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentBackup.status)" size="small">
            {{ currentBackup.status }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentBackup?.status === '成功'"
          type="success"
          :icon="Download"
          @click="handleDownloadBackup(currentBackup)"
        >
          下载备份
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.backup-manage-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px 20px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .page-title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .backup-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    .stat-card {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      text-align: center;

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #409eff;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 8px;
      }
    }
  }

  .backup-modules {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .module-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;

      .module-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 1px solid #dcdfe6;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #409eff;
        }

        &.selected {
          border-color: #409eff;
          background: #ecf5ff;
        }

        .module-info {
          .module-name {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
          }

          .module-count {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .backup-history {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }
  }

  .backup-dialog-content {
    .backup-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fdf6ec;
      border-radius: 4px;
      color: #e6a23c;
      margin-bottom: 20px;
    }

    .selected-modules {
      .label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }

      .module-tags {
        display: flex;
        flex-wrap: wrap;

        .no-selection {
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }

  .restore-dialog-content {
    .restore-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fef0f0;
      border-radius: 4px;
      color: #f56c6c;
      margin-bottom: 20px;
    }

    .upload-area {
      width: 100%;

      :deep(.el-upload-dragger) {
        width: 100%;
      }
    }

    .uploaded-file {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px 16px;
      background: #f5f7fa;
      border-radius: 4px;

      span {
        flex: 1;
        color: #606266;
      }
    }
  }
}
</style>
