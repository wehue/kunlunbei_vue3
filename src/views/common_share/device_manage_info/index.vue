<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, View, Download } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'

const router = useRouter()

const proTableRef = ref()
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const isEdit = ref(false)

const brandOptions = ref([
  { label: '西门子', value: '西门子' },
  { label: '三菱', value: '三菱' },
  { label: '欧姆龙', value: '欧姆龙' },
  { label: 'ABB', value: 'ABB' },
  { label: '施耐德', value: '施耐德' },
])

const locationOptions = ref([
  { label: '车间A', value: '车间A' },
  { label: '车间B', value: '车间B' },
  { label: '仓库C', value: '仓库C' },
  { label: '实验室', value: '实验室' },
])

const mockData = ref([
  {
    id: 1,
    deviceCode: 'DEV20240001',
    deviceName: '数控车床',
    brand: '西门子',
    location: '车间A',
    specModel: 'CNC-800',
  },
  {
    id: 2,
    deviceCode: 'DEV20240002',
    deviceName: '加工中心',
    brand: '三菱',
    location: '车间B',
    specModel: 'MC-500',
  },
  {
    id: 3,
    deviceCode: 'DEV20240003',
    deviceName: '铣床',
    brand: '欧姆龙',
    location: '仓库C',
    specModel: 'MX-300',
  },
  {
    id: 4,
    deviceCode: 'DEV20240004',
    deviceName: '磨床',
    brand: 'ABB',
    location: '实验室',
    specModel: 'GM-200',
  },
  {
    id: 5,
    deviceCode: 'DEV20240005',
    deviceName: '钻床',
    brand: '施耐德',
    location: '车间A',
    specModel: 'ZJ-400',
  },
  {
    id: 6,
    deviceCode: 'DEV20240006',
    deviceName: '刨床',
    brand: '西门子',
    location: '车间B',
    specModel: 'BC-250',
  },
  {
    id: 7,
    deviceCode: 'DEV20240007',
    deviceName: '插床',
    brand: '三菱',
    location: '仓库C',
    specModel: 'CC-350',
  },
  {
    id: 8,
    deviceCode: 'DEV20240008',
    deviceName: '拉床',
    brand: '欧姆龙',
    location: '实验室',
    specModel: 'LC-150',
  },
  {
    id: 9,
    deviceCode: 'DEV20240009',
    deviceName: '锯床',
    brand: 'ABB',
    location: '车间A',
    specModel: 'JC-100',
  },
  {
    id: 10,
    deviceCode: 'DEV20240010',
    deviceName: '镗床',
    brand: '施耐德',
    location: '车间B',
    specModel: 'TC-600',
  },
  {
    id: 11,
    deviceCode: 'DEV20240011',
    deviceName: '齿轮机床',
    brand: '西门子',
    location: '仓库C',
    specModel: 'GC-280',
  },
  {
    id: 12,
    deviceCode: 'DEV20240012',
    deviceName: '螺纹机床',
    brand: '三菱',
    location: '实验室',
    specModel: 'LCW-450',
  },
])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'deviceCode', label: '设备编码', search: { el: 'input', key: 'deviceCode' } },
  { prop: 'deviceName', label: '设备名称', search: { el: 'input', key: 'deviceName' } },
  { prop: 'brand', label: '品牌', search: { el: 'select', key: 'brand' }, enum: brandOptions },
  {
    prop: 'location',
    label: '位置',
    search: { el: 'select', key: 'location' },
    enum: locationOptions,
  },
  { prop: 'specModel', label: '规格型号' },
  { prop: 'operation', label: '操作', width: 200, fixed: 'right' },
])

const searchType = ref('fuzzy')
const searchTypeOptions = [
  { label: '模糊查询', value: 'fuzzy' },
  { label: '精确查询', value: 'exact' },
]

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockData.value]

      if (params?.deviceCode) {
        filteredData = filteredData.filter((item) => item.deviceCode.includes(params.deviceCode))
      }

      if (params?.deviceName) {
        filteredData = filteredData.filter((item) => item.deviceName.includes(params.deviceName))
      }

      if (params?.brand) {
        filteredData = filteredData.filter((item) => item.brand === params.brand)
      }

      if (params?.location) {
        filteredData = filteredData.filter((item) => item.location === params.location)
      }

      const pageNum = params?.pageNum || 1
      const pageSize = params?.pageSize || 10
      const startIndex = (pageNum - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)
      
      const dataWithIndex = paginatedData.map((item, index) => ({
        ...item,
        index: startIndex + index + 1,
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

const handleAdd = () => {
  ElMessage.info('新增功能开发中')
}

const handleEdit = (row) => {
  ElMessage.info('编辑功能开发中')
}

const handleView = (row) => {
  router.push(`/device-manage/device-manage-detail/${row.id}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  })
}

const exportToExcel = (data, fileName = '设备列表') => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const handleExportSingle = (row) => {
  const exportData = [
    {
      '设备编码': row.deviceCode,
      '设备名称': row.deviceName,
      '品牌': row.brand,
      '位置': row.location,
      '规格型号': row.specModel,
    },
  ]
  exportToExcel(exportData, `设备_${row.deviceCode}`)
  ElMessage.success('导出成功')
}

const handleExportBatch = (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要导出的设备')
    return
  }
  const exportData = selectedList.map((row) => ({
    '设备编码': row.deviceCode,
    '设备名称': row.deviceName,
    '品牌': row.brand,
    '位置': row.location,
    '规格型号': row.specModel,
  }))
  exportToExcel(exportData, `设备列表_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}
</script>

<template>
  <div class="device-manage-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: searchType }"
    >
      <template #tableHeader="scope">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增设备</el-button>
        <el-button
          type="success"
          :icon="Download"
          :disabled="!scope.isSelected"
          @click="handleExportBatch(scope.selectedList)"
        >
          批量导出
        </el-button>
      </template>

      <template #brand="scope">
        <el-tag>{{ scope.row.brand }}</el-tag>
      </template>

      <template #location="scope">
        <el-tag type="success">{{ scope.row.location }}</el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button type="success" link :icon="Download" @click="handleExportSingle(scope.row)">导出</el-button>
        <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)"
          >删除</el-button
        >
      </template>
    </ProTable>
  </div>
</template>

<style lang="scss" scoped>
.device-manage-container {
  .search-type-wrapper {
    display: inline-block;
    margin-right: 16px;
  }
}

:deep(.table-search) {
  margin-bottom: 10px !important;
}

:deep(.el-table) {
  .el-table__body-wrapper {
    .el-table__body {
      .el-table__row {
        .el-table__cell:last-child {
          .cell {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4px 8px;
            justify-items: stretch;
            align-items: stretch;
            
            .el-button {
              width: 100%;
              min-width: 60px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 4px 8px !important;
              margin: 0 !important;
              
              .el-icon {
                margin-right: 4px;
                font-size: 14px;
              }
              
              span {
                font-size: 14px;
                white-space: nowrap;
              }
            }
          }
        }
      }
    }
  }
}
</style>
