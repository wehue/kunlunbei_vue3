<script setup>
import { computed, ref } from 'vue'
import { ArrowRight, Plus, Minus, Edit } from '@element-plus/icons-vue'

const props = defineProps({
  beforeData: {
    type: Object,
    default: null,
  },
  afterData: {
    type: Object,
    default: null,
  },
  operationType: {
    type: String,
    default: '',
  },
})

const viewMode = ref('compare')

const allFields = computed(() => {
  const fields = new Set()
  if (props.beforeData) {
    Object.keys(props.beforeData).forEach((key) => fields.add(key))
  }
  if (props.afterData) {
    Object.keys(props.afterData).forEach((key) => fields.add(key))
  }
  return Array.from(fields).sort()
})

const fieldLabels = {
  deviceName: '设备名称',
  deviceCode: '设备编码',
  materialName: '物料名称',
  materialCode: '物料编码',
  stockQuantity: '库存数量',
  categoryName: '分类名称',
  categoryId: '分类ID',
  userName: '用户名',
  status: '状态',
  deptName: '部门名称',
  deptCode: '部门编码',
  warehouseName: '仓库名称',
  capacity: '容量',
  productName: '产品名称',
  productCode: '产品编码',
  processName: '工序名称',
  processCode: '工序编码',
  routeName: '路线名称',
  routeCode: '路线编码',
  description: '描述',
  createTime: '创建时间',
  updateTime: '更新时间',
  operator: '操作人',
  remark: '备注',
}

const getFieldLabel = (field) => {
  return fieldLabels[field] || field
}

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

const getChangeType = (field) => {
  const beforeValue = props.beforeData?.[field]
  const afterValue = props.afterData?.[field]

  if (beforeValue === undefined || beforeValue === null) {
    if (afterValue !== undefined && afterValue !== null) {
      return 'added'
    }
  } else if (afterValue === undefined || afterValue === null) {
    if (beforeValue !== undefined && beforeValue !== null) {
      return 'removed'
    }
  } else if (beforeValue !== afterValue) {
    return 'modified'
  }
  return 'unchanged'
}

const getChangeIcon = (changeType) => {
  switch (changeType) {
    case 'added':
      return Plus
    case 'removed':
      return Minus
    case 'modified':
      return Edit
    default:
      return null
  }
}

const getChangeColor = (changeType) => {
  switch (changeType) {
    case 'added':
      return '#67c23a'
    case 'removed':
      return '#f56c6c'
    case 'modified':
      return '#e6a23c'
    default:
      return '#909399'
  }
}

const isValueChanged = (field) => {
  return getChangeType(field) !== 'unchanged'
}

const changedFieldsCount = computed(() => {
  return allFields.value.filter((field) => isValueChanged(field)).length
})

const getOperationIcon = computed(() => {
  switch (props.operationType) {
    case '新增':
      return Plus
    case '删除':
      return Minus
    case '修改':
      return Edit
    default:
      return null
  }
})

const getOperationColor = computed(() => {
  switch (props.operationType) {
    case '新增':
      return '#67c23a'
    case '删除':
      return '#f56c6c'
    case '修改':
      return '#e6a23c'
    default:
      return '#409eff'
  }
})
</script>

<template>
  <div class="data-compare-container">
    <div class="compare-header">
      <div class="operation-badge" :style="{ backgroundColor: getOperationColor }">
        <el-icon v-if="getOperationIcon">
          <component :is="getOperationIcon" />
        </el-icon>
        <span>{{ operationType }}操作</span>
      </div>
      <div class="view-toggle">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="compare">对比视图</el-radio-button>
          <el-radio-button value="table">表格视图</el-radio-button>
        </el-radio-group>
      </div>
      <div class="change-summary">
        <span class="summary-item">
          <el-icon style="color: #67c23a"><Plus /></el-icon>
          新增: {{ allFields.filter((f) => getChangeType(f) === 'added').length }}
        </span>
        <span class="summary-item">
          <el-icon style="color: #f56c6c"><Minus /></el-icon>
          删除: {{ allFields.filter((f) => getChangeType(f) === 'removed').length }}
        </span>
        <span class="summary-item">
          <el-icon style="color: #e6a23c"><Edit /></el-icon>
          修改: {{ allFields.filter((f) => getChangeType(f) === 'modified').length }}
        </span>
      </div>
    </div>

    <div v-if="viewMode === 'compare'" class="compare-view">
      <div v-if="operationType === '新增'" class="single-column-view">
        <div class="column-header added">
          <el-icon><Plus /></el-icon>
          <span>新增数据</span>
        </div>
        <div class="data-list">
          <div v-for="field in allFields" :key="field" class="data-item added">
            <div class="field-label">{{ getFieldLabel(field) }}</div>
            <div class="field-value">{{ formatValue(afterData?.[field]) }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="operationType === '删除'" class="single-column-view">
        <div class="column-header removed">
          <el-icon><Minus /></el-icon>
          <span>删除数据</span>
        </div>
        <div class="data-list">
          <div v-for="field in allFields" :key="field" class="data-item removed">
            <div class="field-label">{{ getFieldLabel(field) }}</div>
            <div class="field-value">{{ formatValue(beforeData?.[field]) }}</div>
          </div>
        </div>
      </div>

      <div v-else class="dual-column-view">
        <div class="column before-column">
          <div class="column-header before">
            <span>变更前</span>
          </div>
          <div class="data-list">
            <div
              v-for="field in allFields"
              :key="field"
              class="data-item"
              :class="getChangeType(field)"
            >
              <div class="field-label">
                <el-icon
                  v-if="isValueChanged(field)"
                  :color="getChangeColor(getChangeType(field))"
                >
                  <component :is="getChangeIcon(getChangeType(field))" />
                </el-icon>
                {{ getFieldLabel(field) }}
              </div>
              <div class="field-value">
                {{ formatValue(beforeData?.[field]) }}
              </div>
            </div>
          </div>
        </div>

        <div class="arrow-column">
          <div v-for="field in allFields" :key="field" class="arrow-item">
            <el-icon
              v-if="isValueChanged(field)"
              :color="get