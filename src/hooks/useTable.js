import { ref, reactive, computed } from 'vue'

export const useTable = (requestApi, initParam, pagination, dataCallback, requestError) => {
  const tableData = ref([])
  const pageable = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  })

  const searchParam = ref({})
  const searchInitParam = ref({})

  const loading = ref(false)

  const getTableList = async () => {
    if (!requestApi) return

    loading.value = true
    try {
      const params = {
        ...initParam,
        ...searchParam.value,
        ...(pagination ? { pageNum: pageable.pageNum, pageSize: pageable.pageSize } : {}),
      }

      const { data } = await requestApi(params)

      if (dataCallback) {
        dataCallback(data)
      } else {
        tableData.value = data?.list ?? data ?? []
        pageable.total = data?.total ?? tableData.value.length
      }
    } catch (error) {
      if (requestError) {
        requestError(error)
      }
      console.error('getTableList error:', error)
    } finally {
      loading.value = false
    }
  }

  const search = () => {
    pageable.pageNum = 1
    getTableList()
  }

  const reset = () => {
    searchParam.value = { ...searchInitParam.value }
    pageable.pageNum = 1
    getTableList()
  }

  const handleSizeChange = (val) => {
    pageable.pageNum = 1
    pageable.pageSize = val
    getTableList()
  }

  const handleCurrentChange = (val) => {
    pageable.pageNum = val
    getTableList()
  }

  return {
    tableData,
    pageable,
    searchParam,
    searchInitParam,
    loading,
    getTableList,
    search,
    reset,
    handleSizeChange,
    handleCurrentChange,
  }
}
