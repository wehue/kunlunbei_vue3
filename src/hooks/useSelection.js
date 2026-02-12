import { ref, computed } from 'vue'

export const useSelection = (rowKey = 'id') => {
  const selectedList = ref([])
  const selectedListIds = computed(() => {
    return selectedList.value.map((item) => item[rowKey])
  })
  const isSelected = computed(() => {
    return selectedList.value.length > 0
  })

  const selectionChange = (selection) => {
    selectedList.value = selection
  }

  return {
    selectedList,
    selectedListIds,
    isSelected,
    selectionChange,
  }
}
