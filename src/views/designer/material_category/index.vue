<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { usePermission } from '@/hooks/usePermission'
import {
  getPartCategoryList,
  addPartCategory,
  updatePartCategory,
  deletePartCategory,
} from '@/api/material'

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
  parentLevel: null,
})

const rules = {
  label: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

const categoryData = ref([])
const flatCategoryList = ref([])
const loading = ref(false)

const fetchCategoryList = async () => {
  loading.value = true
  try {
    const res = await getPartCategoryList()
    console.log('完整响应:', res)

    let dataList = []
    if (res.data && Array.isArray(res.data)) {
      dataList = res.data
    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      dataList = res.data.data
    } else if (
      res.data &&
      res.data.data &&
      res.data.data.data &&
      Array.isArray(res.data.data.data)
    ) {
      dataList = res.data.data.data
    }

    console.log('最终数据列表:', dataList)

    if (dataList.length > 0) {
      flatCategoryList.value = dataList
      categoryData.value = transformToTree(dataList)
      console.log('转换后的树形数据:', categoryData.value)
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const transformToTree = (flatList) => {
  console.log('开始转换数据，原始数据:', flatList)

  const maxList = []
  const midMap = new Map()
  const minMap = new Map()

  flatList.forEach((item) => {
    const id = String(item.categoryId)
    console.log(`处理项: id=${id}, name=${item.categoryName}, level=${item.level}`)

    const node = {
      id: item.categoryId,
      label: item.categoryName,
      level: item.level,
      children: [],
    }

    if (item.level === 'Max') {
      maxList.push(node)
      console.log('添加到 Max 列表')
    } else if (item.level === 'Mid') {
      const parentId = Math.floor(parseInt(id) / 100) * 100
      console.log(`Mid 的父级ID: ${parentId}`)
      if (!midMap.has(String(parentId))) {
        midMap.set(String(parentId), [])
      }
      midMap.get(String(parentId)).push(node)
    } else if (item.level === 'Min') {
      const parentId = id.substring(0, 3)
      console.log(`Min 的父级ID: ${parentId}`)
      if (!minMap.has(parentId)) {
        minMap.set(parentId, [])
      }
      minMap.get(parentId).push(node)
    }
  })

  console.log('Max列表:', maxList)
  console.log('MidMap:', Object.fromEntries(midMap))
  console.log('MinMap:', Object.fromEntries(minMap))

  maxList.forEach((maxNode) => {
    const maxId = String(maxNode.id)
    console.log(`处理 Max 节点: ${maxId}`)
    const midChildren = midMap.get(maxId) || []
    console.log(`找到 ${midChildren.length} 个 Mid 子节点`)
    midChildren.forEach((midNode) => {
      const midId = String(midNode.id)
      const minChildren = minMap.get(midId) || []
      console.log(`Mid ${midId} 找到 ${minChildren.length} 个 Min 子节点`)
      midNode.children = minChildren
    })
    maxNode.children = midChildren
  })

  console.log('最终树形数据:', maxList)
  return maxList
}

onMounted(() => {
  fetchCategoryList()
})

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

const handleAdd = (node, data) => {
  if (!canAdd.value) {
    ElMessage.warning('您没有新增分类的权限')
    return
  }
  if (data.level === 'Min') {
    ElMessage.warning('末级分类不能添加子分类')
    return
  }
  dialogType.value = 'add'
  Object.assign(formData, {
    id: null,
    label: '',
    parentId: data.id,
    parentName: data.label,
    parentLevel: data.level,
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
    parentId: null,
    parentName: '',
    parentLevel: null,
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
    parentId: null,
    parentName: '',
    parentLevel: null,
  })
  dialogVisible.value = true
}

const handleDelete = async (node, data) => {
  if (!canDelete.value) {
    ElMessage.warning('您没有删除分类的权限')
    return
  }

  if (!isLeaf(data)) {
    ElMessage.warning('该分类下有子分类，不能删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除分类"${data.label}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deletePartCategory(data.id)
    ElMessage.success('删除成功')
    await fetchCategoryList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
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

  try {
    await formRef.value.validate()

    const isNameExist = flatCategoryList.value.some(
      (item) => item.categoryName === formData.label && item.categoryId !== formData.id,
    )
    if (isNameExist) {
      ElMessage.warning('分类名称已存在，请使用其他名称')
      return
    }

    if (dialogType.value === 'add') {
      let newId
      let level

      if (!formData.parentId) {
        const maxIds = flatCategoryList.value
          .filter((item) => item.level === 'Max')
          .map((item) => parseInt(item.categoryId))
        const maxId = maxIds.length > 0 ? Math.max(...maxIds) : 0
        newId = maxId + 100
        level = 'Max'
      } else if (formData.parentLevel === 'Max') {
        const parentId = parseInt(formData.parentId)
        const parentNode = findNodeById(categoryData.value, formData.parentId)
        if (parentNode && parentNode.children) {
          const siblingIds = parentNode.children.map((item) => item.id)
          const maxSibling = siblingIds.length > 0 ? Math.max(...siblingIds) : parentId
          newId = maxSibling + 1
        } else {
          newId = parentId + 1
        }
        level = 'Mid'
      } else if (formData.parentLevel === 'Mid') {
        const parentId = parseInt(formData.parentId)
        const parentNode = findNodeById(categoryData.value, formData.parentId)
        if (parentNode && parentNode.children) {
          const siblingIds = parentNode.children.map((item) => item.id)
          const maxSibling = siblingIds.length > 0 ? Math.max(...siblingIds) : parentId * 100
          newId = maxSibling + 1
        } else {
          newId = parentId * 100 + 1
        }
        level = 'Min'
      }

      await addPartCategory({
        id: String(newId),
        categoryId: String(newId),
        categoryName: formData.label,
        level: level,
      })
      ElMessage.success('新增成功')
    } else {
      await updatePartCategory({
        id: formData.id,
        categoryName: formData.label,
      })
      ElMessage.success('修改成功')
    }

    dialogVisible.value = false
    await fetchCategoryList()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
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

    <div class="category-content" v-loading="loading">
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
                    d="M880 298.4H521L403.7 186.2a8.15 8.15 0 0 0-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32z"
                  />
                </svg>
              </el-icon>
              {{ data.label }}
              <el-tag v-if="isLeaf(data)" type="success" size="small" class="leaf-tag">末级</el-tag>
            </span>
            <span class="node-actions">
              <el-button
                v-if="canAdd && data.level !== 'Min'"
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
            color: #e6a23c;
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
