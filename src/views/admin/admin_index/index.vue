<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
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
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

const router = useRouter()

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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#eee',
    borderWidth: 1,
    textStyle: { color: '#333' },
  },
  legend: {
    data: ['登录人次'],
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
    axisLabel: { color: '#666' },
    axisLine: { lineStyle: { color: '#ddd' } },
  },
  yAxis: {
    type: 'value',
    name: '人次',
    axisLabel: { color: '#666' },
    axisLine: { show: true, lineStyle: { color: '#ddd' } },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
  },
  series: [
    {
      name: '登录人次',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { width: 3, color: '#409eff' },
      itemStyle: { color: '#409eff', borderWidth: 2, borderColor: '#fff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
          ],
        },
      },
      data: loginTrendData.value.loginCounts,
    },
  ],
}))

const activeTimeChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
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
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2, color: '#67c23a' },
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
      data: activeTimeData.value.counts,
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

const handleCardClick = (type) => {
  const routeMap = {
    material: '/material-manage/material-info',
    equipment: '/device-manage/device-manage-info',
    process: '/process-manage/process-info',
    route: '/route-manage/route-info',
    user: '/admin-manage/user-manage-info',
  }
  router.push(routeMap[type])
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
        <div class="overview-card material-card" @click="handleCardClick('material')">
          <div class="card-icon">
            <el-icon><Box /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.materialCount }}</div>
            <div class="card-label">物料数量</div>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <div class="overview-card equipment-card" @click="handleCardClick('equipment')">
          <div class="card-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.equipmentCount }}</div>
            <div class="card-label">设备数量</div>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <div class="overview-card process-card" @click="handleCardClick('process')">
          <div class="card-icon">
            <el-icon><Operation /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.processCount }}</div>
            <div class="card-label">工序数量</div>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <div class="overview-card route-card" @click="handleCardClick('route')">
          <div class="card-icon">
            <el-icon><Guide /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.routeCount }}</div>
            <div class="card-label">工艺路线数量</div>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <div class="overview-card user-card" @click="handleCardClick('user')">
          <div class="card-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.userCount }}</div>
            <div class="card-label">用户账号数量</div>
          </div>
          <div class="card-arrow">→</div>
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
    background: linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(26, 42, 108, 0.3);

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
        padding: 24px 20px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          .card-arrow {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          color: #fff;
        }
        .card-content {
          text-align: center;
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
        .card-arrow {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%) translateX(-10px);
          font-size: 20px;
          color: #c0c4cc;
          opacity: 0;
          transition: all 0.3s ease;
        }
        &.material-card .card-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        &.equipment-card .card-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        &.process-card .card-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        &.route-card .card-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
        &.user-card .card-icon {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
      }
    }
  }

  .charts-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    .chart-section {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      .section-header {
        padding: 16px 20px;
        border-bottom: 1px solid #ebeef5;
        display: flex;
        justify-content: space-between;
        align-items: center;
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
        .section-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }
      .chart-container {
        height: 320px;
        padding: 16px;
      }
    }
  }
}

@media screen and (max-width: 1600px) {
  .admin-home .overview-section .overview-cards {
    grid-template-columns: repeat(3, 1fr);
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
    }
    .overview-section .overview-cards {
      grid-template-columns: 1fr;
    }
  }
}
</style>
