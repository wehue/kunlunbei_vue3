<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Download, Delete, Edit } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'
import { getPartList, getPartCategoryList, addPart, updatePart, deletePart } from '@/api/material'
import { getWarehouseList } from '@/api/warehouse'

const { hasPermission, isDesignerRole, isAdminRole } = usePermission()

const warehouseMap = ref(new Map())
const categoryMap = ref(new Map())

const fetchWarehouseList = async () => {
  try {
    const res = await getWarehouseList()
    console.log('获取仓库列表信息成功', res)
    const list = res.data?.data?.data || res.data?.data || []
    list.forEach((item) => {
      warehouseMap.value.set(item.id || item.warhouseId, item.warhouseName)
    })
  } catch (error) {
    console.error('获取仓库列表失败:', error)
  }
}

const fetchCategoryList = async () => {
  try {
    const res = await getPartCategoryList()
    console.log('获取物分类信息成功', res)
    const list = res.data?.data?.data || res.data?.data || []
    list.forEach((item) => {
      categoryMap.value.set(item.categoryId, item.categoryName)
    })
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

const canManage = computed(() => isDesignerRole.value || isAdminRole.value)

const router = useRouter()

const proTableRef = ref()
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const showAllVersions = ref(false)

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  {
    prop: 'materialId',
    label: '物料编号',
    minWidth: 140,
    search: { el: 'input', key: 'materialId' },
  },
  {
    prop: 'materialName',
    label: '物料名称',
    minWidth: 120,
    search: { el: 'input', key: 'materialName' },
  },
  {
    prop: 'versions',
    label: '版本号',
    minWidth: 100,
    align: 'center',
    search: { el: 'select', key: 'version' },
    enum: computed(() => {
      // 从物料列表中提取所有唯一的版本号
      const versionSet = new Set()
      allMaterialsData.value.forEach((item) => {
        if (item.versions) {
          versionSet.add(item.versions)
        }
      })
      return Array.from(versionSet).map((v) => ({ label: v, value: v }))
    }),
  },
  {
    prop: 'categoryName',
    label: '分类',
    minWidth: 100,
    search: {
      el: 'cascader',
      key: 'category',
      props: {
        checkStrictly: true,
        emitPath: true,
      },
    },
    fieldNames: {
      label: 'label',
      value: 'value',
      children: 'children',
    },
    enum: computed(() => {
      return categoryTreeData.value
    }),
  },
  { prop: 'warhouseName', label: '仓库', minWidth: 100 },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' },
])

const warehouseList = ref([])
const categoryList = ref([])
const categoryTreeData = ref([])
const allMaterialsData = ref([])

const transformToTree = (flatList) => {
  const maxList = []
  const midMap = new Map()
  const minMap = new Map()

  flatList.forEach((item) => {
    const id = String(item.categoryId)
    const node = {
      value: item.categoryId,
      label: item.categoryName,
      level: item.level,
      children: [],
    }

    if (item.level === 'Max') {
      maxList.push(node)
    } else if (item.level === 'Mid') {
      const parentId = Math.floor(parseInt(id) / 100) * 100
      if (!midMap.has(String(parentId))) {
        midMap.set(String(parentId), [])
      }
      midMap.get(String(parentId)).push(node)
    } else if (item.level === 'Min') {
      const parentId = id.substring(0, 3)
      if (!minMap.has(parentId)) {
        minMap.set(parentId, [])
      }
      minMap.get(parentId).push(node)
    }
  })

  maxList.forEach((maxNode) => {
    const maxId = String(maxNode.value)
    const midChildren = midMap.get(maxId) || []
    midChildren.forEach((midNode) => {
      const midId = String(midNode.value)
      const minChildren = minMap.get(midId) || []
      midNode.children = minChildren
    })
    maxNode.children = midChildren
  })

  return maxList
}

const fetchOptions = async () => {
  try {
    const [warehouseRes, categoryRes] = await Promise.all([
      getWarehouseList(),
      getPartCategoryList(),
    ])
    warehouseList.value = warehouseRes.data?.data?.data || warehouseRes.data?.data || []
    categoryList.value = categoryRes.data?.data?.data || categoryRes.data?.data || []
    if (categoryList.value.length > 0) {
      categoryTreeData.value = transformToTree(categoryList.value)
    }
  } catch (error) {
    console.error('获取选项数据失败:', error)
  }
}

onMounted(() => {
  fetchWarehouseList()
  fetchCategoryList()
  fetchOptions()
})

const unitOptions = [
  { label: '个', value: 'A' },
  { label: '米', value: 'M' },
  { label: '克', value: 'G' },
  { label: '千克', value: 'KG' },
]

const formData = reactive({
  id: '',
  materialId: '',
  materialName: '',
  versions: 'V1.0',
  supplier: '',
  specificationModel: '',
  stockQuantity: null,
  unit: 'A',
  warehouse: null,
  category: [],
  selectedCategoryId: null,
})

const validateStockQuantity = (rule, value, callback) => {
  if (value === '' || value === null || value === undefined) {
    callback()
    return
  }
  if (value < 0) {
    callback(new Error('库存数量不能为负数'))
  } else if (value > 9999999) {
    callback(new Error('库存数量超出限制'))
  } else {
    callback()
  }
}

const validateCategory = (rule, value, callback) => {
  if (!formData.selectedCategoryId) {
    callback(new Error('请选择分类'))
    return
  }
  callback()
}

const rules = {
  materialId: [{ required: true, message: '请输入物料编号', trigger: 'blur' }],
  materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  specificationModel: [{ required: true, message: '请输入规格型号', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  category: [{ required: true, validator: validateCategory, trigger: 'change' }],
  warehouse: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  stockQuantity: [{ required: true, validator: validateStockQuantity, trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
}

const handleCategoryChange = (value) => {
  if (value && value.length > 0) {
    formData.selectedCategoryId = value[value.length - 1]
  } else {
    formData.selectedCategoryId = null
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    materialId: '',
    materialName: '',
    versions: 'V1.0',
    supplier: '',
    specificationModel: '',
    stockQuantity: null,
    unit: 'A',
    warehouse: null,
    category: [],
    selectedCategoryId: null,
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  const categoryPath = findCategoryPath(categoryTreeData.value, row.categoryId || row.category?.id)
  Object.assign(formData, {
    id: row.id,
    materialId: row.materialId,
    materialName: row.materialName || row.partName,
    versions: row.versions || 'V1.0',
    supplier: row.supplier,
    specificationModel: row.specificationModel,
    stockQuantity: row.stockQuantity,
    unit: row.unit || 'A',
    warehouse: row.warhouseId || row.warhouse?.id,
    category: categoryPath,
    selectedCategoryId: row.categoryId || row.category?.id,
  })
  dialogVisible.value = true
}

const findCategoryPath = (tree, targetId, path = []) => {
  for (const node of tree) {
    const currentPath = [...path, node.id]
    if (node.id === targetId) {
      return currentPath
    }
    if (node.children && node.children.length > 0) {
      const result = findCategoryPath(node.children, targetId, currentPath)
      if (result) return result
    }
  }
  return null
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = {
          id: formData.id || formData.materialId,
          materialId: formData.materialId,
          materialName: formData.materialName,
          versions: formData.versions,
          supplier: formData.supplier,
          specificationModel: formData.specificationModel,
          stockQuantity: formData.stockQuantity != null ? String(formData.stockQuantity) : '',
          unit: formData.unit,
          warhouse: formData.warehouse,
          category: formData.selectedCategoryId ? { id: formData.selectedCategoryId } : null,
          master: {
            id: formData.id || formData.materialId,
          },
          branch: {
            id: formData.id || formData.materialId,
          },
        }

        if (isEdit.value) {
          await updatePart(submitData)
          ElMessage.success('修改成功')
        } else {
          await addPart(submitData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        proTableRef.value?.getTableList()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(isEdit.value ? '修改失败' : '新增失败')
      }
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleView = (row) => {
  router.push(`/material-manage/material-manage-detail/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该物料吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用删除 API，传递 master.id
    const deleteData = {
      masterId: row.master?.id || row.id,
    }
    await deletePart(deleteData)

    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除物料失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const exportToExcel = (data, fileName = '物料列表') => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const handleExportSingle = (row) => {
  const exportData = [
    {
      物料编号: row.materialCode,
      物料名称: row.materialName,
      版本号: row.version,
      分类: row.category,
      位置: row.location,
    },
  ]
  exportToExcel(exportData, `物料_${row.materialCode}`)
  ElMessage.success('导出成功')
}

const handleExportBatch = (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要导出的物料')
    return
  }
  const exportData = selectedList.map((row) => ({
    物料编号: row.materialCode,
    物料名称: row.materialName,
    版本号: row.version,
    分类: row.category,
    位置: row.location,
  }))
  exportToExcel(exportData, `物料列表_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const getTableList = async (params) => {
  try {
    console.log('搜索参数:', params)
    // 构建查询参数
    const queryParams = {
      materialId: params?.materialId,
      materialName: params?.materialName,
      versions: params?.version,
      categoryId: Array.isArray(params?.category)
        ? params.category[params.category.length - 1]
        : params?.category,
    }
    console.log('传递给API的参数:', queryParams)

    const res = await getPartList(queryParams)
    console.log('获取物料信息列表成功', res)

    const rawList = res.data?.data?.data || res.data?.data || []

    const transformedList = rawList.map((item) => ({
      id: item.id || item.partId,
      materialId: item.materialId || item.id,
      materialName: item.partName || item.materialName,
      versions: item.versions || item.version,
      specificationModel: item.specificationModel || item.specModel || '',
      warhouseId: item.warhouse?.id || item.warhouseId || item.warhouse,
      warhouseName:
        warehouseMap.value.get(item.warhouse?.id || item.warhouseId || item.warhouse) ||
        item.warhouse?.warhouseName ||
        '',
      categoryId: item.category?.categoryId || item.categoryId || item.category,
      categoryName:
        categoryMap.value.get(item.category?.categoryId || item.categoryId || item.category) ||
        item.category?.categoryName ||
        '',
      master: item.master,
    }))

    // 保存所有物料数据用于提取版本号
    allMaterialsData.value = transformedList

    let filteredData = [...transformedList]

    const pageNum = params?.pageNum || 1
    const pageSize = params?.pageSize || 10
    const startIndex = (pageNum - 1) * pageSize
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

    const dataWithIndex = paginatedData.map((item, index) => ({
      ...item,
      index: startIndex + index + 1,
    }))

    return {
      data: {
        list: dataWithIndex,
        total: filteredData.length,
      },
    }
  } catch (error) {
    console.error('获取物料列表失败:', error)
    return {
      data: {
        list: [],
        total: 0,
      },
    }
  }
}
</script>

<template>
  <div class="material-manage-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader="scope">
        <div class="header-controls">
          <div class="header-left">
            <el-button v-if="canManage" type="primary" :icon="Plus" @click="handleAdd">
              新增物料
            </el-button>
            <el-button
              type="success"
              :icon="Download"
              :disabled="!scope.isSelected"
              @click="handleExportBatch(scope.selectedList)"
            >
              批量导出
            </el-button>
          </div>
          <div class="header-right">
            <el-switch
              v-model="showAllVersions"
              active-text="显示所有版本"
              inactive-text="仅显示当前版本"
              @change="proTableRef?.getTableList()"
            />
          </div>
        </div>
      </template>

      <template #materialId="scope">
        <span>{{ scope.row.materialId }}</span>
      </template>

      <template #versions="scope">
        <div class="version-cell">
          <el-tag size="default">
            {{ scope.row.versions }}
          </el-tag>
        </div>
      </template>

      <template #categoryName="scope">
        <el-tag size="default">{{ scope.row.categoryName }}</el-tag>
      </template>

      <template #warhouseName="scope">
        <el-tag type="warning" size="default">{{ scope.row.warhouseName }}</el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button v-if="canManage" type="warning" link :icon="Edit" @click="handleEdit(scope.row)"
          >编辑</el-button
        >
        <el-button
          v-if="isAdminRole"
          type="danger"
          link
          :icon="Delete"
          @click="handleDelete(scope.row)"
          >删除</el-button
        >
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
      class="material-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-title">{{ isEdit ? '编辑物料' : '新增物料' }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-section">
          <div class="section-title">
            <span class="title-text">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="物料编号" prop="materialId">
              <el-input v-model="formData.materialId" placeholder="请输入物料编号" />
            </el-form-item>
            <el-form-item label="物料名称" prop="materialName">
              <el-input v-model="formData.materialName" placeholder="请输入物料名称" />
            </el-form-item>
            <el-form-item label="规格型号" prop="specificationModel">
              <el-input v-model="formData.specificationModel" placeholder="请输入规格型号" />
            </el-form-item>
            <el-form-item label="库存数量" prop="stockQuantity">
              <el-input-number
                v-model="formData.stockQuantity"
                :min="0"
                placeholder="请输入库存数量"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="formData.supplier" placeholder="请输入供应商名称" />
            </el-form-item>
            <el-form-item label="版本号">
              <el-input v-model="formData.versions" disabled placeholder="默认V1.0" />
            </el-form-item>
            <el-form-item label="单位" prop="unit">
              <el-select v-model="formData.unit" placeholder="请选择单位" style="width: 100%">
                <el-option
                  v-for="item in unitOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="仓库" prop="warehouse">
              <el-select
                v-model="formData.warehouse"
                placeholder="请选择仓库"
                style="width: 100%"
                value-key="id"
              >
                <el-option
                  v-for="item in warehouseList"
                  :key="item.id"
                  :label="item.warhouseName"
                  :value="{ id: item.id }"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="分类" prop="category">
              <el-cascader
                v-model="formData.category"
                :options="categoryTreeData"
                :props="{
                  checkStrictly: true,
                  emitPath: true,
                }"
                placeholder="请选择分类"
                style="width: 100%"
                clearable
                @change="handleCategoryChange"
              />
            </el-form-item>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.material-manage-container {
  :deep(.table-search) {
    margin-bottom: 10px !important;
  }

  :deep(.table-header) {
    .header-button-lf {
      width: 100%;
    }
  }

  .header-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-right {
      display: flex;
      align-items: center;
    }
  }

  .version-cell {
    // display: flex;
    // align-items: center;
    // gap: 8px;

    .version-icon {
      cursor: pointer;
      font-size: 14px;
    }
  }
}

.material-dialog {
  :deep(.el-dialog__header) {
    padding: 14px 21px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;
  }

  .dialog-header {
    .dialog-title {
      font-size: 22px;
      font-weight: bold;
      color: #303133;
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 20px;
    border-top: 1px solid #ebeef5;
  }

  .form-section {
    padding: 16px 20px;

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .title-text {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        position: relative;
        padding-left: 10px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 14px;
          background: #409eff;
          border-radius: 2px;
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px 20px;

      :deep(.el-form-item) {
        margin-bottom: 0;

        .el-form-item__label {
          font-size: 15px;
          color: #303133;
          font-weight: 500;
          padding-bottom: 6px;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
      font-size: 15px;
      padding: 10px 20px;
    }
  }
}

@media screen and (max-width: 900px) {
  .material-dialog {
    .form-section {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
