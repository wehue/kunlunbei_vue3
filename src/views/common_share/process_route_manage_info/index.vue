<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Download, Check } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const userStore = useUserStore()

const proTableRef = ref()
const showAllVersions = ref(false)
const currentRole = computed(() => userStore.userInfo.role || 'admin')

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
]

const productOptions = [
  { label: '汽车零部件A', value: '汽车零部件A' },
  { label: '电子设备B', value: '电子设备B' },
  { label: '管道组件C', value: '管道组件C' },
  { label: '机械零件D', value: '机械零件D' },
]

const allRouteData = ref([
  {
    id: 1,
    routeCode: 'PR20240001',
    routeName: '汽车零部件加工工艺',
    product: '汽车零部件A',
    description: '用于汽车零部件的加工工艺路线',
    version: 'V1.0',
    isCurrent: false,
    status: 'approved',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        stepName: '车削加工',
        order: 1,
        devices: ['数控车床'],
        operators: ['张三'],
        bomItems: ['铝合金板'],
      },
      {
        id: 2,
        stepName: '铣削加工',
        order: 2,
        devices: ['数控铣床'],
        operators: ['李四'],
        bomItems: ['黄铜'],
      },
    ],
    operationTime: '2024-01-15 10:30:00',
    createTime: '2024-01-10 09:00:00',
    baseId: 'PR001',
  },
  {
    id: 2,
    routeCode: 'PR20240001',
    routeName: '汽车零部件加工工艺',
    product: '汽车零部件A',
    description: '用于汽车零部件的加工工艺路线（优化版）',
    version: 'V2.0',
    isCurrent: true,
    status: 'approved',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        stepName: '车削加工',
        order: 1,
        devices: ['数控车床'],
        operators: ['张三'],
        bomItems: ['铝合金板'],
      },
      {
        id: 2,
        stepName: '铣削加工',
        order: 2,
        devices: ['数控铣床'],
        operators: ['李四'],
        bomItems: ['黄铜'],
      },
      {
        id: 3,
        stepName: '质量检测',
        order: 3,
        devices: ['检测设备'],
        operators: ['王五'],
        bomItems: [],
      },
    ],
    operationTime: '2024-01-20 14:00:00',
    createTime: '2024-01-10 09:00:00',
    baseId: 'PR001',
  },
  {
    id: 3,
    routeCode: 'PR20240002',
    routeName: '电子设备组装工艺',
    product: '电子设备B',
    description: '电子设备的组装工艺路线',
    version: 'V1.0',
    isCurrent: true,
    status: 'pending',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        stepName: '组装工序',
        order: 1,
        devices: ['组装台'],
        operators: ['赵六'],
        bomItems: ['ABS塑料', '集成电路'],
      },
      {
        id: 2,
        stepName: '质量检测',
        order: 2,
        devices: ['检测设备'],
        operators: ['王五'],
        bomItems: [],
      },
    ],
    operationTime: '2024-01-18 11:00:00',
    createTime: '2024-01-18 11:00:00',
    baseId: 'PR002',
  },
  {
    id: 4,
    routeCode: 'PR20240003',
    routeName: '管道组件焊接工艺',
    product: '管道组件C',
    description: '管道组件的焊接工艺路线',
    version: 'V1.0',
    isCurrent: true,
    status: 'rejected',
    rejectReason: '工艺流程不完整，缺少质量检测环节',
    processSteps: [
      {
        id: 1,
        stepName: '焊接',
        order: 1,
        devices: ['焊接设备'],
        operators: ['孙七'],
        bomItems: ['碳钢'],
      },
    ],
    operationTime: '2024-01-22 16:30:00',
    createTime: '2024-01-22 16:30:00',
    baseId: 'PR003',
  },
  {
    id: 5,
    routeCode: 'PR20240004',
    routeName: '机械零件精加工工艺',
    product: '机械零件D',
    description: '机械零件的精加工工艺路线',
    version: 'V1.0',
    isCurrent: true,
    status: 'approved',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        stepName: '车削加工',
        order: 1,
        devices: ['数控车床'],
        operators: ['张三'],
        bomItems: ['黄铜'],
      },
      {
        id: 2,
        stepName: '磨削精加工',
        order: 2,
        devices: ['磨床'],
        operators: ['李四'],
        bomItems: [],
      },
      {
        id: 3,
        stepName: '质量检测',
        order: 3,
        devices: ['检测设备'],
        operators: ['王五'],
        bomItems: [],
      },
    ],
    operationTime: '2024-01-25 09:00:00',
    createTime: '2024-01-25 09:00:00',
    baseId: 'PR004',
  },
])

const getVersionCount = (baseId) => {
  return allRouteData.value.filter((r) => r.baseId === baseId).length
}

const displayData = computed(() => {
  if (showAllVersions.value) {
    return allRouteData.value
  }
  return allRouteData.value.filter((r) => r.isCurrent)
})

const canAdd = computed(() => currentRole.value === 'designer')
const canApprove = computed(() => currentRole.value === 'supervisor')
const canEdit = computed(() => currentRole.value === 'designer')
const canSubmitAudit = computed(() => currentRole.value === 'designer')

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  }
  return map[status] || status
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
    label: '工艺路线名称',
    minWidth: 160,
    search: { el: 'input', key: 'routeName' },
  },
  {
    prop: 'product',
    label: '所属产品',
    minWidth: 130,
    search: { el: 'select', key: 'product' },
    enum: productOptions,
  },
  {
    prop: 'version',
    label: '版本',
    minWidth: 80,
    align: 'center',
    search: { el: 'input', key: 'version' },
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
  router.push(`/process-route-manage/process-route-manage-detail/${row.id}`)
}

const handleSubmitAudit = (row) => {
  if (row.status !== 'rejected') {
    ElMessage.warning('只有已驳回状态的工艺路线可以提交审核')
    return
  }
  ElMessageBox.confirm('确定要提交审核吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(() => {
      const route = allRouteData.value.find((r) => r.id === row.id)
      if (route) {
        route.status = 'pending'
        row.status = 'pending'
      }
      ElMessage.success('已提交审核')
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
      工艺路线名称: row.routeName,
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
    工艺路线名称: row.routeName,
    所属产品: row.product,
    版本: row.version,
    审核状态: getStatusLabel(row.status),
    操作时间: row.operationTime,
  }))
  exportToExcel(exportData, `工艺路线列表_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...displayData.value]

      if (params?.routeCode) {
        filteredData = filteredData.filter((item) => item.routeCode.includes(params.routeCode))
      }

      if (params?.routeName) {
        filteredData = filteredData.filter((item) => item.routeName.includes(params.routeName))
      }

      if (params?.product) {
        filteredData = filteredData.filter((item) => item.product === params.product)
      }

      if (params?.version) {
        filteredData = filteredData.filter((item) => item.version.includes(params.version))
      }

      if (params?.status) {
        filteredData = filteredData.filter((item) => item.status === params.status)
      }

      const pageNum = params?.pageNum || 1
      const pageSize = params?.pageSize || 10
      const startIndex = (pageNum - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)

      const dataWithIndex = paginatedData.map((item, index) => ({
        ...item,
        index: startIndex + index + 1,
        versionCount: getVersionCount(item.baseId),
      }))

      resolve({
        data: {
          list: dataWithIndex,
          total: filteredData.length,
        },
      })
    }, 300)
  })
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
            <el-button v-if="canAdd" type="primary" :icon="Plus" @click="handleAdd"
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
          <div class="header-right">
            <el-switch
              v-model="showAllVersions"
              active-text="显示所有版本"
              inactive-text="仅显示当前版本"
              @change="proTableRef?.getTableList()"
            />
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
          v-if="canApprove && scope.row.status === 'pending'"
          type="success"
          link
          :icon="Check"
          @click="handleSubmitAudit(scope.row)"
        >
          审核
        </el-button>
        <el-button
          v-if="canSubmitAudit && scope.row.status === 'rejected'"
          type="warning"
          link
          @click="handleSubmitAudit(scope.row)"
        >
          提交审核
        </el-button>
        <el-button type="info" link :icon="Download" @click="handleExportSingle(scope.row)"
          >导出</el-button
        >
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
