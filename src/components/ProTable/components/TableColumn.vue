<template>
  <template v-if="column.isShow">
    <el-table-column
      v-bind="column"
      :align="column.align ?? 'center'"
      :show-overflow-tooltip="column.showOverflowTooltip ?? column.prop !== 'operation'"
    >
      <template #default="scope">
        <template v-if="column._children">
          <template v-for="child in column._children" :key="child.prop">
            <TableColumn :column="child">
              <template v-for="slot in Object.keys($slots)" #[slot]="slotScope">
                <slot :name="slot" v-bind="slotScope" />
              </template>
            </TableColumn>
          </template>
        </template>
        <template v-else-if="column.render">
          <component :is="column.render" v-bind="scope" />
        </template>
        <template v-else-if="column.prop && slots[handleProp(column.prop)]">
          <slot :name="handleProp(column.prop)" v-bind="scope" />
        </template>
        <template v-else-if="column.tag">
          <el-tag :type="getTagType(column, scope)">
            {{ renderCellData(column, scope) }}
          </el-tag>
        </template>
        <template v-else>
          {{ renderCellData(column, scope) }}
        </template>
      </template>
      <template #header="scope">
        <template v-if="column.headerRender">
          <component :is="column.headerRender" v-bind="scope" />
        </template>
        <template v-else-if="column.prop && slots[`${handleProp(column.prop)}Header`]">
          <slot :name="`${handleProp(column.prop)}Header`" v-bind="scope" />
        </template>
        <template v-else>
          {{ column.label }}
        </template>
      </template>
    </el-table-column>
  </template>
</template>

<script setup name="TableColumn">
import { inject, ref, useSlots } from 'vue'
import { filterEnum, formatValue, handleProp, handleRowAccordingToProp } from '@/utils'

defineProps({
  column: { type: Object, required: true },
})

const slots = useSlots()

const enumMap = inject('enumMap', ref(new Map()))

const renderCellData = (item, scope) => {
  return enumMap.value.get(item.prop) && item.isFilterEnum
    ? filterEnum(
        handleRowAccordingToProp(scope.row, item.prop),
        enumMap.value.get(item.prop),
        item.fieldNames,
      )
    : formatValue(handleRowAccordingToProp(scope.row, item.prop))
}

const getTagType = (item, scope) => {
  return (
    filterEnum(
      handleRowAccordingToProp(scope.row, item.prop),
      enumMap.value.get(item.prop),
      item.fieldNames,
      'tag',
    ) || 'primary'
  )
}
</script>
