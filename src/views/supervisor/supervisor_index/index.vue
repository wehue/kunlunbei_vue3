<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ECharts from '@/components/ECharts/index.vue'
import {
  Box,
  Cpu,
  Guide,
  DocumentChecked,
  RefreshRight,
  TrendCharts,
  ArrowUp,
  ArrowDown,
} from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const refreshInterval = ref(null)
const timeGranularity = ref('day')

const overviewData = ref({
  materialTotal: { value: 1256, trend: 12.5, isUp: true },
  equipmentTotal: { value: 89, trend: 5.2, isUp: true },
  routeTotal: { value: 156, trend: 8.3, isUp: true },
  pendingApproval: { value: 23, trend: -15.2, isUp: false },
  rejectedNotResubmit: { value: 8, trend: -5.0, isUp: false },
})

const generate30DaysData = () => {
  const dates = []
  const submitData = []
  const passData = []
  const rejectData = []

  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}-${String(date.getDate()).padStart(2, '0')}`)
    submitData.push(Math.floor(Math.random() * 20) + 10)
    passData.push(Math.floor(Math.random() * 15) + 5)
    rejectData.push(Math.floor(Math.random() * 8) + 1)
  }

  return { dates, submitData, passData, rejectData }
}

const generateWeekData = () => {
  const weeks = ['第1周', '第2周', '第3周', '第4周']
  const submitData = [85, 92, 78, 105]
  const passData = [65, 72, 58, 82]
  const rejectData = [12, 15, 10, 18]

  return { dates: weeks, submitData, passData, rejectData }
}

const trendData = ref(generate30DaysData())

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#eee',
    borderWidth: 1,
    textStyle: { color: '#333' },
  },
  legend: {
    data: ['提交数', '通过数', '驳回数'],
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
    data: trendData.value.dates,
    axisLabel: {
      color: '#666',
      rotate: timeGranularity.value === 'day' ? 45 : 0,
      fontSize: 11,
    },
    axisLine: { lineStyle: { color: '#ddd' } },
  },
  yAxis: {
    type: 'value',
    name: '数量',
    axisLabel: { color: '#666' },
    axisLine: { show: true, lineStyle: { color: '#ddd' } },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
  },
  series: [
    {
      name: '提交数',
      type: 'bar',
      barWidth: '25%',
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
        borderRadius: [3, 3, 0, 0],
      },
      data: trendData.value.submitData,
    },
    {
      name: '通过数',
      type: 'bar',
      barWidth: '25%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#67c23a' },
            { offset: 1, color: '#95d475' },
          ],
        },
        borderRadius: [3, 3, 0, 0],
      },
      data: trendData.value.passData,
    },
    {
      name: '驳回数',
      type: 'bar',
      barWidth: '25%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#f56c6c' },
            { offset: 1, color: '#f89898' },
          ],
        },
        borderRadius: [3, 3, 0, 0],
      },
      data: trendData.value.rejectData,
    },
  ],
}))

const handleGranularityChange = (type) => {
  timeGranularity.value = type
  if (type === 'day') {
    trendData.value = generate30DaysData()
  } else {
    trendData.value = generateWeekData()
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
  } catch (error) {
    console.error('数据加载失败:', error)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  fetchData()
}

const setupAutoRefresh = () => {
  refreshInterval.value = setInterval(
    () => {
      fetchData()
    },
    5 * 60 * 1000,
  )
}

const clearAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const animateNumber = (target, key, end, duration = 1000) => {
  const start = 0
  const startTime = performance.now()
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    target[key].value = Math.floor(start + (end - start) * easeOutQuart)
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

onMounted(() => {
  fetchData()
  setupAutoRefresh()
  animateNumber(overviewData.value, 'materialTotal', 1256)
  animateNumber(overviewData.value, 'equipmentTotal', 89)
  animateNumber(overviewData.value, 'routeTotal', 156)
  animateNumber(overviewData.value, 'pendingApproval', 23)
  animateNumber(overviewData.value, 'rejectedNotResubmit', 8)
})

onUnmounted(() => {
  clearAutoRefresh()
})
</script>

<template>
  <div class="supervisor-home">
    <div class="page-header">
      <div class="header-left">
        <el-icon class="header-icon"><TrendCharts /></el-icon>
        <div class="header-text">
          <h2 class="page-title">主管工作台</h2>
          <span class="page-subtitle">实时掌握审批进度与业务动态</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="RefreshRight" @click="handleRefresh" :loading="loading"
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
            <div class="card-value">{{ overviewData.materialTotal.value }}</div>
            <div class="card-label">物料总数</div>
          </div>
          <div
            class="card-trend"
            :class="overviewData.materialTotal.isUp ? 'trend-up' : 'trend-down'"
          >
            <el-icon
              ><component :is="overviewData.materialTotal.isUp ? ArrowUp : ArrowDown"
            /></el-icon>
            <span>{{ Math.abs(overviewData.materialTotal.trend) }}%</span>
          </div>
        </div>

        <div class="overview-card equipment-card">
          <div class="card-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.equipmentTotal.value }}</div>
            <div class="card-label">设备总数</div>
          </div>
          <div
            class="card-trend"
            :class="overviewData.equipmentTotal.isUp ? 'trend-up' : 'trend-down'"
          >
            <el-icon
              ><component :is="overviewData.equipmentTotal.isUp ? ArrowUp : ArrowDown"
            /></el-icon>
            <span>{{ Math.abs(overviewData.equipmentTotal.trend) }}%</span>
          </div>
        </div>

        <div class="overview-card route-card">
          <div class="card-icon">
            <el-icon><Guide /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.routeTotal.value }}</div>
            <div class="card-label">工艺路线总数</div>
          </div>
          <div class="card-trend" :class="overviewData.routeTotal.isUp ? 'trend-up' : 'trend-down'">
            <el-icon
              ><component :is="overviewData.routeTotal.isUp ? ArrowUp : ArrowDown"
            /></el-icon>
            <span>{{ Math.abs(overviewData.routeTotal.trend) }}%</span>
          </div>
        </div>

        <div class="overview-card pending-card">
          <div class="card-icon">
            <el-icon><DocumentChecked /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.pendingApproval.value }}</div>
            <div class="card-label">待办审批数</div>
          </div>
          <div
            class="card-trend"
            :class="overviewData.pendingApproval.isUp ? 'trend-up' : 'trend-down'"
          >
            <el-icon
              ><component :is="overviewData.pendingApproval.isUp ? ArrowUp : ArrowDown"
            /></el-icon>
            <span>{{ Math.abs(overviewData.pendingApproval.trend) }}%</span>
          </div>
        </div>

        <div class="overview-card rejected-card">
          <div class="card-icon">
            <el-icon><RefreshRight /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.rejectedNotResubmit.value }}</div>
            <div class="card-label">驳回未重提数</div>
          </div>
          <div
            class="card-trend"
            :class="overviewData.rejectedNotResubmit.isUp ? 'trend-up' : 'trend-down'"
          >
            <el-icon
              ><component :is="overviewData.rejectedNotResubmit.isUp ? ArrowUp : ArrowDown"
            /></el-icon>
            <span>{{ Math.abs(overviewData.rejectedNotResubmit.trend) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <div class="section-header">
        <div class="section-title">
          <el-icon><TrendCharts /></el-icon>
          <span>近30天工艺路线数据统计</span>
        </div>
        <div class="section-controls">
          <el-radio-group v-model="timeGranularity" size="small" @change="handleGranularityChange">
            <el-radio-button value="day">按日</el-radio-button>
            <el-radio-button value="week">按周</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="chart-container">
        <ECharts :option="chartOption" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.supervisor-home {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 100px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px 24px;
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);

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
      }
    }
  }

  .overview-section {
    margin-bottom: 24px;
    .overview-cards {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      .overview-card {
        position: relative;
        padding: 20px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #fff;
        }
        .card-content {
          .card-value {
            font-size: 28px;
            font-weight: 700;
            color: #303133;
            line-height: 1.2;
            font-family: 'DIN', sans-serif;
          }
          .card-label {
            font-size: 13px;
            color: #909399;
            margin-top: 4px;
          }
        }
        .card-trend {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
          &.trend-up {
            color: #67c23a;
            background: rgba(103, 194, 58, 0.1);
          }
          &.trend-down {
            color: #f56c6c;
            background: rgba(245, 108, 108, 0.1);
          }
        }
        &.material-card .card-icon {
          background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
        }
        &.equipment-card .card-icon {
          background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
        }
        &.route-card .card-icon {
          background: linear-gradient(135deg, #e6a23c 0%, #eebe77 100%);
        }
        &.pending-card .card-icon {
          background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%);
        }
        &.rejected-card .card-icon {
          background: linear-gradient(135deg, #f56c6c 0%, #f89898 100%);
        }
      }
    }
  }

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
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        .el-icon {
          color: #11998e;
          font-size: 20px;
        }
      }
    }
    .chart-container {
      height: 400px;
      padding: 20px;
    }
  }
}

@media screen and (max-width: 1600px) {
  .supervisor-home .overview-section .overview-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media screen and (max-width: 1200px) {
  .supervisor-home .overview-section .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media screen and (max-width: 768px) {
  .supervisor-home {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    .overview-section .overview-cards {
      grid-template-columns: 1fr;
    }
  }
}
</style>
