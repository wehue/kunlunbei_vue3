<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { View, Search, Refresh } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'

const router = useRouter()

const proTableRef = ref()
const searchForm = reactive({
  auditor: '',
  auditStatus: '',
})

const auditStatusOptions = ref([
  { label: '已通过', value: '已通过' },
  { label: '已驳回', value: '已驳回' },
])

const mockData = ref([
  {
    id: 1,
    processCode: 'PR001',
    processName: '智能手机组装工艺路线',
    auditStatus: '已通过',
    applicant: '张三',
    submitTime: '2024-01-10 09:30:00',
    auditor: '李四',
    auditTime: '2024-01-10 14:20:00',
  },
  {
    id: 2,
    processCode: 'PR002',
    processName: '平板电脑组装工艺路线',
    auditStatus: '已驳回',
    applicant: '李四',
    submitTime: '2024-01-11 10:15:00',
    auditor: '张三',
    auditTime: '2024-01-11 16:30:00',
  },
  {
    id: 3,
    processCode: 'PR003',
    processName: '智能手表组装工艺路线',
    auditStatus: '已通过',
    applicant: '王五',
    submitTime: '2024-01-12 11:20:00',
    auditor: '李四',
    auditTime: '2024-01-12 15:45:00',
  },
  {
    id: 4,
    processCode: 'PR004',
    processName: '蓝牙耳机制造工艺路线',
    auditStatus: '已通过',
    applicant: '赵六',
    submitTime: '2024-01-13 14:05:00',
    auditor: '王五',
    auditTime: '2024-01-13 17:10:00',
  },
  {
    id: 5,
    processCode: 'PR005',
    processName: '充电器生产工艺路线',
    auditStatus: '已驳回',
    applicant: '钱七',
    submitTime: '2024-01-14 15:30:00',
    auditor: '张三',
    auditTime: '2024-01-14 18:00:00',
  },
  {
    id: 6,
    processCode: 'PR006',
    processName: '电池组装工艺路线',
    auditStatus: '已通过',
    applicant: '孙八',
    submitTime: '2024-01-15 08:45:00',
    auditor: '李四',
    auditTime: '2024-01-15 11:30:00',
  },
  {
    id: 7,
    processCode: 'PR007',
    processName: '显示屏贴合工艺路线',
    auditStatus: '已通过',
    applicant: '周九',
    submitTime: '2024-01-15 09:20:00',
    auditor: '王五',
    auditTime: '2024-01-15 14:15:00',
  },
  {
    id: 8,
    processCode: 'PR008',
    processName: '摄像头模组工艺路线',
    auditStatus: '已驳回',
    applicant: '吴十',
    submitTime: '2024-01-16 10:35:00',
    auditor: '张三',
    auditTime: '2024-01-16 15:20:00',
  },
  {
    id: 9,
    processCode: 'PR009',
    processName: '主板焊接工艺路线',
    auditStatus: '已通过',
    applicant: '郑十一',
    submitTime: '2024-01-16 11:50:00',
    auditor: '李四',
    auditTime: '2024-01-16 16:40:00',
  },
  {
    id: 10,
    processCode: 'PR010',
    processName: '外壳注塑工艺路线',
    auditStatus: '已通过',
    applicant: '王十二',
    submitTime: '2024-01-17 14:10:00',
    auditor: '王五',
    auditTime: '2024-01-17 17:30:00',
  },
  {
    id: 11,
    processCode: 'PR011',
    processName: '按键组装工艺路线',
    auditStatus: '已驳回',
    applicant: '刘明',
    submitTime: '2024-01-18 15:25:00',
    auditor: '张三',
    auditTime: '2024-01-18 18:10:00',
  },
  {
    id: 12,
    processCode: 'PR012',
    processName: '包装封装工艺路线',
    auditStatus: '已通过',
    applicant: '陈华',
    submitTime: '2024-01-19 08:30:00',
    auditor: '李四',
    auditTime: '2024-01-19 11:45:00',
  },
])

const columns = reactive([
  { type: 'index', label: '序号', width: 60 },
  { prop: 'processCode', label: '工艺编号', minWidth: 100 },
  { prop: 'processName', label: '工艺路线名称', minWidth: 180 },
  { prop: 'auditStatus', label: '审核状态', width: 90 },
  { prop: 'applicant', label: '申请人', width: 80 },
  { prop: 'submitTime', label: '提交时间', minWidth: 160 },
  { prop: 'auditor', label: '审核人', width: 80 },
  { prop: 'auditTime', label: '审核时间', minWidth: 160 },
  { prop: 'operation', label: '操作', width: 100, fixed: 'right' },
])

const handleSearch = () => {
  proTableRef.value?.getTableList()
}

const handleReset = () => {
  searchForm.auditor = ''
  searchForm.auditStatus = ''
  proTableRef.value?.getTableList()
}

const handleView = (row) => {
  router.push(`/audit-manage/audit-record-detail/${row.id}`)
}

const filterData = (data, params) => {
  let filteredData = [...data]

  if (searchForm.auditor) {
    filteredData = filteredData.filter((item) => item.auditor.includes(searchForm.auditor))
  }

  if (searchForm.auditStatus) {
    filteredData = filteredData.filter((item) => item.auditStatus === searchForm.auditStatus)
  }

  return filteredData
}

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredData = filterData(mockData.value, params)

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
</script>

<template>
  <div class="audit-record-container">
    <div class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item label="审核人">
          <el-input
            v-model="searchForm.auditor"
            placeholder="模糊查询"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select
            v-model="searchForm.auditStatus"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in auditStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{}"
      :search-config="{ show: false }"
    >
      <template #auditStatus="scope">
        <el-tag :type="scope.row.auditStatus === '已通过' ? 'success' : 'danger'">
          {{ scope.row.auditStatus }}
        </el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)"
          >查看详情</el-button
        >
      </template>
    </ProTable>
  </div>
</template>

<style lang="scss" scoped>
.audit-record-container {
  .search-area {
    background: #fff;
    padding: 16px 20px 0;
    margin-bottom: 16px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    :deep(.el-form-item) {
      margin-bottom: 16px;
    }

    :deep(.el-form-item__label) {
      font-size: 14px;
      color: #606266;
    }
  }

  :deep(.table-search) {
    display: none;
  }
}
</style>
