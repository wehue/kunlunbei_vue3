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
  Warning,
  CircleClose,
  Timer,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

const loading = ref(false)
const loginTimeRange = ref('7days')
const activeTimeType = ref('hour')

const overviewData = ref({
  materialCount: 1256,
  equipmentCount: 89,
  processCount: 342,
  routeCount: 156,
  userCount: 45,
})

const loginAnomalies = ref([
  {
    id: 1,
    user: '张三',
    ip: '192.168.1.105',
    location: '北京市',
    time: '2024-01-15 08:32:15',
    type: '异地登录',
    status: 'warning',
  },
  {
    id: 2,
    user: '李四',
    ip: '10.0.0.88',
    location: '上海市',
    time: '2024-01-15 09:15:42',
    type: '频繁失败',
    status: 'danger',
  },
  {
    id: 3,
    user: '王五',
    ip: '172.16.0.55',
    location: '广州市',
    time: '2024-01-15 10:22:08',
    type: '异常时段',
    status: 'warning',
  },
])

const operationStats = ref({
  todayOperations: 1256,
  weeklyOperations: 8542,
  monthlyOperations: 32156,
  topOperations: [
    { name: '物料查询', count: 456 },
    { name: '工艺路线审核', count: 312 },
    { name: 'BOM导出', count: 245 },
    { name: '设备管理', count: 189 },
  ],
})

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

const generateActiveTimeData = (type) => {
  if (type === 'hour') {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    const counts = hours.map(() => Math.floor(Math.random() * 30) + 5)
    return { labels: hours, counts }
  } else {
    const periods = ['凌晨(0-6点)', '上午(6-12点)', '下午(12-18点)', '晚上(18-24点)']
    const counts = [15, 85, 120, 65]
    return { labels: periods, counts }
  }
}

const loginTrendData = ref(generateLoginData(7))
const activeTimeData = ref(generateActiveTimeData('hour'))

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

const activeTimeChartOption = computed(() => ({
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
    data: ['活跃用户数'],
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
    data: activeTimeData.value.labels,
    axisLabel: {
      color: '#666',
      rotate: activeTimeType.value === 'hour' ? 45 : 0,
      fontSize: 11,
    },
    axisLine: { lineStyle: { color: '#ddd' } },
  },
  yAxis: {
    type: 'value',
    name: '用户数',
    axisLabel: { color: '#666' },
    axisLine: { show: true, lineStyle: { color: '#ddd' } },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
  },
  series: [
    {
      name: '活跃用户数',
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#e6a23c' },
            { offset: 1, color: '#eebe77' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
      },
      data: activeTimeData.value.counts,
    },
  ],
}))

const operationChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#eee',
    borderWidth: 1,
    textStyle: { color: '#333' },
  },
  grid: {
    left: '3%',
    right: '8%',
    bottom: '3%',
    top: 10,
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    axisLabel: { color: '#666' },
    axisLine: { lineStyle: { color: '#ddd' } },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
  },
  yAxis: {
    type: 'category',
    data: operationStats.value.topOperations.map((item) => item.name).reverse(),
    axisLabel: { color: '#666', fontSize: 13 },
    axisLine: { lineStyle: { color: '#ddd' } },
  },
  series: [
    {
      name: '操作次数',
      type: 'bar',
      barWidth: '50%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' },
          ],
        },
        borderRadius: [0, 6, 6, 0],
      },
      data: operationStats.value.topOperations.map((item) => item.count).reverse(),
    },
  ],
}))

const handleLoginTimeRangeChange = (range) => {
  loginTimeRange.value = range
  loginTrendData.value = generateLoginData(range === '7days' ? 7 : 30)
}

const handleActiveTimeTypeChange = (type) => {
  activeTimeType.value = type
  activeTimeData.value = generateActiveTimeData(type)
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

const handleExportActiveData = () => {
  const exportData = activeTimeData.value.labels.map((label, index) => ({
    时段: label,
    活跃用户数: activeTimeData.value.counts[index],
  }))
  exportToExcel(exportData, `用户活跃时段_${new Date().toLocaleDateString()}`)
  ElMessage.success('导出成功')
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
  animateNumber(overviewData.value, 'materialCount', 1256)
  animateNumber(overviewData.value, 'equipmentCount', 89)
  animateNumber(overviewData.value, 'processCount', 342)
  animateNumber(overviewData.value, 'routeCount', 156)
  animateNumber(overviewData.value, 'userCount', 45)
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

      <div class="chart-section active-chart">
        <div class="section-header">
          <div class="section-title">
            <el-icon><TrendCharts /></el-icon>
            <span>用户活跃时段分布</span>
          </div>
          <div class="section-subtitle">各时段活跃用户数量统计</div>
          <div class="section-controls">
            <el-radio-group
              v-model="activeTimeType"
              size="small"
              @change="handleActiveTimeTypeChange"
            >
              <el-radio-button value="hour">按时</el-radio-button>
              <el-radio-button value="period">按时段</el-radio-button>
            </el-radio-group>
            <el-button type="success" size="small" :icon="Download" @click="handleExportActiveData"
              >导出</el-button
            >
          </div>
        </div>
        <div class="chart-container">
          <ECharts :option="activeTimeChartOption" />
        </div>
      </div>
    </div>

    <div class="operation-warning-row">
      <div class="operation-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon><Timer /></el-icon>
            <span>操作统计</span>
          </div>
        </div>
        <div class="operation-summary">
          <div class="summary-item">
            <span class="summary-value">{{ operationStats.todayOperations }}</span>
            <span class="summary-label">今日操作</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">{{ operationStats.weeklyOperations }}</span>
            <span class="summary-label">本周操作</span>
          </div>
          <div class="summary-item">
            <span class="summary-value">{{ operationStats.monthlyOperations }}</span>
            <span class="summary-label">本月操作</span>
          </div>
        </div>
        <div class="chart-container" style="height: 240px">
          <ECharts :option="operationChartOption" />
        </div>
      </div>

      <div class="warning-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon><Warning /></el-icon>
            <span>异常登录预警</span>
          </div>
          <el-badge :value="loginAnomalies.length" type="danger" />
        </div>
        <div class="warning-list">
          <div
            v-for="item in loginAnomalies"
            :key="item.id"
            class="warning-item"
            :class="item.status"
          >
            <div class="warning-icon">
              <el-icon v-if="item.status === 'danger'"><CircleClose /></el-icon>
              <el-icon v-else><Warning /></el-icon>
            </div>
            <div class="warning-content">
              <div class="warning-title">
                <span class="user-name">{{ item.user }}</span>
                <el-tag :type="item.status" size="small">{{ item.type }}</el-tag>
              </div>
              <div class="warning-meta">
                <span>IP: {{ item.ip }}</span>
                <span>位置: {{ item.location }}</span>
                <span>时间: {{ item.time }}</span>
              </div>
            </div>
            <el-button type="primary" size="small" plain>处理</el-button>
          </div>
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
    grid-template-columns: repeat(2, 1fr);
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

  .operation-warning-row {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 20px;

    .operation-section,
    .warning-section {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #ebeef5;

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;

          .el-icon {
            color: #1a2a6c;
            font-size: 18px;
          }
        }
      }
    }

    .operation-section {
      .operation-summary {
        display: flex;
        justify-content: space-around;
        padding: 20px;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);

        .summary-item {
          text-align: center;

          .summary-value {
            display: block;
            font-size: 28px;
            font-weight: 700;
            color: #1a2a6c;
            font-family: 'DIN', sans-serif;
          }

          .summary-label {
            font-size: 13px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }

      .chart-container {
        padding: 16px;
      }
    }

    .warning-section {
      .section-header {
        .section-title .el-icon {
          color: #f56c6c;
        }
      }

      .warning-list {
        padding: 16px;
        max-height: 360px;
        overflow-y: auto;

        .warning-item {
          display: flex;
          align-items: center;
          padding: 16px;
          margin-bottom: 12px;
          border-radius: 8px;
          background: #fafafa;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;

          &:last-child {
            margin-bottom: 0;
          }

          &:hover {
            background: #f5f7fa;
            transform: translateX(4px);
          }

          &.danger {
            background: #fef0f0;
            border-left-color: #f56c6c;

            .warning-icon {
              background: #f56c6c;
            }
          }

          &.warning {
            background: #fdf6ec;
            border-left-color: #e6a23c;

            .warning-icon {
              background: #e6a23c;
            }
          }

          .warning-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #909399;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 20px;
            margin-right: 16px;
            flex-shrink: 0;
          }

          .warning-content {
            flex: 1;

            .warning-title {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 6px;

              .user-name {
                font-size: 15px;
                font-weight: 500;
                color: #303133;
              }
            }

            .warning-meta {
              font-size: 12px;
              color: #909399;

              span {
                margin-right: 16px;
              }
            }
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1600px) {
  .admin-home {
    .overview-section .overview-cards {
      grid-template-columns: repeat(3, 1fr);
    }

    .operation-warning-row {
      grid-template-columns: 1fr;
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
