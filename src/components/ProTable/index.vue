<template>
  <SearchForm
    v-show="isShowSearch"
    :search="_search"
    :reset="_reset"
    :columns="searchColumns"
    :search-param="searchParam"
    :search-col="searchCol"
  />

  <div class="card table-main">
    <div class="table-header">
      <div class="header-button-lf">
        <slot
          name="tableHeader"
          :selected-list="selectedList"
          :selected-list-ids="selectedListIds"
          :is-selected="isSelected"
        />
      </div>
    </div>
    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :id="uuid"
      :data="processTableData"
      :border="border"
      :row-key="rowKey"
      @selection-change="selectionChange"
    >
      <slot />
      <template v-for="item in tableColumns" :key="item">
        <el-table-column
          v-if="item.type && columnTypes.includes(item.type)"
          v-bind="item"
          :align="item.align ?? 'center'"
          :reserve-selection="item.type == 'selection'"
        >
          <template #default="scope">
            <template v-if="item.type == 'expand'">
              <component :is="item.render" v-bind="scope" v-if="item.render" />
              <slot v-else :name="item.type" v-bind="scope" />
            </template>
            <el-radio v-if="item.type == 'radio'" v-model="radio" :label="scope.row[rowKey]">
              <i></i>
            </el-radio>
            <el-tag v-if="item.type == 'sort'" class="move">
              <el-icon> <DCaret /></el-icon>
            </el-tag>
          </template>
        </el-table-column>
        <TableColumn v-else :column="item">
          <template v-for="slot in Object.keys($slots)" #[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>
        </TableColumn>
      </template>
      <template #append>
        <slot name="append" />
      </template>
      <template #empty>
        <div class="table-empty">
          <slot name="empty">
            <img src="@/assets/images/notData.png" alt="notData" />
            <div>暂无数据</div>
          </slot>
        </div>
      </template>
    </el-table>
    <slot name="pagination">
      <Pagination
        v-if="pagination"
        :pageable="pageable"
        :handle-size-change="handleSizeChange"
        :handle-current-change="handleCurrentChange"
      />
    </slot>
  </div>
  <ColSetting v-if="toolButton" ref="colRef" :col-setting="colSetting" />
</template>

<script setup name="ProTable">
import { ref, watch, provide, onMounted, unref, computed, reactive } from 'vue'
import { useTable } from '@/hooks/useTable'
import { useSelection } from '@/hooks/useSelection'
import { Refresh, Operation, Search, DCaret } from '@element-plus/icons-vue'
import { generateUUID, handleProp } from '@/utils'
import SearchForm from '@/components/SearchForm/index.vue'
import Pagination from './components/Pagination.vue'
import ColSetting from './components/ColSetting.vue'
import TableColumn from './components/TableColumn.vue'
import Sortable from 'sortablejs'

const props = defineProps({
  columns: { type: Array, default: () => [] },
  data: { type: Array, default: undefined },
  requestApi: { type: Function, default: undefined },
  requestAuto: { type: Boolean, default: true },
  requestError: { type: Function, default: undefined },
  dataCallback: { type: Function, default: undefined },
  title: { type: String, default: undefined },
  pagination: { type: Boolean, default: true },
  initParam: { type: Object, default: () => ({}) },
  border: { type: Boolean, default: true },
  toolButton: { type: [Array, Boolean], default: true },
  rowKey: { type: String, default: 'id' },
  searchCol: { type: [Number, Object], default: () => ({ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }) },
})

const tableRef = ref()

const uuid = ref('id-' + generateUUID())

const columnTypes = ['selection', 'radio', 'index', 'expand', 'sort']

const isShowSearch = ref(true)

const showToolButton = (key) => {
  return Array.isArray(props.toolButton) ? props.toolButton.includes(key) : props.toolButton
}

const radio = ref('')

const { selectionChange, selectedList, selectedListIds, isSelected } = useSelection(props.rowKey)

const {
  tableData,
  pageable,
  searchParam,
  searchInitParam,
  getTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange,
} = useTable(
  props.requestApi,
  props.initParam,
  props.pagination,
  props.dataCallback,
  props.requestError,
)

const clearSelection = () => tableRef.value?.clearSelection()

onMounted(() => {
  dragSort()
  props.requestAuto && getTableList()
  props.data && (pageable.value.total = props.data.length)
})

const processTableData = computed(() => {
  if (!props.data) return tableData.value
  if (!props.pagination) return props.data
  return props.data.slice(
    (pageable.value.pageNum - 1) * pageable.value.pageSize,
    pageable.value.pageSize * pageable.value.pageNum,
  )
})

watch(() => props.initParam, getTableList, { deep: true })

const tableColumns = reactive(props.columns)

const flatColumns = computed(() => flatColumnsFunc(tableColumns))

const enumMap = ref(new Map())
const setEnumMap = async ({ prop, enum: enumValue }) => {
  if (!enumValue) return

  if (
    enumMap.value.has(prop) &&
    (typeof enumValue === 'function' || enumMap.value.get(prop) === enumValue)
  )
    return

  if (typeof enumValue !== 'function') return enumMap.value.set(prop, unref(enumValue))

  enumMap.value.set(prop, [])

  const { data } = await enumValue()
  enumMap.value.set(prop, data)
}

provide('enumMap', enumMap)

const flatColumnsFunc = (columns, flatArr = []) => {
  columns.forEach(async (col) => {
    if (col._children?.length) flatArr.push(...flatColumnsFunc(col._children))
    flatArr.push(col)

    col.isShow = col.isShow ?? true
    col.isSetting = col.isSetting ?? true
    col.isFilterEnum = col.isFilterEnum ?? true

    await setEnumMap(col)
  })
  return flatArr.filter((item) => !item._children?.length)
}

const searchColumns = computed(() => {
  return flatColumns.value
    ?.filter((item) => item.search?.el || item.search?.render)
    .sort((a, b) => a.search.order - b.search.order)
})

searchColumns.value?.forEach((column, index) => {
  column.search.order = column.search?.order ?? index + 2
  const key = column.search?.key ?? handleProp(column.prop)
  const defaultValue = column.search?.defaultValue
  if (defaultValue !== undefined && defaultValue !== null) {
    searchParam.value[key] = defaultValue
    searchInitParam.value[key] = defaultValue
  }
})

const colRef = ref()
const colSetting = tableColumns.filter((item) => {
  const { type, prop, isSetting } = item
  return !columnTypes.includes(type) && prop !== 'operation' && isSetting
})
const openColSetting = () => colRef.value.openColSetting()

const emit = defineEmits(['search', 'reset', 'dragSort'])

const _search = () => {
  search()
  emit('search')
}

const _reset = () => {
  reset()
  emit('reset')
}

const dragSort = () => {
  const tbody = document.querySelector(`#${uuid.value} tbody`)
  if (tbody) {
    Sortable.create(tbody, {
      handle: '.move',
      animation: 300,
      onEnd({ newIndex, oldIndex }) {
        const [removedItem] = processTableData.value.splice(oldIndex, 1)
        processTableData.value.splice(newIndex, 0, removedItem)
        emit('dragSort', { newIndex, oldIndex })
      },
    })
  }
}

defineExpose({
  element: tableRef,
  tableData: processTableData,
  radio,
  pageable,
  searchParam,
  searchInitParam,
  isSelected,
  selectedList,
  selectedListIds,
  getTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange,
  clearSelection,
  enumMap,
})
</script>
