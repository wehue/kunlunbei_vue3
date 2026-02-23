import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOperationLogStore = defineStore('operationLog', () => {
  const operationHistory = ref([])
  const maxHistorySize = 100

  const canUndo = computed(() => operationHistory.value.length > 0)

  const recordOperation = (operation) => {
    const record = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      module: operation.module,
      action: operation.action,
      description: operation.description,
      beforeData: JSON.parse(JSON.stringify(operation.beforeData || null)),
      afterData: JSON.parse(JSON.stringify(operation.afterData || null)),
      targetId: operation.targetId,
      targetName: operation.targetName,
      rollbackFn: operation.rollbackFn,
    }

    operationHistory.value.unshift(record)

    if (operationHistory.value.length > maxHistorySize) {
      operationHistory.value = operationHistory.value.slice(0, maxHistorySize)
    }

    return record
  }

  const undoOperation = (recordId) => {
    const recordIndex = operationHistory.value.findIndex((r) => r.id === recordId)
    if (recordIndex === -1) {
      return { success: false, message: '操作记录不存在' }
    }

    const record = operationHistory.value[recordIndex]

    if (record.beforeData === null) {
      return { success: false, message: '该操作不支持回滚' }
    }

    operationHistory.value.splice(recordIndex, 1)

    return {
      success: true,
      record,
    }
  }

  const clearHistory = () => {
    operationHistory.value = []
  }

  const getRecentOperations = (limit = 10) => {
    return operationHistory.value.slice(0, limit)
  }

  const getOperationsByModule = (module) => {
    return operationHistory.value.filter((r) => r.module === module)
  }

  return {
    operationHistory,
    canUndo,
    recordOperation,
    undoOperation,
    clearHistory,
    getRecentOperations,
    getOperationsByModule,
  }
})
