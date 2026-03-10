<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { View, Search, Refresh } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import { getPendingList } from '@/api/audit'
import formatTime from '@/utils/format_time'

const router = useRouter()

const proTableRef = ref()

const versionOptions = ref([
  { label: 'V1.0', value: 'V1.0' },
  { label: 'V1.1', value: 'V1.1' },
  { label: 'V1.2', value: 'V1.2' },
  { label: 'V2.0', value: 'V2.0' },
  { label: 'V2.1', value: 'V2.1' },
])

const columns = reactive([
  { type: 'index', label: '序号', width: 60 },
  {
    prop: 'workingPlanId',
    label: '工艺编号',
    minWidth: 90,
    search: { el: 'input', key: 'workingPlanId' },
  },
  {
    prop: 'workingPlanName',
    label: '工艺路线名称',
    minWidth: 100,
    search: { el: 'input', key: 'workingPlanName' },
  },
  {
    prop: 'version',
    label: '版本',
    width: 80,
    search: { el: 'select', key: 'version' },
    enum: versionOptions.value,
  },
  {
    prop: 'associatedProduct.productName',
    label: '所属产品',
    minWidth: 100,
    search: { el: 'input', key: 'productName' },
  },
  {
    prop: 'applicant.userName',
    label: '申请人',
    width: 130,
    search: { el: 'input', key: 'userName' },
  },
  { prop: 'submitTime', label: '提交时间', minWidth: 130 },
  { prop: 'operation', label: '操作', width: 180, fixed: 'right' },
])

const handleView = (row) => {
  router.push(`/audit-manage/audit-pending-detail/${row.id}`)
}

const getTableList = async (params) => {
  try {
    const response = await getPendingList()
    console.log('获取待审核列表数据成功:', response)

    // 处理不同的响应数据格式
    let list = []
    if (Array.isArray(response.data?.data?.data)) {
      list = response.data.data.data
    } else if (Array.isArray(response.data?.data)) {
      list = response.data.data
    } else if (Array.isArray(response.data)) {
      list = response.data
    }

    // 确保list是数组
    if (!Array.isArray(list)) {
      list = []
    }

    // 确保每个项目都有必要的字段
    const processedList = list.map((item) => ({
      ...item,
      associatedProduct: item.associatedProduct || {},
      applicant: item.applicant || {},
    }))

    return {
      data: {
        list: processedList,
        total: processedList.length,
      },
    }
  } catch (error) {
    console.error('获取待审核列表失败:', error)
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
  <div class="audit-pending-container">
    <ProTable ref="proTableRef" :columns="columns" :request-api="getTableList" :init-param="{}">
      <template #version="scope">
        <el-tag type="primary">{{ scope.row.version }}</el-tag>
      </template>

      <template #productName="scope">
        {{ scope.row.associatedProduct?.productName || '-' }}
      </template>

      <template #creator="scope">
        {{ scope.row.applicant?.creator || '-' }}
      </template>

      <template #submitTime="scope">
        {{ formatTime.formatDate(scope.row.submitTime) || '-' }}
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
.audit-pending-container {
  :deep(.table-search) {
    margin-bottom: 16px !important;
  }
}
</style>
