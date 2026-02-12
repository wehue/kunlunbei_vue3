<template>
  <div class="tree-filter">
    <el-input v-model="filterText" placeholder="输入关键字进行过滤" clearable />
    <el-scrollbar :style="{ height: `${height}px` }">
      <el-tree
        ref="treeRef"
        :data="data"
        :props="defaultProps"
        :node-key="id"
        :default-expanded-keys="defaultExpandedKeys"
        :check-strictly="checkStrictly"
        :filter-node-method="filterNode"
        :highlight-current="!multiple"
        :show-checkbox="multiple"
        :default-checked-keys="multiple ? defaultCheckedKeys : []"
        node-key="id"
        @node-click="handleNodeClick"
        @check="handleCheck"
      >
        <template #default="scope">
          <span class="el-tree-node__label">
            <slot :row="scope">
              {{ scope.node.label }}
              <span class="count">{{ scope.node.data.count ?? '' }}</span>
            </slot>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script setup name="TreeFilter">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(
  defineProps({
    data: { type: Array, default: () => [] },
    id: { type: String, default: 'id' },
    label: { type: String, default: 'label' },
    children: { type: String, default: 'children' },
    multiple: { type: Boolean, default: false },
    defaultValue: { type: [String, Number, Array], default: undefined },
    checkStrictly: { type: Boolean, default: false },
    height: { type: Number, default: 500 },
  }),
  {},
)

const emit = defineEmits(['change'])

const defaultProps = {
  children: props.children,
  label: props.label,
}

const treeRef = ref()
const filterText = ref('')
const defaultExpandedKeys = ref([])
const defaultCheckedKeys = ref([])

watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

watch(
  () => props.defaultValue,
  () => {
    if (props.defaultValue !== undefined) {
      if (props.multiple) {
        defaultCheckedKeys.value = Array.isArray(props.defaultValue)
          ? [...props.defaultValue]
          : [props.defaultValue]
      } else {
        defaultExpandedKeys.value = [props.defaultValue]
        setTimeout(() => {
          treeRef.value?.setCurrentKey(props.defaultValue)
        }, 0)
      }
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (props.defaultValue !== undefined) {
    if (props.multiple) {
      defaultCheckedKeys.value = Array.isArray(props.defaultValue)
        ? [...props.defaultValue]
        : [props.defaultValue]
    } else {
      defaultExpandedKeys.value = [props.defaultValue]
      setTimeout(() => {
        treeRef.value?.setCurrentKey(props.defaultValue)
      }, 0)
    }
  }
})

const filterNode = (value, data) => {
  if (!value) return true
  return data[props.label].includes(value)
}

const handleNodeClick = (data) => {
  if (props.multiple) return
  emit('change', data[props.id], data)
}

const handleCheck = (data, { checkedKeys }) => {
  emit('change', checkedKeys, data)
}

const clearFilter = () => {
  filterText.value = ''
}

defineExpose({
  clearFilter,
  treeRef,
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
