<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { View, Search, Refresh } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import { getPendingList } from '@/api/audit'
import { getProductFind } from '@/api/product'
import { getProcessRouteList } from '@/api/process'
import formatTime from '@/utils/format_time'

const router = useRouter()

const proTableRef = ref()

const versionOptions = ref([])
const productOptions = ref([])

const loadProducts = async () => {
  try {
    const res = await getProductFind()
    let products = res.data?.data?.data || res.data?.data || []
    if (!Array.isArray(products)) {
      products = []
    }
    productOptions.value = products.map((item) => ({
      label: item.productName,
      value: item.productName,
      id: item.id,
    }))
  } catch (error) {
    console.error('获取产品列表失败:', error)
  }
}

const loadVersions = async () => {
  try {
    const res = await getProcessRouteList({ pageSize: 1000 })
    let data = res.data?.data?.data || res.data?.data || []
    if (!Array.isArray(data)) {
      data = []
    }
    const versions = new Set()
    data.forEach((item) => {
      if (item.version) {
        versions.add(item.version)
      }
    })
    versionOptions.value = Array.from(versions)
      .sort((a, b) => {
        const vA = parseFloat(a.replace('V', ''))
        const vB = parseFloat(b.replace('V', ''))
        return vB - vA
      })
      .map((v) => ({ label: v, value: v }))
  } catch (error) {
    console.error('获取版本列表失败:', error)
  }
}

onMounted(() => {
  loadProducts()
  loadVersions()
})

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
    enum: versionOptions,
  },
  {
    prop: 'associatedProduct.productName',
    label: '所属产品',
    minWidth: 100,
    search: { el: 'select', key: 'associatedProductName' },
    enum: productOptions,
  },
  { prop: 'submitTime', label: '提交时间', minWidth: 130 },
  { prop: 'operation', label: '操作', width: 180, fixed: 'right' },
])

const handleView = (row) => {
  router.push(`/audit-manage/audit-pending-detail/${row.workingPlanId}`)
}

const getTableList = async (params) => {
  try {
    // 构建查询参数，只传递有值的参数
    const queryParams = {
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
    }

    // 只在参数有值时才添加到查询对象中
    if (params?.workingPlanId) {
      queryParams.workingPlanId = params.workingPlanId
    }
    if (params?.workingPlanName) {
      queryParams.workingPlanName = params.workingPlanName
    }
    if (params?.version) {
      queryParams.version = params.version
    }
    if (params?.associatedProductName) {
      queryParams.associatedProductName = params.associatedProductName
    }

    const response = await getPendingList(queryParams)
    console.log('获取待审核列表数据成功:', response)
    console.log('查询参数:', queryParams)

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
        total: response.data?.data?.total || processedList.length,
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
