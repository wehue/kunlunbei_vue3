<template>
  <div class="select-filter">
    <div v-if="title" class="title">
      {{ title }}
    </div>
    <div class="select-filter-list">
      <el-scrollbar>
        <ul class="select-filter-item">
          <li
            v-for="(item, index) in list"
            :key="item[props.value]"
            :class="{ active: active.includes(item[props.value]), 'not-allowed': item.disabled }"
            @click="selectActive(item)"
          >
            <slot :row="item">
              <span class="select-filter-label">{{ item[props.label] }}</span>
              <span class="select-filter-count">{{ item[props.count] ?? 0 }}</span>
            </slot>
          </li>
        </ul>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup name="SelectFilter">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps({
    list: { type: Array, default: () => [] },
    title: { type: String, default: undefined },
    defaultValue: { type: [String, Number, Array], default: undefined },
    multiple: { type: Boolean, default: false },
    props: { type: Object, default: () => ({ label: 'label', value: 'value', count: 'count' }) },
  }),
  {},
)

const emit = defineEmits(['change'])

const active = ref([])

watch(
  () => props.defaultValue,
  () => {
    if (props.defaultValue !== undefined) {
      active.value = Array.isArray(props.defaultValue)
        ? [...props.defaultValue]
        : [props.defaultValue]
    }
  },
  { immediate: true },
)

const selectActive = (item) => {
  if (item.disabled) return

  const value = item[props.props.value]

  if (props.multiple) {
    const index = active.value.indexOf(value)
    if (index === -1) {
      active.value.push(value)
    } else {
      active.value.splice(index, 1)
    }
  } else {
    active.value = [value]
  }

  emit('change', props.multiple ? [...active.value] : active.value[0])
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
