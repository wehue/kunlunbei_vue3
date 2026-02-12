<template>
  <div class="content-box">
    <TreeFilter
      label="name"
      title="部门列表(单选)"
      :request-api="getUserDepartment"
      :default-value="treeFilterValue.departmentId"
      @change="changeTreeFilter"
    />
    <TreeFilter
      title="部门列表(多选)"
      multiple
      label="name"
      :request-api="getUserDepartment"
      :default-value="treeFilterValue1.departmentId"
      @change="changeTreeFilter1"
    />
    <div class="descriptions-box card">
      <span class="text"> 树形筛选器 🍓🍇🍈🍉</span>
      <el-descriptions title="配置项 📚" :column="1" border>
        <el-descriptions-item label="requestApi"> 请求分类数据的 api </el-descriptions-item>
        <el-descriptions-item label="data">
          分类数据，如果有分类数据，则不会执行 api 请求
        </el-descriptions-item>
        <el-descriptions-item label="title"> treeFilter 标题 </el-descriptions-item>
        <el-descriptions-item label="id"> 选择的id，默认为 “id” </el-descriptions-item>
        <el-descriptions-item label="label"> 显示的label，默认为 “label” </el-descriptions-item>
        <el-descriptions-item label="multiple"> 是否为多选，默认为 false </el-descriptions-item>
        <el-descriptions-item label="defaultValue"> 默认选中的值 </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup name="treeFilter">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import TreeFilter from '@/components/TreeFilter/index.vue'

const getUserDepartment = async () => {
  return [
    {
      id: '1',
      name: '技术部',
      children: [
        {
          id: '11',
          name: '前端开发',
        },
        {
          id: '12',
          name: '后端开发',
        },
        {
          id: '13',
          name: '测试',
        },
      ],
    },
    {
      id: '2',
      name: '产品部',
      children: [
        {
          id: '21',
          name: '产品规划',
        },
        {
          id: '22',
          name: '用户研究',
        },
      ],
    },
    {
      id: '3',
      name: '设计部',
      children: [
        {
          id: '31',
          name: 'UI设计',
        },
        {
          id: '32',
          name: '交互设计',
        },
      ],
    },
  ]
}

const treeFilterValue = reactive({ departmentId: '1' })
const changeTreeFilter = (val) => {
  ElMessage.success(`你选择了 id 为 ${val} 的数据🤔`)
  treeFilterValue.departmentId = val
}

const treeFilterValue1 = reactive({ departmentId: ['11'] })
const changeTreeFilter1 = (val) => {
  ElMessage.success(`你选择了 id 为 ${JSON.stringify(val)} 的数据🤔`)
  treeFilterValue1.departmentId = val
}
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
