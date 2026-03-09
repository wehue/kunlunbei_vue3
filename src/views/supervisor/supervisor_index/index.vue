<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ECharts from '@/components/ECharts/index.vue'
import {
  Box,
  Cpu,
  Guide,
  Operation,
  DocumentChecked,
  RefreshRight,
  TrendCharts,
  Timer,
  TrophyBase,
  Warning,
  Clock,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getSupervisorConsole1,
  getSupervisorConsole2,
  getSupervisorConsole3,
  getSupervisorConsole4,
} from '@/api/user'

const loading = ref(false)
const refreshInterval = ref(null)

const overviewData = ref({
  equipmentTotal: 0,
  materialTotal: 0,
  routeTotal: 0,
  processTotal: 0,
})

const supervisorData = ref({
  pendingApproval: 0,
  rejectedNotResubmit: 0,
})

const trendData = ref({
  dates: [],
  submitData: [],
  passData: [],
  rejectData: [],
})

const designerRanking = ref([])

const overdueWarnings = ref([])

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
      rotate: 45,
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

const fetchData = async () => {
  loading.value = true
  try {
    // 获取卡片数据
    const cardResponse = await getSupervisorConsole1()
    console.log('获取主管控制台数据成功', cardResponse)

    if (cardResponse.data && cardResponse.data.code === 200) {
      const data = cardResponse.data.data
      overviewData.value = {
        materialTotal: data['物料数量'] || 0,
        equipmentTotal: data['设备数量'] || 0,
        processTotal: data['工序数量'] || 0,
        routeTotal: data['工艺路线数量'] || 0,
      }

      supervisorData.value = {
        pendingApproval: data['待办审批数'] || 0,
        rejectedNotResubmit: data['驳回未重提数'] || 0,
      }

      // 数字动画效果
      animateNumber(overviewData.value, 'equipmentTotal', overviewData.value.equipmentTotal)
      animateNumber(overviewData.value, 'materialTotal', overviewData.value.materialTotal)
      animateNumber(overviewData.value, 'routeTotal', overviewData.value.routeTotal)
      animateNumber(overviewData.value, 'processTotal', overviewData.value.processTotal)
      animateNumber(supervisorData.value, 'pendingApproval', supervisorData.value.pendingApproval)
      animateNumber(
        supervisorData.value,
        'rejectedNotResubmit',
        supervisorData.value.rejectedNotResubmit,
      )
    }

    // 获取工艺路线数据统计
    const trendResponse = await getSupervisorConsole2()
    console.log('获取主管工艺路线数据统计成功', trendResponse)

    if (trendResponse.data && trendResponse.data.code === 200) {
      const trendDataResponse = trendResponse.data.data
      const routeStats = trendDataResponse['近30天工艺路线数据统计']

      if (routeStats) {
        // 获取所有日期并排序
        const rejectData = routeStats['驳回数'] || {}
        const submitData = routeStats['提交数'] || {}
        const passData = routeStats['通过数'] || {}

        // 获取所有唯一的日期
        const allDates = new Set()
        Object.keys(rejectData).forEach((date) => allDates.add(date))
        Object.keys(submitData).forEach((date) => allDates.add(date))
        Object.keys(passData).forEach((date) => allDates.add(date))

        // 转换为数组并按日期排序
        const sortedDates = Array.from(allDates).sort((dateA, dateB) => {
          return new Date(dateA) - new Date(dateB)
        })

        // 准备数据
        const dates = []
        const submitDataArray = []
        const passDataArray = []
        const rejectDataArray = []

        // 填充数据
        sortedDates.forEach((date) => {
          // 将日期格式从 YYYY-MM-DD 转换为 MM-DD
          const [year, month, day] = date.split('-')
          dates.push(`${month}-${day}`)
          submitDataArray.push(submitData[date] || 0)
          passDataArray.push(passData[date] || 0)
          rejectDataArray.push(rejectData[date] || 0)
        })

        // 更新趋势数据
        trendData.value = {
          dates: dates,
          submitData: submitDataArray,
          passData: passDataArray,
          rejectData: rejectDataArray,
        }
      }
    }

    // 获取设计师绩效排名
    const rankingResponse = await getSupervisorConsole3()
    console.log('获取设计师绩效排名成功', rankingResponse)

    if (rankingResponse.data && rankingResponse.data.code === 200) {
      const rankingData = rankingResponse.data.data.data

      if (rankingData && Array.isArray(rankingData)) {
        // 转换数据格式并按提交数排序
        const newRanking = rankingData
          .map((item, index) => ({
            rank: index + 1,
            name: item.applicantName,
            dept: '', // API 响应中没有部门信息，暂时留空
            submitCount: item.totalSubmit || 0,
            passRate: parseFloat(item.passRate) || 0,
          }))
          .sort((a, b) => b.submitCount - a.submitCount)

        designerRanking.value = newRanking
      }
    }

    // 获取审批超时预警
    const warningResponse = await getSupervisorConsole4()
    console.log('获取审批超时预警成功', warningResponse)

    if (warningResponse.data && warningResponse.data.code === 200) {
      const warningData = warningResponse.data.data
      const timeoutGroups = warningData.timeoutGroups

      if (timeoutGroups) {
        const newWarnings = []
        let id = 1

        // 处理超时72小时的数据
        if (timeoutGroups.timeout72Hours && Array.isArray(timeoutGroups.timeout72Hours)) {
          timeoutGroups.timeout72Hours.forEach((item) => {
            newWarnings.push({
              id: id++,
              routeName: item.routeName || '未知工艺路线',
              designer: item.designerName || '未知设计师',
              submitTime: item.submitTime || '',
              overdueHours: 72,
              status: 'urgent',
            })
          })
        }

        // 处理超时48小时的数据
        if (timeoutGroups.timeout48Hours && Array.isArray(timeoutGroups.timeout48Hours)) {
          timeoutGroups.timeout48Hours.forEach((item) => {
            newWarnings.push({
              id: id++,
              routeName: item.routeName || '未知工艺路线',
              designer: item.designerName || '未知设计师',
              submitTime: item.submitTime || '',
              overdueHours: 48,
              status: 'warning',
            })
          })
        }

        // 处理超时24小时的数据
        if (timeoutGroups.timeout24Hours && Array.isArray(timeoutGroups.timeout24Hours)) {
          timeoutGroups.timeout24Hours.forEach((item) => {
            newWarnings.push({
              id: id++,
              routeName: item.routeName || '未知工艺路线',
              designer: item.designerName || '未知设计师',
              submitTime: item.submitTime || '',
              overdueHours: 24,
              status: 'notice',
            })
          })
        }

        overdueWarnings.value = newWarnings
      }
    }
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('数据加载失败')
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
    target[key] = Math.floor(start + (end - start) * easeOutQuart)
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

onMounted(() => {
  fetchData()
  setupAutoRefresh()
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
        <div class="overview-card equipment-card">
          <div class="card-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.equipmentTotal }}</div>
            <div class="card-label">设备数量</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card material-card">
          <div class="card-icon">
            <el-icon><Box /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.materialTotal }}</div>
            <div class="card-label">物料数量</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card route-card">
          <div class="card-icon">
            <el-icon><Guide /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.routeTotal }}</div>
            <div class="card-label">工艺路线数量</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card process-card">
          <div class="card-icon">
            <el-icon><Operation /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.processTotal }}</div>
            <div class="card-label">工序数量</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card pending-card">
          <div class="card-icon">
            <el-icon><DocumentChecked /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ supervisorData.pendingApproval }}</div>
            <div class="card-label">待办审批数</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card rejected-card">
          <div class="card-icon">
            <el-icon><RefreshRight /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ supervisorData.rejectedNotResubmit }}</div>
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
      </div>
      <div class="chart-container">
        <ECharts :option="chartOption" />
      </div>
    </div>

    <div class="charts-row">
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
      grid-template-columns: repeat(6, 1fr);
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
        &.process-card {
          .card-icon {
            background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%);
          }
          .card-decoration {
            background: #909399;
          }
        }
        &.pending-card {
          .card-icon {
            background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
          }
          .card-decoration {
            background: #409eff;
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
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 24px;

    .chart-section {
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
