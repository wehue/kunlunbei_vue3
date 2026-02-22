<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { usePermission } from '@/hooks/usePermission'

const { isAdminRole } = usePermission()

const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref()
const treeRef = ref()

const formData = reactive({
  id: null,
  label: '',
  parentId: null,
  parentName: '',
})

const rules = {
  label: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

const categoryData = ref([
  {
    id: 1,
    label: '电子元器件',
    parentId: 0,
    level: 1,
    children: [
      {
        id: 11,
        label: '无源分立元件',
        parentId: 1,
        level: 2,
        children: [
          {
            id: 111,
            label: '磁性元件',
            parentId: 11,
            level: 3,
            children: [
              { id: 1111, label: '贴片电感', parentId: 111, level: 4, children: [] },
              { id: 1112, label: '功率磁环', parentId: 111, level: 4, children: [] },
              { id: 1113, label: '互感器磁芯', parentId: 111, level: 4, children: [] },
            ],
          },
          { id: 112, label: '电阻', parentId: 11, level: 3, children: [] },
          { id: 113, label: '电容', parentId: 11, level: 3, children: [] },
          { id: 114, label: '电感', parentId: 11, level: 3, children: [] },
        ],
      },
      {
        id: 12,
        label: '有源器件',
        parentId: 1,
        level: 2,
        children: [
          { id: 121, label: '二极管', parentId: 12, level: 3, children: [] },
          { id: 122, label: '三极管', parentId: 12, level: 3, children: [] },
          { id: 123, label: '集成电路', parentId: 12, level: 3, children: [] },
        ],
      },
      {
        id: 13,
        label: '连接器件',
        parentId: 1,
        level: 2,
        children: [
          { id: 131, label: '接插件', parentId: 13, level: 3, children: [] },
          { id: 132, label: '线缆', parentId: 13, level: 3, children: [] },
        ],
      },
    ],
  },
  {
    id: 2,
    label: '机械零件',
    parentId: 0,
    level: 1,
    children: [
      {
        id: 21,
        label: '紧固件',
        parentId: 2,
        level: 2,
        children: [
          { id: 211, label: '螺栓', parentId: 21, level: 3, children: [] },
          { id: 212, label: '螺母', parentId: 21, level: 3, children: [] },
          { id: 213, label: '垫圈', parentId: 21, level: 3, children: [] },
        ],
      },
      {
        id: 22,
        label: '传动件',
        parentId: 2,
        level: 2,
        children: [
          { id: 221, label: '齿轮', parentId: 22, level: 3, children: [] },
          { id: 222, label: '轴承', parentId: 22, level: 3, children: [] },
          { id: 223, label: '皮带', parentId: 22, level: 3, children: [] },
        ],
      },
      {
        id: 23,
        label: '结构件',
        parentId: 2,
        level: 2,
        children: [
          { id: 231, label: '支架', parentId: 23, level: 3, children: [] },
          { id: 232, label: '外壳', parentId: 23, level: 3, children: [] },
        ],
      },
    ],
  },
  {
    id: 3,
    label: '金属材料',
    parentId: 0,
    level: 1,
    children: [
      {
        id: 31,
        label: '钢材',
        parentId: 3,
        level: 2,
        children: [
          { id: 311, label: '碳钢', parentId: 31, level: 3, children: [] },
          { id: 312, label: '不锈钢', parentId: 31, level: 3, children: [] },
        ],
      },
      {
        id: 32,
        label: '铝材',
        parentId: 3,
        level: 2,
        children: [
          { id: 321, label: '铝合金板', parentId: 32, level: 3, children: [] },
          { id: 322, label: '铝型材', parentId: 32, level: 3, children: [] },
        ],
      },
      {
        id: 33,
        label: '铜材',
        parentId: 3,
        level: 2,
        children: [
          { id: 331, label: '黄铜', parentId: 33, level: 3, children: [] },
          { id: 332, label: '紫铜', parentId: 33, level: 3, children: [] },
        ],
      },
    ],
  },
  {
    id: 4,
    label: '塑料件',
    parentId: 0,
    level: 1,
    children: [
      { id: 41, label: 'ABS塑料', parentId: 4, level: 2, children: [] },
      { id: 42, label: 'PP塑料', parentId: 4, level: 2, children: [] },
      { id: 43, label: 'PC塑料', parentId: 4, level: 2, children: [] },
    ],
  },
  {
    id: 5,
    label: '成品',
    parentId: 0,
    level: 1,
    children: [
      {
        id: 51,
        label: '电子成品',
        parentId: 5,
        level: 2,
        children: [
          { id: 511, label: '控制板', parentId: 51, level: 3, children: [] },
          { id: 512, label: '电源模块', parentId: 51, level: 3, children: [] },
          { id: 513, label: '传感器组件', parentId: 51, level: 3, children: [] },
        ],
      },
      {
        id: 52,
        label: '机械成品',
        parentId: 5,
        level: 2,
        children: [
          { id: 521, label: '传动装置', parentId: 52, level: 3, children: [] },
          { id: 522, label: '结构件组件', parentId: 52, level: 3, children: [] },
          { id: 523, label: '连接件组件', parentId: 52, level: 3, children: [] },
        ],
      },
      {
        id: 53,
        label: '组装成品',
        parentId: 5,
        level: 2,
        children: [
          { id: 531, label: '汽车零部件', parentId: 53, level: 3, children: [] },
          { id: 532, label: '电子设备', parentId: 53, level: 3, children: [] },
          { id: 533, label: '管道组件', parentId: 53, level: 3, children: [] },
        ],
      },
    ],
  },
])

const defaultProps = {
  children: 'children',
  label: 'label',
}

const canAdd = computed(() => isAdminRole.value)
const canEdit = computed(() => isAdminRole.value)
const canDelete = computed(() => isAdminRole.value)

const isLeaf = (node) => {
  return !node.children || node.children.length === 0
}

const generateId = () => {
  const maxId = (data) => {
    let max = 0
    data.forEach((item) => {
      if (item.id > max) max = item.id
      if (item.children && item.children.length > 0) {
        const childMax = maxId(item.children)
        if (childMax > max) max = childMax
      }
    })
    return max
  }
  return maxId(categoryData.value) + 1
}

const handleAdd = (node, data) => {
  if (!canAdd.value) {
    ElMessage.warning('您没有新增分类的权限')
    return
  }
  dialogType.value = 'add'
  Object.assign(formData, {
    id: null,
    label: '',
    parentId: data.id,
    parentName: data.label,
  })
  dialogVisible.value = true
}

const handleAddRoot = () => {
  if (!canAdd.value) {
    ElMessage.warning('您没有新增分类的权限')
    return
  }
  dialogType.value = 'add'
  Object.assign(formData, {
    id: null,
    label: '',
    parentId: 0,
    parentName: '',
  })
  dialogVisible.value = true
}

const handleEdit = (node, data) => {
  if (!canEdit.value) {
    ElMessage.warning('您没有修改分类的权限')
    return
  }
  dialogType.value = 'edit'
  Object.assign(formData, {
    id: data.id,
    label: data.label,
    parentId: data.parentId,
    parentName: '',
  })
  dialogVisible.value = true
}

const handleDelete = (node, data) => {
  if (!canDelete.value) {
    ElMessage.warning('您没有删除分类的权限')
    return
  }

  if (!isLeaf(data)) {
    ElMessage.warning('该分类下有子分类，不能删除')
    return
  }

  ElMessageBox.confirm(`确定要删除分类"${data.label}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteNode(categoryData.value, data.id, data.parentId)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const deleteNode = (data, id, parentId) => {
  if (parentId === 0) {
    const index = data.findIndex((item) => item.id === id)
    if (index > -1) {
      data.splice(index, 1)
    }
  } else {
    data.forEach((item) => {
      if (item.children && item.children.length > 0) {
        const index = item.children.findIndex((child) => child.id === id)
        if (index > -1) {
          item.children.splice(index, 1)
        } else {
          deleteNode(item.children, id, parentId)
        }
      }
    })
  }
}

const findNodeById = (data, id) => {
  for (const item of data) {
    if (item.id === id) return item
    if (item.children && item.children.length > 0) {
      const found = findNodeById(item.children, id)
      if (found) return found
    }
  }
  return null
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        const newNode = {
          id: generateId(),
          label: formData.label,
          parentId: formData.parentId,
          level: formData.parentId === 0 ? 1 : 0,
          children: [],
        }

        if (formData.parentId === 0) {
          newNode.level = 1
          categoryData.value.push(newNode)
        } else {
          const parentNode = findNodeById(categoryData.value, formData.parentId)
          if (parentNode) {
            newNode.level = parentNode.level + 1
            if (!parentNode.children) {
              parentNode.children = []
            }
            parentNode.children.push(newNode)
          }
        }
        ElMessage.success('新增成功')
      } else {
        const node = findNodeById(categoryData.value, formData.id)
        if (node) {
          node.label = formData.label
        }
        ElMessage.success('修改成功')
      }
      dialogVisible.value = false
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const getLeafCategories = (data, result = []) => {
  data.forEach((item) => {
    if (!item.children || item.children.length === 0) {
      result.push({
        id: item.id,
        label: item.label,
        parentId: item.parentId,
        level: item.level,
      })
    } else {
      getLeafCategories(item.children, result)
    }
  })
  return result
}

const getAllCategoriesFlat = (data, result = []) => {
  data.forEach((item) => {
    result.push({
      id: item.id,
      label: item.label,
      parentId: item.parentId,
      level: item.level,
      isLeaf: !item.children || item.children.length === 0,
    })
    if (item.children && item.children.length > 0) {
      getAllCategoriesFlat(item.children, result)
    }
  })
  return result
}

defineExpose({
  getLeafCategories: () => getLeafCategories(categoryData.value),
  getAllCategoriesFlat: () => getAllCategoriesFlat(categoryData.value),
})
</script>

<template>
  <div class="material-category-container">
    <div class="category-header">
      <h2 class="page-title">物料分类管理</h2>
      <el-button v-if="canAdd" type="primary" :icon="Plus" @click="handleAddRoot"
        >新增顶级分类</el-button
      >
    </div>

    <div class="category-content">
      <el-tree
        ref="treeRef"
        :data="categoryData"
        :props="defaultProps"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        class="category-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <span class="node-label">
              <el-icon v-if="!isLeaf(data)" class="folder-icon">
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="currentColor"
                    d="M880 298.4H521L403.7 186.2a8.15 8.15 0 0 0-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32z"
                  />
                </svg>
              </el-icon>
              <el-icon v-else class="leaf-icon">
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="currentColor"
                    d="M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-600 72h560v208H232V136zm560 480H232V408h560v208zm0 272H232V680h560v208z"
                  />
                </svg>
              </el-icon>
              {{ data.label }}
              <el-tag v-if="isLeaf(data)" type="success" size="small" class="leaf-tag">末级</el-tag>
            </span>
            <span class="node-actions">
              <el-button
                v-if="canAdd"
                type="primary"
                link
                :icon="Plus"
                @click.stop="handleAdd(node, data)"
              >
                新增子级
              </el-button>
              <el-button
                v-if="canEdit"
                type="warning"
                link
                :icon="Edit"
                @click.stop="handleEdit(node, data)"
              >
                编辑
              </el-button>
              <el-button
                v-if="canDelete"
                type="danger"
                link
                :icon="Delete"
                :disabled="!isLeaf(data)"
                @click.stop="handleDelete(node, data)"
              >
                删除
              </el-button>
            </span>
          </div>
        </template>
      </el-tree>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item v-if="dialogType === 'add' && formData.parentName" label="父级分类">
          <el-input v-model="formData.parentName" disabled />
        </el-form-item>
        <el-form-item label="分类名称" prop="label">
          <el-input v-model="formData.label" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.material-category-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 120px);

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .page-title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #303133;
    }
  }

  .category-content {
    .category-tree {
      :deep(.el-tree-node__content) {
        height: auto;
        padding: 8px 0;
      }

      .tree-node {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding-right: 10px;

        .node-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: #303133;

          .folder-icon,
          .leaf-icon {
            width: 18px;
            height: 18px;
            color: #909399;
          }

          .folder-icon {
            color: #e6a23c;
          }

          .leaf-icon {
            color: #67c23a;
          }

          .leaf-tag {
            margin-left: 8px;
          }
        }

        .node-actions {
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s;
        }
      }

      :deep(.el-tree-node__content:hover) {
        .tree-node .node-actions {
          opacity: 1;
        }
      }
    }
  }
}
</style>
