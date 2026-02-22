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

const efficiencyData = ref({
  avgApprovalTime: 2.5,
  passRate: 87.6,
  onTimeRate: 92.3,
  weeklyTrend: [
    { week: '第1周', avgTime: 3.2, passRate: 82 },
    { week: '第2周', avgTime: 2.8, passRate: 85 },
    { week: '第3周', avgTime: 2.5, passRate: 88 },
    { week: '第4周', avgTime: 2.3, passRate: 90 },
  ],
})

const designerRanking = ref([
  { rank: 1, name: '张三', dept: '设计一部', submitCount: 45, passRate: 96, avgTime: 1.8 },
  { rank: 2, name: '李四', dept: '设计二部', submitCount: 42, passRate: 94, avgTime: 2.0 },
  { rank: 3, name: '王五', dept: '设计一部', submitCount: 38, passRate: 92, avgTime: 2.2 },
  { rank: 4, name: '赵六', dept: '设计三部', submitCount: 35, passRate: 91, avgTime: 2.4 },
  { rank: 5, name: '钱七', dept: '设计二部', submitCount: 32, passRate: 88, avgTime: 2.6 },
])

const overdueWarnings = ref([
  {
    id: 1,
    routeName: '电机组装工艺路线V2.1',
    designer: '张三',
    submitTime: '2024-01-10 09:30',
    overdueHours: 72,
    status: 'urgent',
  },
  {
    id: 2,
    routeName: '控制器测试流程V1.0',
    designer: '李四',
    submitTime: '2024-01-11 14:20',
    overdueHours: 48,
    status: 'warning',
  },
  {
    id: 3,
    routeName: '传感器校准工序V3.0',
    designer: '王五',
    submitTime: '2024-01-12 11:00',
    overdueHours: 24,
    status: 'notice',
  },
])

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

const efficiencyChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#eee',
    borderWidth: 1,
    textStyle: { color: '#333' },
  },
  legend: {
    data: ['平均审批时长(小时)', '通过率(%)'],
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
    data: efficiencyData.value.weeklyTrend.map((item) => item.week),
    axisLabel: { color: '#666' },
    axisLine: { lineStyle: { color: '#ddd' } },
  },
  yAxis: [
    {
      type: 'value',
      name: '时长(小时)',
      axisLabel: { color: '#666' },
      axisLine: { show: true, lineStyle: { color: '#ddd' } },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    {
      type: 'value',
      name: '通过率(%)',
      min: 0,
      max: 100,
      axisLabel: { color: '#666' },
      axisLine: { show: true, lineStyle: { color: '#ddd' } },
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '平均审批时长(小时)',
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
      data: efficiencyData.value.weeklyTrend.map((item) => item.avgTime),
    },
    {
      name: '通过率(%)',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3, color: '#67c23a' },
      itemStyle: { color: '#67c23a', borderWidth: 2, borderColor: '#fff' },
      data: efficiencyData.value.weeklyTrend.map((item) => item.passRate),
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
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card equipment-card">
          <div class="card-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.equipmentTotal.value }}</div>
            <div class="card-label">设备总数</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card route-card">
          <div class="card-icon">
            <el-icon><Guide /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.routeTotal.value }}</div>
            <div class="card-label">工艺路线总数</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card pending-card">
          <div class="card-icon">
            <el-icon><DocumentChecked /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.pendingApproval.value }}</div>
            <div class="card-label">待办审批数</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card rejected-card">
          <div class="card-icon">
            <el-icon><RefreshRight /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.rejectedNotResubmit.value }}</div>
            <div class="card-label">驳回未重提数</div>
          </div>
          <div class="card-decoration"></div>
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

    <div class="charts-row">
      <div class="chart-section efficiency-chart">
        <div class="section-header">
          <div class="section-title">
            <el-icon><Timer /></el-icon>
            <span>审核效率统计</span>
          </div>
        </div>
        <div class="efficiency-stats">
          <div class="stat-item">
            <div class="stat-value">{{ efficiencyData.avgApprovalTime }}h</div>
            <div class="stat-label">平均审批时长</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ efficiencyData.passRate }}%</div>
            <div class="stat-label">审批通过率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ efficiencyData.onTimeRate }}%</div>
            <div class="stat-label">按时处理率</div>
          </div>
        </div>
        <div class="chart-container" style="height: 280px">
          <ECharts :option="efficiencyChartOption" />
        </div>
      </div>

      <div class="chart-section ranking-chart">
        <div class="section-header">
          <div class="section-title">
            <el-icon><TrophyBase /></el-icon>
            <span>设计师绩效排名</span>
          </div>
        </div>
        <div class="ranking-list">
          <div
            v-for="item in designerRanking"
            :key="item.rank"
            class="ranking-item"
            :class="'rank-' + item.rank"
          >
            <div class="rank-badge">{{ item.rank }}</div>
            <div class="rank-info">
              <div class="rank-name">{{ item.name }}</div>
              <div class="rank-dept">{{ item.dept }}</div>
            </div>
            <div class="rank-stats">
              <div class="stat">
                <span class="stat-num">{{ item.submitCount }}</span>
                <span class="stat-text">提交</span>
              </div>
              <div class="stat">
                <span class="stat-num">{{ item.passRate }}%</span>
                <span class="stat-text">通过率</span>
              </div>
              <div class="stat">
                <span class="stat-num">{{ item.avgTime }}h</span>
                <span class="stat-text">平均时长</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-section warning-chart">
        <div class="section-header">
          <div class="section-title">
            <el-icon><Warning /></el-icon>
            <span>审批超时预警</span>
          </div>
        </div>
        <div class="warning-list">
          <div
            v-for="item in overdueWarnings"
            :key="item.id"
            class="warning-item"
            :class="item.status"
          >
            <div class="warning-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="warning-content">
              <div class="warning-title">{{ item.routeName }}</div>
              <div class="warning-meta">
                <span>提交人：{{ item.designer }}</span>
                <span>提交时间：{{ item.submitTime }}</span>
              </div>
            </div>
            <div class="warning-time">
              <div class="overdue-hours">超时{{ item.overdueHours }}小时</div>
              <el-button
                type="primary"
                size="small"
                @click="router.push('/audit-pending/audit-pending-info')"
                >立即处理</el-button
              >
            </div>
          </div>
        </div>
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
            background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
          }
          .card-decoration {
            background: #409eff;
          }
        }
        &.equipment-card {
          .card-icon {
            background: linear-gradient(135deg, #67c23a 0%, #95d475 100%);
          }
          .card-decoration {
            background: #67c23a;
          }
        }
        &.route-card {
          .card-icon {
            background: linear-gradient(135deg, #e6a23c 0%, #eebe77 100%);
          }
          .card-decoration {
            background: #e6a23c;
          }
        }
        &.pending-card {
          .card-icon {
            background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%);
          }
          .card-decoration {
            background: #909399;
          }
        }
        &.rejected-card {
          .card-icon {
            background: linear-gradient(135deg, #f56c6c 0%, #f89898 100%);
          }
          .card-decoration {
            background: #f56c6c;
          }
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

  .charts-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 24px;

    .chart-section {
      .efficiency-stats {
        display: flex;
        justify-content: space-around;
        padding: 16px 20px;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
        .stat-item {
          text-align: center;
          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #11998e;
            font-family: 'DIN', sans-serif;
          }
          .stat-label {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }

    .ranking-chart {
      .ranking-list {
        padding: 16px;
        .ranking-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: #f5f7fa;
          border-radius: 8px;
          transition: all 0.3s ease;
          &:hover {
            background: #ecf5ff;
            transform: translateX(4px);
          }
          &.rank-1 .rank-badge {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
            color: #fff;
          }
          &.rank-2 .rank-badge {
            background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
            color: #fff;
          }
          &.rank-3 .rank-badge {
            background: linear-gradient(135deg, #cd7f32 0%, #daa06d 100%);
            color: #fff;
          }
          .rank-badge {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #e4e7ed;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            color: #606266;
            margin-right: 12px;
            flex-shrink: 0;
          }
          .rank-info {
            flex: 1;
            .rank-name {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
            }
            .rank-dept {
              font-size: 12px;
              color: #909399;
            }
          }
          .rank-stats {
            display: flex;
            gap: 16px;
            .stat {
              text-align: center;
              .stat-num {
                display: block;
                font-size: 14px;
                font-weight: 600;
                color: #409eff;
              }
              .stat-text {
                font-size: 11px;
                color: #909399;
              }
            }
          }
        }
      }
    }

    .warning-chart {
      .warning-list {
        padding: 16px;
        .warning-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 12px;
          border-radius: 8px;
          border-left: 4px solid;
          background: #fafafa;
          &.urgent {
            border-color: #f56c6c;
            background: #fef0f0;
            .warning-icon {
              background: #f56c6c;
            }
            .overdue-hours {
              color: #f56c6c;
            }
          }
          &.warning {
            border-color: #e6a23c;
            background: #fdf6ec;
            .warning-icon {
              background: #e6a23c;
            }
            .overdue-hours {
              color: #e6a23c;
            }
          }
          &.notice {
            border-color: #409eff;
            background: #ecf5ff;
            .warning-icon {
              background: #409eff;
            }
            .overdue-hours {
              color: #409eff;
            }
          }
          .warning-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 18px;
            margin-right: 12px;
            flex-shrink: 0;
          }
          .warning-content {
            flex: 1;
            .warning-title {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }
            .warning-meta {
              font-size: 12px;
              color: #909399;
              span {
                margin-right: 12px;
              }
            }
          }
          .warning-time {
            text-align: right;
            .overdue-hours {
              font-size: 12px;
              font-weight: 500;
              margin-bottom: 6px;
            }
          }
        }
      }
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
