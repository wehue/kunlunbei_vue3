<template>
  <el-pagination
    :background="true"
    :current-page="pageable.pageNum"
    :page-size="pageable.pageSize"
    :page-sizes="[10, 25, 50, 100]"
    :total="pageable.total"
    :size="globalStore?.assemblySize ?? 'default'"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  ></el-pagination>
</template>

<script setup name="Pagination">
import { useGlobalStore } from '@/stores/modules/global'
const globalStore = useGlobalStore()

defineProps({
  pageable: {
    type: Object,
    default: () => ({ pageNum: 1, pageSize: 10, total: 0 }),
  },
  handleSizeChange: { type: Function, default: () => {} },
  handleCurrentChange: { type: Function, default: () => {} },
})
</script>

<style lang="scss" scoped>
:deep(.el-pagination) {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;

  .el-pagination__total {
    margin-right: 12px;
  }

  .el-pagination__sizes {
    margin-right: 12px;
  }

  .el-pagination__jump {
    margin-left: 12px;
  }
}
</style>
