<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import ECharts from '@/components/ECharts/index.vue'
import {
  Box,
  Cpu,
  Operation,
  Guide,
  User,
  TrendCharts,
  Download,
  RefreshRight,
  DataAnalysis,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { getAdminConsole1, getAdminConsole2 } from '@/api/user'
import { getPartCategoryList } from '@/api/material'

const loading = ref(false)
const loginTimeRange = ref('7days')
const overviewData = ref({})

const generateLoginData = (days) => {
  const dates = []
  const loginCounts = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}-${String(date.getDate()).padStart(2, '0')}`)
    loginCounts.push(Math.floor(Math.random() * 50) + 20)
  }

  return { dates, loginCounts }
}

const loginTrendData = ref(generateLoginData(7))

const materialCategoryData = ref([])

const pieChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#eee',
    borderWidth: 1,
    textStyle: {
      color: '#333',
    },
    formatter: '{b}: {c} ({d}%)',
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
      data: materialCategoryData.value.map((item, index) => ({
        ...item,
        itemStyle: {
          color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9c27b0', '#00bcd4'][
            index % 7
          ],
        },
      })),
    },
  ],
}))

const loginChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999',
      },
    },
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#eee',
    borderWidth: 1,
    textStyle: { color: '#333' },
  },
  legend: {
    data: ['登录人次', '活跃用户'],
    top: 10,
    textStyle: { color: '#666' },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: 60,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: loginTrendData.value.dates,
    axisPointer: {
      type: 'shadow',
    },
    axisLabel: { color: '#666' },
    axisLine: { lineStyle: { color: '#ddd' } },
  },
  yAxis: [
    {
      type: 'value',
      name: '人次',
      axisLabel: { color: '#666' },
      axisLine: { show: true, lineStyle: { color: '#ddd' } },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    {
      type: 'value',
      name: '用户数',
      axisLabel: { color: '#666' },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '登录人次',
      type: 'bar',
      barWidth: '40%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#79bbff' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#66b1ff' },
              { offset: 1, color: '#a0cfff' },
            ],
          },
        },
      },
      data: loginTrendData.value.loginCounts,
    },
    {
      name: '活跃用户',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3, color: '#67c23a' },
      itemStyle: { color: '#67c23a', borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' },
          ],
        },
      },
      data: loginTrendData.value.loginCounts.map((v) => Math.floor(v * 0.6)),
    },
  ],
}))

const handleLoginTimeRangeChange = (range) => {
  loginTimeRange.value = range
  // 如果已经有数据，根据选择的时间范围截取数据
  if (loginTrendData.value.dates.length > 0) {
    if (range === '7days' && loginTrendData.value.dates.length >= 7) {
      // 截取最近7天的数据
      const startIndex = loginTrendData.value.dates.length - 7
      loginTrendData.value = {
        dates: loginTrendData.value.dates.slice(startIndex),
        loginCounts: loginTrendData.value.loginCounts.slice(startIndex),
      }
    } else if (range === '30days') {
      // 使用完整的30天数据
      fetchData()
    }
  } else {
    // 如果没有数据，重新获取
    fetchData()
  }
}

const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const handleExportLoginData = () => {
  const exportData = loginTrendData.value.dates.map((date, index) => ({
    日期: date,
    登录人次: loginTrendData.value.loginCounts[index],
  }))
  exportToExcel(exportData, `用户登录统计_${new Date().toLocaleDateString()}`)
  ElMessage.success('导出成功')
}

const fetchData = async () => {
  loading.value = true
  try {
    // 并行获取所有数据
    const [cardDataResponse, loginDataResponse, categoryResponse] = await Promise.all([
      getAdminConsole1(),
      getAdminConsole2(),
      getPartCategoryList(),
    ])

    // 获取卡片数据
    console.log('获取卡片数据成功', cardDataResponse)
    if (cardDataResponse.data && cardDataResponse.data.code === 200) {
      const data = cardDataResponse.data.data
      overviewData.value = {
        userCount: data['用户数量'] || 0,
        materialCount: data['物料数量'] || 0,
        equipmentCount: data['设备数量'] || 0,
        processCount: data['工序数量'] || 0,
        routeCount: data['工艺路线数量'] || 0,
      }
    }

    // 获取登录趋势数据
    console.log('获取登录趋势数据成功', loginDataResponse)
    if (loginDataResponse.data && loginDataResponse.data.code === 200) {
      const loginTrend = loginDataResponse.data.data['近30天登录人次趋势']
      if (loginTrend) {
        const dates = Object.keys(loginTrend)
        const loginCounts = Object.values(loginTrend)
        // 确保loginCounts是数字数组
        const numericLoginCounts = loginCounts.map((count) => Number(count))
        // 确保数据不为空
        if (dates.length > 0 && numericLoginCounts.length > 0) {
          let processedDates = dates.map((date) => {
            const [year, month, day] = date.split('-')
            return `${month}-${day}`
          })
          let processedLoginCounts = numericLoginCounts

          // 根据当前选择的时间范围截取数据
          if (loginTimeRange.value === '7days' && dates.length >= 7) {
            const startIndex = dates.length - 7
            processedDates = processedDates.slice(startIndex)
            processedLoginCounts = processedLoginCounts.slice(startIndex)
          }

          loginTrendData.value = {
            dates: processedDates,
            loginCounts: processedLoginCounts,
          }
        } else {
          // 如果数据为空，使用默认数据
          loginTrendData.value = generateLoginData(7)
        }
      } else {
        // 如果登录趋势数据不存在，使用默认数据
        loginTrendData.value = generateLoginData(7)
        console.log('使用默认登录趋势数据:', loginTrendData.value)
      }
    } else {
      // 如果API返回失败，使用默认数据
      loginTrendData.value = generateLoginData(7)
      console.log('使用默认登录趋势数据:', loginTrendData.value)
    }

    // 获取物料分类数据
    console.log('获取物料分类数据成功', categoryResponse)
    let categoryList = []
    if (categoryResponse.data && Array.isArray(categoryResponse.data)) {
      categoryList = categoryResponse.data
    } else if (
      categoryResponse.data &&
      categoryResponse.data.data &&
      Array.isArray(categoryResponse.data.data)
    ) {
      categoryList = categoryResponse.data.data
    } else if (
      categoryResponse.data &&
      categoryResponse.data.data &&
      categoryResponse.data.data.data &&
      Array.isArray(categoryResponse.data.data.data)
    ) {
      categoryList = categoryResponse.data.data.data
    }

    // 统计每个 Max 分类的子级数量
    const maxList = []
    const midMap = new Map()
    const minMap = new Map()

    categoryList.forEach((item) => {
      if (item.level === 'Max') {
        maxList.push({
          id: item.categoryId,
          label: item.categoryName,
          children: [],
        })
      } else if (item.level === 'Mid') {
        const parentId = Math.floor(parseInt(item.categoryId) / 100) * 100
        if (!midMap.has(String(parentId))) {
          midMap.set(String(parentId), [])
        }
        midMap.get(String(parentId)).push({
          id: item.categoryId,
          label: item.categoryName,
          children: [],
        })
      } else if (item.level === 'Min') {
        const parentId = item.categoryId.substring(0, 3)
        if (!minMap.has(parentId)) {
          minMap.set(parentId, [])
        }
        minMap.get(parentId).push({
          id: item.categoryId,
          label: item.categoryName,
        })
      }
    })

    // 构建树形结构并统计数量
    const categoryData = []
    maxList.forEach((maxNode) => {
      const midChildren = midMap.get(String(maxNode.id)) || []
      let totalCount = 0
      midChildren.forEach((midNode) => {
        const minChildren = minMap.get(String(midNode.id)) || []
        totalCount += 1 + minChildren.length
      })
      categoryData.push({
        name: maxNode.label,
        value: totalCount,
      })
    })

    // 更新物料分类数据
    if (categoryData.length > 0) {
      materialCategoryData.value = categoryData
    }
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const animateNumber = (target, key, end, duration = 1000) => {
  const start = 0
  const startTime = performance.now()
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    target[key] = Math.floor(start + (end - start) * easeOutQuart)
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="admin-home">
    <div class="page-header">
      <div class="header-left">
        <el-icon class="header-icon"><TrendCharts /></el-icon>
        <div class="header-text">
          <h2 class="page-title">管理员控制台</h2>
          <span class="page-subtitle">系统数据总览与用户行为分析</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="RefreshRight" @click="fetchData" :loading="loading"
          >刷新数据</el-button
        >
        <span class="update-time">数据更新时间：{{ new Date().toLocaleString() }}</span>
      </div>
    </div>

    <div class="overview-section">
      <div class="overview-cards">
        <div class="overview-card material-card">
          <div class="card-icon">
            <el-icon><Box /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.materialCount }}</div>
            <div class="card-label">物料数量</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card equipment-card">
          <div class="card-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.equipmentCount }}</div>
            <div class="card-label">设备数量</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card process-card">
          <div class="card-icon">
            <el-icon><Operation /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.processCount }}</div>
            <div class="card-label">工序数量</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card route-card">
          <div class="card-icon">
            <el-icon><Guide /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.routeCount }}</div>
            <div class="card-label">工艺路线数量</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card user-card">
          <div class="card-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.userCount }}</div>
            <div class="card-label">用户账号数量</div>
          </div>
          <div class="card-decoration"></div>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-section login-chart">
        <div class="section-header">
          <div class="section-title">
            <el-icon><TrendCharts /></el-icon>
            <span>用户登录人次趋势</span>
          </div>
          <div class="section-subtitle">登录人次与活跃用户数据统计</div>
          <div class="section-controls">
            <el-radio-group
              v-model="loginTimeRange"
              size="small"
              @change="handleLoginTimeRangeChange"
            >
              <el-radio-button value="7days">近7天</el-radio-button>
              <el-radio-button value="30days">近30天</el-radio-button>
            </el-radio-group>
            <el-button type="success" size="small" :icon="Download" @click="handleExportLoginData"
              >导出</el-button
            >
          </div>
        </div>
        <div class="chart-container">
          <ECharts :option="loginChartOption" />
        </div>
      </div>

      <div class="chart-section pie-chart">
        <div class="section-header">
          <div class="section-title">
            <el-icon><DataAnalysis /></el-icon>
            <span>物料分类分布</span>
          </div>
          <div class="section-subtitle">各分类物料数量占比</div>
        </div>
        <div class="chart-container">
          <ECharts :option="pieChartOption" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-home {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 100px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px 24px;
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.25);

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-icon {
        font-size: 42px;
        color: rgba(255, 255, 255, 0.9);
      }

      .header-text {
        .page-title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #fff;
        }

        .page-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 4px;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .update-time {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 20px;
      }
    }
  }

  .overview-section {
    margin-bottom: 24px;

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 20px;

      .overview-card {
        position: relative;
        padding: 24px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        gap: 20px;
        overflow: hidden;
        transition: all 0.3s ease;
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        .card-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #fff;
          flex-shrink: 0;
        }

        .card-content {
          flex: 1;
          position: relative;
          z-index: 1;

          .card-value {
            font-size: 32px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
            font-family: 'DIN', sans-serif;
          }

          .card-label {
            font-size: 14px;
            color: #909399;
            margin-top: 4px;
          }
        }

        .card-decoration {
          position: absolute;
          right: -20px;
          bottom: -20px;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          opacity: 0.1;
        }

        &.material-card {
          .card-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .card-decoration {
            background: #667eea;
          }
        }

        &.equipment-card {
          .card-icon {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          .card-decoration {
            background: #f5576c;
          }
        }

        &.process-card {
          .card-icon {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          .card-decoration {
            background: #4facfe;
          }
        }

        &.route-card {
          .card-icon {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }

          .card-decoration {
            background: #43e97b;
          }
        }

        &.user-card {
          .card-icon {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          }

          .card-decoration {
            background: #fa709a;
          }
        }
      }
    }
  }

  .charts-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 24px;

    .chart-section {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;

      .section-header {
        padding: 20px 24px;
        border-bottom: 1px solid #ebeef5;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #303133;

          .el-icon {
            color: #1a2a6c;
            font-size: 20px;
          }
        }

        .section-subtitle {
          font-size: 14px;
          color: #909399;
        }

        .section-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      .chart-container {
        height: 380px;
        padding: 20px;
      }
    }
  }
}

@media screen and (max-width: 1600px) {
  .admin-home {
    .overview-section .overview-cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}

@media screen and (max-width: 1200px) {
  .admin-home {
    .overview-section .overview-cards {
      grid-template-columns: repeat(2, 1fr);
    }

    .charts-row {
      grid-template-columns: 1fr;
    }
  }
}

@media screen and (max-width: 768px) {
  .admin-home {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-right {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .overview-section .overview-cards {
      grid-template-columns: 1fr;
    }

    .charts-row .chart-section {
      .section-header {
        flex-direction: column;
        align-items: flex-start;

        .section-controls {
          width: 100%;
          justify-content: flex-start;
        }
      }

      .chart-container {
        height: 300px;
      }
    }
  }
}
</style>
