<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Download, Check, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'
import { getProcessRouteList, deleteProcessRoute, submitProcessRoute } from '@/api/process'

const router = useRouter()
const { hasPermission, isAdminRole, isSupervisorRole, isDesignerRole, currentRole } =
  usePermission()

const proTableRef = ref()

const statusOptions = [
  { label: '待提交', value: 'W' },
  { label: '审核中', value: 'F' },
  { label: '已通过', value: 'T' },
  { label: '已驳回', value: 'Y' },
]

const versionOptions = [
  { label: 'V1.0', value: 'V1.0' },
  { label: 'V2.0', value: 'V2.0' },
  { label: 'V3.0', value: 'V3.0' },
]

const allRouteData = ref([])

const canAdd = computed(() => isDesignerRole.value)
const canApprove = computed(() => isSupervisorRole.value)
const canEdit = computed(() => isDesignerRole.value)
const canSubmitAudit = computed(() => isDesignerRole.value)
const canManageRoute = computed(() => isDesignerRole.value)

const getStatusType = (status) => {
  const map = {
    W: 'info',
    F: 'warning',
    T: 'success',
    Y: 'danger',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    W: '待提交',
    F: '审核中',
    T: '已通过',
    Y: '已驳回',
  }
  return map[status] || status
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  {
    prop: 'routeCode',
    label: '工艺编号',
    minWidth: 130,
    search: { el: 'input', key: 'routeCode' },
  },
  {
    prop: 'routeName',
    label: '工艺名称',
    minWidth: 160,
    search: { el: 'input', key: 'routeName' },
  },
  {
    prop: 'product',
    label: '所属产品',
    minWidth: 130,
    search: { el: 'input', key: 'product' },
  },
  {
    prop: 'version',
    label: '版本',
    minWidth: 80,
    align: 'center',
    search: { el: 'select', key: 'version' },
    enum: versionOptions,
  },
  {
    prop: 'status',
    label: '审核状态',
    minWidth: 100,
    align: 'center',
    search: { el: 'select', key: 'status' },
    enum: statusOptions,
  },
  { prop: 'operationTime', label: '操作时间', minWidth: 160 },
  { prop: 'operation', label: '操作', width: 200, fixed: 'right' },
])

const handleAdd = () => {
  router.push('/process-route-manage/process-route-manage-add')
}

const handleView = (row) => {
  router.push(`/process-route-manage/process-route-manage-detail/${row.routeCode}`)
}

const handleSubmitAudit = (row) => {
  if (row.status !== 'Y' && row.status !== 'W') {
    ElMessage.warning('只有待提交或已驳回状态的工艺路线可以提交审核')
    return
  }
  ElMessageBox.confirm('确定要提交审核吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(async () => {
      try {
        // 确保row.id存在
        if (!row.id) {
          ElMessage.error('工艺路线ID不存在')
          return
        }

        console.log('调用提交审核接口，参数:', { id: row.id })
        const res = await submitProcessRoute({ id: row.id })
        console.log('提交审核接口响应:', res)

        if (res.data?.code === 200) {
          ElMessage.success('已提交审核')
          // 等待一小段时间后刷新列表
          setTimeout(() => {
            try {
              // 使用.value访问组件实例
              if (proTableRef.value?.search) {
                proTableRef.value.search()
                console.log('使用search方法刷新列表成功')
              } else if (proTableRef.value?.getTableList) {
                proTableRef.value.getTableList()
                console.log('使用getTableList方法刷新列表成功')
              } else {
                console.error('ProTable组件没有刷新方法')
              }
            } catch (error) {
              console.error('刷新列表失败:', error)
            }
          }, 500)
        } else {
          ElMessage.error('提交审核失败')
        }
      } catch (error) {
        console.error('提交审核失败:', error)
        ElMessage.error('提交审核失败')
      }
    })
    .catch(() => {})
}

const handleDelete = (row) => {
  console.log('删除工艺路线:', row)
  console.log('工艺路线ID:', row.routeCode)

  ElMessageBox.confirm('确定要删除该工艺路线吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'danger',
  })
    .then(async () => {
      try {
        // 确保routeCode存在
        if (!row.routeCode) {
          ElMessage.error('工艺路线ID不存在')
          return
        }

        console.log('调用删除接口，参数:', { workingPlanId: row.routeCode })
        const res = await deleteProcessRoute({ workingPlanId: row.routeCode })
        console.log('删除接口响应:', res)

        if (res.data?.code === 200) {
          ElMessage.success('删除成功')
          // 等待一小段时间后刷新列表
          setTimeout(() => {
            try {
              // 使用.value访问组件实例
              if (proTableRef.value?.search) {
                proTableRef.value.search()
                console.log('使用search方法刷新列表成功')
              } else if (proTableRef.value?.getTableList) {
                proTableRef.value.getTableList()
                console.log('使用getTableList方法刷新列表成功')
              } else {
                console.error('ProTable组件没有刷新方法')
              }
            } catch (error) {
              console.error('刷新列表失败:', error)
            }
          }, 500)
        } else {
          ElMessage.error('删除失败')
        }
      } catch (error) {
        console.error('删除工艺路线失败:', error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}

const exportToExcel = (data, fileName = '工艺路线列表') => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const handleExportSingle = (row) => {
  const exportData = [
    {
      工艺编号: row.routeCode,
      工艺名称: row.routeName,
      所属产品: row.product,
      版本: row.version,
      审核状态: getStatusLabel(row.status),
      操作时间: row.operationTime,
    },
  ]
  exportToExcel(exportData, `工艺路线_${row.routeCode}`)
  ElMessage.success('导出成功')
}

const handleExportBatch = (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要导出的工艺路线')
    return
  }
  const exportData = selectedList.map((row) => ({
    工艺编号: row.routeCode,
    工艺名称: row.routeName,
    所属产品: row.product,
    版本: row.version,
    审核状态: getStatusLabel(row.status),
    操作时间: row.operationTime,
  }))
  exportToExcel(exportData, `工艺路线列表_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const getTableList = async (params) => {
  try {
    // 构建查询参数，映射字段名
    const queryParams = {
      workingPlanId: params?.routeCode,
      workingPlanName: params?.routeName,
      productId: params?.product,
      version: params?.version,
      status: params?.status,
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
    }

    const res = await getProcessRouteList(queryParams)
    console.log('获取工艺路线列表信息成功', res)

    let data = res.data?.data?.data || res.data?.data || []
    if (!Array.isArray(data)) {
      data = []
    }

    // 按工艺编号分组，只保留最新版本
    const routeGroups = {}
    data.forEach((item) => {
      const routeCode = item.workingPlanId || item.id
      if (!routeGroups[routeCode]) {
        routeGroups[routeCode] = item
      } else {
        // 比较版本号，保留最新版本
        const currentVersion = parseFloat(routeGroups[routeCode].version?.replace('V', '') || 0)
        const newVersion = parseFloat(item.version?.replace('V', '') || 0)
        if (newVersion > currentVersion) {
          routeGroups[routeCode] = item
        }
      }
    })

    // 映射字段
    const mappedData = Object.values(routeGroups).map((item, index) => {
      const productName =
        item.associatedProduct?.name ||
        item.associatedProduct?.productName ||
        item.associatedProduct?.productname ||
        ''
      return {
        id: item.id,
        routeCode: item.workingPlanId || '',
        routeName: item.workingPlanName || '',
        product: productName,
        version: item.version || '',
        status: item.status || '',
        operationTime: formatDateTime(item.operateTime || item.operationTime || ''),
        isCurrent: true, // 默认为当前版本
        baseId: item.workingPlanId || item.id, // 使用工艺编号作为基础ID
        index: ((params?.pageNum || 1) - 1) * (params?.pageSize || 10) + index + 1,
        versionCount: 1, // 默认为1个版本
      }
    })

    return {
      data: {
        list: mappedData,
        total: mappedData.length,
      },
    }
  } catch (error) {
    console.error('获取工艺路线列表失败:', error)
    ElMessage.error('获取工艺路线列表失败')
    return {
      data: {
        list: [],
        total: 0,
      },
    }
  }
}
</script>

<template>
  <div class="process-route-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader="scope">
        <div class="header-controls">
          <div class="header-left">
            <el-button v-if="canManageRoute" type="primary" :icon="Plus" @click="handleAdd"
              >新增工艺路线</el-button
            >
            <el-button
              type="success"
              :icon="Download"
              :disabled="!scope.isSelected"
              @click="handleExportBatch(scope.selectedList)"
            >
              批量导出
            </el-button>
          </div>
        </div>
      </template>

      <template #routeCode="scope">
        <span>{{ scope.row.routeCode }}</span>
      </template>

      <template #version="scope">
        <div class="version-cell">
          <el-tag size="default" :type="scope.row.isCurrent ? 'success' : 'info'">
            {{ scope.row.version }}
          </el-tag>
          <el-tooltip
            v-if="scope.row.versionCount > 1"
            :content="`该工艺路线包含${scope.row.versionCount}个历史版本，点击详情页可切换查看`"
            placement="top"
          >
            <span class="version-icon">🔄</span>
          </el-tooltip>
        </div>
      </template>

      <template #status="scope">
        <el-tag :type="getStatusType(scope.row.status)" size="default">
          {{ getStatusLabel(scope.row.status) }}
        </el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button
          v-if="canApprove && (scope.row.status === 'W' || scope.row.status === 'F')"
          type="primary"
          link
          :icon="Check"
          @click="handleSubmitAudit(scope.row)"
        >
          审核
        </el-button>
        <el-button
          v-if="canSubmitAudit && (scope.row.status === 'W' || scope.row.status === 'Y')"
          type="warning"
          link
          @click="handleSubmitAudit(scope.row)"
        >
          提交审核
        </el-button>
        <el-button
          v-if="isAdminRole"
          type="danger"
          link
          :icon="Delete"
          @click="handleDelete(scope.row)"
        >
          删除
        </el-button>
      </template>
    </ProTable>
  </div>
</template>

<style lang="scss" scoped>
.process-route-container {
  :deep(.table-search) {
    margin-bottom: 10px !important;
  }

  :deep(.table-header) {
    .header-button-lf {
      width: 100%;
    }
  }

  .header-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-right {
      display: flex;
      align-items: center;
    }
  }

  .version-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .version-icon {
      cursor: pointer;
      font-size: 14px;
    }
  }
}
</style>
