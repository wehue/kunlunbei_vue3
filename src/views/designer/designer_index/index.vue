<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import ECharts from '@/components/ECharts/index.vue'
import {
  Box,
  Cpu,
  Operation,
  Guide,
  TrendCharts,
  Plus,
  Document,
  Bell,
  Clock,
  ArrowRight,
  Edit,
  DataAnalysis,
  RefreshRight,
} from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores/modules/message'

const router = useRouter()
const messageStore = useMessageStore()
const loading = ref(false)

const overviewData = ref({
  materialTotal: 1256,
  equipmentTotal: 89,
  processTotal: 342,
  routeTotal: 156,
})

const trendData = ref({
  dates: ['02-15', '02-16', '02-17', '02-18', '02-19', '02-20', '02-21'],
  approvedRoutes: [12, 15, 8, 18, 22, 16, 20],
  newEquipment: [3, 5, 2, 4, 6, 3, 5],
  newMaterials: [25, 32, 18, 28, 35, 22, 30],
})

const todoList = ref([
  {
    id: 1,
    title: '审核驳回的工艺路线需重新提交',
    type: 'urgent',
    time: '2024-01-15 10:30',
    route: '/process-route-manage/process-route-manage-info',
  },
  {
    id: 2,
    title: '新增物料信息待完善',
    type: 'normal',
    time: '2024-01-15 09:20',
    route: '/material-manage/material-manage-info',
  },
  {
    id: 3,
    title: 'BOM清单版本需要更新',
    type: 'normal',
    time: '2024-01-14 16:45',
    route: '/material-manage/bom-manage',
  },
  {
    id: 4,
    title: '工艺路线PR003待提交审核',
    type: 'pending',
    time: '2024-01-14 14:00',
    route: '/process-route-manage/process-route-manage-info',
  },
])

const quickActions = ref([
  {
    id: 1,
    title: '新增物料',
    icon: Box,
    color: '#409eff',
    route: '/material-manage/material-manage-info',
  },
  {
    id: 2,
    title: '新增设备',
    icon: Cpu,
    color: '#67c23a',
    route: '/device-manage/device-manage-info',
  },
  {
    id: 3,
    title: '新增工序',
    icon: Operation,
    color: '#e6a23c',
    route: '/process-manage/process-manage-info',
  },
  {
    id: 4,
    title: '新增工艺路线',
    icon: Guide,
    color: '#f56c6c',
    route: '/process-route-manage/process-route-manage-add',
  },
  {
    id: 5,
    title: '新增BOM',
    icon: Document,
    color: '#909399',
    route: '/material-manage/bom-manage',
  },
  {
    id: 6,
    title: '物料分类管理',
    icon: DataAnalysis,
    color: '#9c27b0',
    route: '/material-manage/material-category',
  },
])

const materialCategoryData = ref([
  { name: '电子元器件', value: 425 },
  { name: '机械零件', value: 312 },
  { name: '金属材料', value: 256 },
  { name: '塑料件', value: 158 },
  { name: '成品', value: 105 },
])

const chartOption = computed(() => ({
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
    textStyle: {
      color: '#333',
    },
  },
  legend: {
    data: ['审核通过数', '新增设备', '新增物料'],
    top: 10,
    textStyle: {
      color: '#666',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: 60,
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: trendData.value.dates,
      axisPointer: {
        type: 'shadow',
      },
      axisLabel: {
        color: '#666',
      },
      axisLine: {
        lineStyle: {
          color: '#ddd',
        },
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name: '数量',
      min: 0,
      axisLabel: {
        color: '#666',
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ddd',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
        },
      },
    },
    {
      type: 'value',
      name: '物料数',
      min: 0,
      axisLabel: {
        color: '#666',
      },
      splitLine: {
        show: false,
      },
    },
  ],
  series: [
    {
      name: '审核通过数',
      type: 'bar',
      barWidth: '35%',
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
      data: trendData.value.approvedRoutes,
    },
    {
      name: '新增设备',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#67c23a',
      },
      itemStyle: {
        color: '#67c23a',
        borderWidth: 2,
        borderColor: '#fff',
      },
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
      data: trendData.value.newEquipment,
    },
    {
      name: '新增物料',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'diamond',
      symbolSize: 10,
      lineStyle: {
        width: 3,
        color: '#e6a23c',
      },
      itemStyle: {
        color: '#e6a23c',
        borderWidth: 2,
        borderColor: '#fff',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
            { offset: 1, color: 'rgba(230, 162, 60, 0.05)' },
          ],
        },
      },
      data: trendData.value.newMaterials,
    },
  ],
}))

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
          color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'][index],
        },
      })),
    },
  ],
}))

const animateNumber = (target, key, end, duration = 1000) => {
  const start = 0
  const startTime = performance.now()

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    target[key] = Math.floor(start + (end - start) * easeOutQuart)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

const handleQuickAction = (action) => {
  router.push(action.route)
}

const handleTodoClick = (todo) => {
  router.push(todo.route)
}

const getTodoTypeClass = (type) => {
  const map = {
    urgent: 'todo-urgent',
    normal: 'todo-normal',
    pending: 'todo-pending',
  }
  return map[type] || ''
}

const getTodoTypeLabel = (type) => {
  const map = {
    urgent: '紧急',
    normal: '普通',
    pending: '待处理',
  }
  return map[type] || ''
}

const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    animateNumber(overviewData.value, 'materialTotal', 1256)
    animateNumber(overviewData.value, 'equipmentTotal', 89)
    animateNumber(overviewData.value, 'processTotal', 342)
    animateNumber(overviewData.value, 'routeTotal', 156)
  }, 300)
}

onMounted(() => {
  fetchData()
  messageStore.startPolling((newMsg) => {
    ElNotification({
      title: newMsg.title,
      message: newMsg.summary,
      type: newMsg.auditStatus === '已通过' ? 'success' : 'warning',
      duration: 5000,
      position: 'top-right',
      onClick: () => {
        router.push('/message-manage/message-info')
      },
    })
  })
})

onUnmounted(() => {
  messageStore.stopPolling()
})
</script>

<template>
  <div class="designer-home">
    <div class="page-header">
      <div class="header-left">
        <el-icon class="header-icon"><TrendCharts /></el-icon>
        <div class="header-text">
          <h2 class="page-title">设计师工作台</h2>
          <span class="page-subtitle">实时掌握业务数据动态</span>
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
            <div class="card-value">{{ overviewData.materialTotal }}</div>
            <div class="card-label">物料总数</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card equipment-card">
          <div class="card-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.equipmentTotal }}</div>
            <div class="card-label">设备总数</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card process-card">
          <div class="card-icon">
            <el-icon><Operation /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.processTotal }}</div>
            <div class="card-label">工序总数</div>
          </div>
          <div class="card-decoration"></div>
        </div>

        <div class="overview-card route-card">
          <div class="card-icon">
            <el-icon><Guide /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overviewData.routeTotal }}</div>
            <div class="card-label">工艺路线总数</div>
          </div>
          <div class="card-decoration"></div>
        </div>
      </div>
    </div>

    <div class="action-todo-row">
      <div class="quick-action-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon><Plus /></el-icon>
            <span>快捷操作</span>
          </div>
        </div>
        <div class="quick-actions">
          <div
            v-for="action in quickActions"
            :key="action.id"
            class="action-item"
            @click="handleQuickAction(action)"
          >
            <div class="action-icon" :style="{ background: action.color }">
              <el-icon><component :is="action.icon" /></el-icon>
            </div>
            <div class="action-title">{{ action.title }}</div>
          </div>
        </div>
      </div>

      <div class="todo-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon><Bell /></el-icon>
            <span>待办事项</span>
          </div>
          <el-badge :value="todoList.length" type="primary" />
        </div>
        <div class="todo-list">
          <div
            v-for="todo in todoList"
            :key="todo.id"
            class="todo-item"
            :class="getTodoTypeClass(todo.type)"
            @click="handleTodoClick(todo)"
          >
            <div class="todo-left">
              <span class="todo-tag">{{ getTodoTypeLabel(todo.type) }}</span>
              <span class="todo-title">{{ todo.title }}</span>
            </div>
            <div class="todo-right">
              <span class="todo-time">
                <el-icon><Clock /></el-icon>
                {{ todo.time }}
              </span>
              <el-icon class="todo-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <div v-if="todoList.length === 0" class="empty-todo">
            <el-empty description="暂无待办事项" :image-size="80" />
          </div>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-section trend-chart">
        <div class="section-header">
          <div class="section-title">
            <el-icon><TrendCharts /></el-icon>
            <span>近7天业务趋势</span>
          </div>
          <div class="section-subtitle">审核通过数、新增设备、新增物料数据统计</div>
        </div>
        <div class="chart-container">
          <ECharts :option="chartOption" />
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
.designer-home {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 100px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

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
      grid-template-columns: repeat(4, 1fr);
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

        &.process-card {
          .card-icon {
            background: linear-gradient(135deg, #e6a23c 0%, #eebe77 100%);
          }

          .card-decoration {
            background: #e6a23c;
          }
        }

        &.route-card {
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

  .action-todo-row {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 20px;
    margin-bottom: 24px;

    .quick-action-section,
    .todo-section {
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
            color: #409eff;
            font-size: 18px;
          }
        }
      }
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 20px;

      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 20px 16px;
        background: #f8f9fa;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: #f0f2f5;
          transform: translateY(-2px);

          .action-icon {
            transform: scale(1.1);
          }
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: #fff;
          transition: transform 0.3s ease;
        }

        .action-title {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }
      }
    }

    .todo-list {
      padding: 12px 20px 20px;
      max-height: 280px;
      overflow-y: auto;

      .todo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 16px;
        background: #fafafa;
        border-radius: 8px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-left: 3px solid transparent;

        &:last-child {
          margin-bottom: 0;
        }

        &:hover {
          background: #f0f2f5;
          transform: translateX(4px);
        }

        &.todo-urgent {
          border-left-color: #f56c6c;

          .todo-tag {
            background: #fef0f0;
            color: #f56c6c;
          }
        }

        &.todo-normal {
          border-left-color: #409eff;

          .todo-tag {
            background: #ecf5ff;
            color: #409eff;
          }
        }

        &.todo-pending {
          border-left-color: #e6a23c;

          .todo-tag {
            background: #fdf6ec;
            color: #e6a23c;
          }
        }

        .todo-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;

          .todo-tag {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            flex-shrink: 0;
          }

          .todo-title {
            font-size: 14px;
            color: #303133;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .todo-right {
          display: flex;
          align-items: center;
          gap: 12px;

          .todo-time {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #909399;
          }

          .todo-arrow {
            color: #c0c4cc;
            transition: transform 0.3s ease;
          }
        }

        &:hover .todo-arrow {
          transform: translateX(4px);
          color: #409eff;
        }
      }

      .empty-todo {
        padding: 20px;
      }
    }
  }

  .charts-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 20px;

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
            color: #409eff;
            font-size: 20px;
          }
        }

        .section-subtitle {
          font-size: 14px;
          color: #909399;
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
  .designer-home {
    .action-todo-row {
      grid-template-columns: 1fr;

      .quick-actions {
        grid-template-columns: repeat(6, 1fr);
      }
    }

    .charts-row {
      grid-template-columns: 1fr;
    }
  }
}

@media screen and (max-width: 1400px) {
  .designer-home {
    .overview-section {
      .overview-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .action-todo-row {
      .quick-actions {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .designer-home {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-right {
        width: 100%;

        .update-time {
          display: block;
          text-align: center;
        }
      }
    }

    .overview-section {
      .overview-cards {
        grid-template-columns: 1fr;

        .overview-card {
          .card-content {
            .card-value {
              font-size: 28px;
            }
          }
        }
      }
    }

    .action-todo-row {
      .quick-actions {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .charts-row {
      .chart-section {
        .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .chart-container {
          height: 300px;
        }
      }
    }
  }
}
</style>
