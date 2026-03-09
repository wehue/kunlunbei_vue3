<script setup>
import { ref, onMounted, computed } from 'vue'
import ECharts from '@/components/ECharts/index.vue'
import { getPartCategoryList, getPartList } from '@/api/material'

const loading = ref(true)
const chartData = ref([])

const fetchCategoryList = async () => {
  try {
    const res = await getPartCategoryList()
    console.log('获取物料分类列表原始响应:', res)

    const list = res.data?.data?.data || res.data?.data || res.data || []
    console.log('分类列表数据:', list)

    const maxList = list.filter((item) => item.level === 'Max')
    console.log('Max分类:', maxList)

    return maxList
  } catch (error) {
    console.error('获取物料分类列表失败:', error)
    return []
  }
}

const fetchMaterialList = async () => {
  try {
    const res = await getPartList({ pageSize: 1000, pageNum: 1 })
    console.log('获取物料列表原始响应:', res)

    const list = res.data?.data?.data || res.data?.data || res.data || []
    console.log('物料列表数据总数:', list.length)

    // 打印前5个物料的完整数据，检查格式
    console.log('前5个物料完整数据:')
    list.slice(0, 5).forEach((item, index) => {
      console.log(`物料 ${index + 1}:`, JSON.stringify(item, null, 2))
    })

    return list
  } catch (error) {
    console.error('获取物料列表失败:', error)
    return []
  }
}

const getCategoryId = (item) => {
  // 优先从 category.id 获取
  if (item.category && typeof item.category === 'object' && item.category !== null) {
    if (item.category.id !== undefined && item.category.id !== null) {
      return item.category.id
    }
    if (item.category.categoryId !== undefined && item.category.categoryId !== null) {
      return item.category.categoryId
    }
  }
  // 其次从 categoryId 获取
  if (item.categoryId !== undefined && item.categoryId !== null) {
    return item.categoryId
  }
  return null
}

const countMaterialsByMaxCategory = (materialList, maxList) => {
  // 初始化统计Map
  const countMap = {}
  maxList.forEach((cat) => {
    // 使用 categoryId 作为键
    const id = cat.categoryId
    countMap[id] = 0
  })

  console.log('初始化countMap:', countMap)

  let totalMaterials = 0
  let materialsWithCategory = 0
  let materialsWithoutCategory = 0

  materialList.forEach((item) => {
    totalMaterials++
    const categoryId = getCategoryId(item)

    if (categoryId !== null && categoryId !== undefined) {
      materialsWithCategory++

      // 转换为字符串进行处理
      const categoryIdStr = String(categoryId)

      // 根据分类ID的开头数字判断所属的Max分类
      let maxCategoryId
      const firstTwoChars = categoryIdStr.substring(0, 2)

      switch (firstTwoChars) {
        case '10':
          maxCategoryId = 100
          break
        case '20':
          maxCategoryId = 200
          break
        case '30':
          maxCategoryId = 300
          break
        case '40':
          maxCategoryId = 400
          break
        case '50':
          maxCategoryId = 500
          break
        default:
          maxCategoryId = null
      }

      if (maxCategoryId !== null && countMap.hasOwnProperty(maxCategoryId)) {
        countMap[maxCategoryId]++
      } else {
        console.log(
          `物料 ${item.partName || item.materialName} 的分类ID ${categoryIdStr} 无法匹配到Max分类`,
        )
      }
    } else {
      materialsWithoutCategory++
    }
  })

  console.log(
    `物料统计: 总数=${totalMaterials}, 有分类=${materialsWithCategory}, 无分类=${materialsWithoutCategory}`,
  )
  console.log('物料数量统计结果:', countMap)

  return countMap
}

const loadData = async () => {
  loading.value = true

  try {
    const [maxList, materialList] = await Promise.all([fetchCategoryList(), fetchMaterialList()])

    if (maxList.length === 0) {
      console.warn('没有找到Max级别分类')
      chartData.value = []
      return
    }

    const countMap = countMaterialsByMaxCategory(materialList, maxList)

    chartData.value = maxList
      .map((category) => {
        return {
          name: category.categoryName,
          value: countMap[category.categoryId] || 0,
        }
      })
      .filter((item) => item.value > 0)

    console.log('最终图表数据:', chartData.value)
  } catch (error) {
    console.error('加载数据失败:', error)
    chartData.value = []
  } finally {
    loading.value = false
  }
}

const chartOption = computed(() => {
  if (chartData.value.length === 0) {
    return {}
  }

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: { color: '#333' },
      formatter: '{b}: {c}个 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#666',
        fontSize: 13,
      },
    },
    series: [
      {
        name: '物料分类',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData.value.map((item, index) => ({
          ...item,
          itemStyle: {
            color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9c27b0', '#00bcd4'][
              index % 7
            ],
          },
        })),
      },
    ],
  }
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="material-category-chart">
    <div class="chart-header">
      <div class="chart-title">
        <span>物料分类分布</span>
      </div>
      <div class="chart-subtitle">
        <span>各分类物料数量占比</span>
      </div>
    </div>
    <div v-loading="loading" class="chart-container">
      <div v-if="chartData.length === 0 && !loading" class="empty-chart">
        <span>暂无数据</span>
      </div>
      <ECharts v-else :option="chartOption" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.material-category-chart {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  .chart-header {
    padding: 20px 24px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        color: #409eff;
        font-size: 20px;
      }
    }

    .chart-subtitle {
      font-size: 14px;
      color: #909399;
    }
  }

  .chart-container {
    height: 380px;
    padding: 20px;
    position: relative;

    .empty-chart {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #909399;
      font-size: 14px;
    }
  }
}
</style>
