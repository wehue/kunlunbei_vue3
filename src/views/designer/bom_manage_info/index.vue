<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, View, Download, Delete, Edit } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'

const router = useRouter()
const { isAdminRole, isDesignerRole } = usePermission()

const proTableRef = ref()
const dialogVisible = ref(false)
const formRef = ref()
const showAllVersions = ref(false)

const categoryTreeData = [
  {
    id: 1,
    label: '电子元器件',
    children: [
      {
        id: 11,
        label: '无源分立元件',
        children: [
          {
            id: 111,
            label: '磁性元件',
            children: [
              { id: 1111, label: '贴片电感' },
              { id: 1112, label: '功率磁环' },
              { id: 1113, label: '互感器磁芯' },
            ],
          },
          { id: 112, label: '电阻' },
          { id: 113, label: '电容' },
          { id: 114, label: '电感' },
        ],
      },
      {
        id: 12,
        label: '有源器件',
        children: [
          { id: 121, label: '二极管' },
          { id: 122, label: '三极管' },
          { id: 123, label: '集成电路' },
        ],
      },
      {
        id: 13,
        label: '连接器件',
        children: [
          { id: 131, label: '接插件' },
          { id: 132, label: '线缆' },
        ],
      },
    ],
  },
  {
    id: 2,
    label: '机械零件',
    children: [
      {
        id: 21,
        label: '紧固件',
        children: [
          { id: 211, label: '螺栓' },
          { id: 212, label: '螺母' },
          { id: 213, label: '垫圈' },
        ],
      },
      {
        id: 22,
        label: '传动件',
        children: [
          { id: 221, label: '齿轮' },
          { id: 222, label: '轴承' },
          { id: 223, label: '皮带' },
        ],
      },
      {
        id: 23,
        label: '结构件',
        children: [
          { id: 231, label: '支架' },
          { id: 232, label: '外壳' },
        ],
      },
    ],
  },
  {
    id: 3,
    label: '金属材料',
    children: [
      {
        id: 31,
        label: '钢材',
        children: [
          { id: 311, label: '碳钢' },
          { id: 312, label: '不锈钢' },
        ],
      },
      {
        id: 32,
        label: '铝材',
        children: [
          { id: 321, label: '铝合金板' },
          { id: 322, label: '铝型材' },
        ],
      },
      {
        id: 33,
        label: '铜材',
        children: [
          { id: 331, label: '黄铜' },
          { id: 332, label: '紫铜' },
        ],
      },
    ],
  },
  {
    id: 4,
    label: '塑料件',
    children: [
      { id: 41, label: 'ABS塑料' },
      { id: 42, label: 'PP塑料' },
      { id: 43, label: 'PC塑料' },
    ],
  },
  {
    id: 5,
    label: '成品',
    children: [
      {
        id: 51,
        label: '电子成品',
        children: [
          { id: 511, label: '控制板' },
          { id: 512, label: '电源模块' },
          { id: 513, label: '传感器组件' },
        ],
      },
      {
        id: 52,
        label: '机械成品',
        children: [
          { id: 521, label: '传动装置' },
          { id: 522, label: '结构件组件' },
          { id: 523, label: '连接件组件' },
        ],
      },
      {
        id: 53,
        label: '组装成品',
        children: [
          { id: 531, label: '汽车零部件' },
          { id: 532, label: '电子设备' },
          { id: 533, label: '管道组件' },
        ],
      },
    ],
  },
]

const productCategoryTree = [
  {
    id: 5,
    label: '成品',
    children: [
      {
        id: 51,
        label: '电子成品',
        children: [
          { id: 511, label: '控制板' },
          { id: 512, label: '电源模块' },
          { id: 513, label: '传感器组件' },
        ],
      },
      {
        id: 52,
        label: '机械成品',
        children: [
          { id: 521, label: '传动装置' },
          { id: 522, label: '结构件组件' },
          { id: 523, label: '连接件组件' },
        ],
      },
      {
        id: 53,
        label: '组装成品',
        children: [
          { id: 531, label: '汽车零部件' },
          { id: 532, label: '电子设备' },
          { id: 533, label: '管道组件' },
        ],
      },
    ],
  },
]

const processOptions = []

const materialList = [
  {
    id: 1,
    materialCode: 'MAT20240001',
    materialName: '碳钢',
    specModel: 'Q235B-12mm',
    category: '金属材料',
    unit: '件',
    stock: 100,
  },
  {
    id: 2,
    materialCode: 'MAT20240002',
    materialName: '铝合金板',
    specModel: '6061-T6-5mm',
    category: '金属材料',
    unit: '件',
    stock: 50,
  },
  {
    id: 3,
    materialCode: 'MAT20240003',
    materialName: '黄铜',
    specModel: 'H62-Φ30',
    category: '金属材料',
    unit: '根',
    stock: 80,
  },
  {
    id: 4,
    materialCode: 'MAT20240004',
    materialName: 'ABS塑料',
    specModel: 'ABS-标准件',
    category: '塑料件',
    unit: '个',
    stock: 200,
  },
  {
    id: 5,
    materialCode: 'MAT20240005',
    materialName: '集成电路',
    specModel: 'IC-0402',
    category: '电子元器件',
    unit: '片',
    stock: 500,
  },
  {
    id: 6,
    materialCode: 'MAT20240006',
    materialName: '不锈钢',
    specModel: '304-Φ60',
    category: '金属材料',
    unit: '件',
    stock: 60,
  },
  {
    id: 7,
    materialCode: 'MAT20240007',
    materialName: '贴片电感',
    specModel: '100uH',
    category: '电子元器件',
    unit: '个',
    stock: 1000,
  },
  {
    id: 8,
    materialCode: 'MAT20240008',
    materialName: '螺栓',
    specModel: 'M8×20',
    category: '机械零件',
    unit: '个',
    stock: 2000,
  },
  {
    id: 9,
    materialCode: 'MAT20240009',
    materialName: '轴承',
    specModel: '6205',
    category: '机械零件',
    unit: '个',
    stock: 150,
  },
  {
    id: 10,
    materialCode: 'MAT20240010',
    materialName: '密封圈',
    specModel: 'Φ25',
    category: '机械零件',
    unit: '个',
    stock: 300,
  },
]

const allBomData = ref([
  {
    id: 1,
    bomCode: 'BOM20240001',
    bomName: '汽车零部件BOM',
    version: 'V1.0',
    isCurrent: false,
    parentMaterial: '汽车零部件',
    parentMaterialCode: 'MAT20240501',
    parentMaterialSpec: '成品-汽车零部件',
    childMaterials: [
      {
        id: 1,
        materialCode: 'MAT20240002',
        materialName: '铝合金板',
        specModel: '6061-T6-5mm',
        quantity: 5,
        unit: '件',
      },
      {
        id: 2,
        materialCode: 'MAT20240003',
        materialName: '黄铜',
        specModel: 'H62-Φ30',
        quantity: 10,
        unit: '根',
      },
    ],
    baseId: 'BOM001',
  },
  {
    id: 2,
    bomCode: 'BOM20240001',
    bomName: '汽车零部件BOM',
    version: 'V2.0',
    isCurrent: true,
    parentMaterial: '汽车零部件',
    parentMaterialCode: 'MAT20240501',
    parentMaterialSpec: '成品-汽车零部件',
    childMaterials: [
      {
        id: 1,
        materialCode: 'MAT20240002',
        materialName: '铝合金板',
        specModel: '6061-T6-5mm',
        quantity: 6,
        unit: '件',
      },
      {
        id: 2,
        materialCode: 'MAT20240003',
        materialName: '黄铜',
        specModel: 'H62-Φ30',
        quantity: 12,
        unit: '根',
      },
      {
        id: 3,
        materialCode: 'MAT20240004',
        materialName: 'ABS塑料',
        specModel: 'ABS-标准件',
        quantity: 20,
        unit: '个',
      },
    ],
    baseId: 'BOM001',
  },
  {
    id: 3,
    bomCode: 'BOM20240002',
    bomName: '电子设备BOM',
    version: 'V1.0',
    isCurrent: true,
    parentMaterial: '电子设备',
    parentMaterialCode: 'MAT20240502',
    parentMaterialSpec: '成品-电子设备',
    childMaterials: [
      {
        id: 1,
        materialCode: 'MAT20240004',
        materialName: 'ABS塑料',
        specModel: 'ABS-标准件',
        quantity: 2,
        unit: '个',
      },
      {
        id: 2,
        materialCode: 'MAT20240005',
        materialName: '集成电路',
        specModel: 'IC-0402',
        quantity: 100,
        unit: '片',
      },
    ],
    baseId: 'BOM002',
  },
  {
    id: 4,
    bomCode: 'BOM20240003',
    bomName: '管道组件BOM',
    version: 'V1.0',
    isCurrent: false,
    parentMaterial: '管道组件',
    parentMaterialCode: 'MAT20240503',
    parentMaterialSpec: '成品-管道组件',
    childMaterials: [
      {
        id: 1,
        materialCode: 'MAT20240001',
        materialName: '碳钢',
        specModel: 'Q235B-12mm',
        quantity: 3,
        unit: '件',
      },
    ],
    baseId: 'BOM003',
  },
  {
    id: 5,
    bomCode: 'BOM20240003',
    bomName: '管道组件BOM',
    version: 'V2.0',
    isCurrent: true,
    parentMaterial: '管道组件',
    parentMaterialCode: 'MAT20240503',
    parentMaterialSpec: '成品-管道组件',
    childMaterials: [
      {
        id: 1,
        materialCode: 'MAT20240001',
        materialName: '碳钢',
        specModel: 'Q235B-12mm',
        quantity: 4,
        unit: '件',
      },
      {
        id: 2,
        materialCode: 'MAT20240003',
        materialName: '黄铜',
        specModel: 'H62-Φ30',
        quantity: 8,
        unit: '根',
      },
    ],
    baseId: 'BOM003',
  },
  {
    id: 6,
    bomCode: 'BOM20240004',
    bomName: '机械零件BOM',
    version: 'V1.0',
    isCurrent: true,
    parentMaterial: '传动装置',
    parentMaterialCode: 'MAT20240504',
    parentMaterialSpec: '成品-传动装置',
    childMaterials: [
      {
        id: 1,
        materialCode: 'MAT20240003',
        materialName: '黄铜',
        specModel: 'H62-Φ30',
        quantity: 15,
        unit: '根',
      },
      {
        id: 2,
        materialCode: 'MAT20240006',
        materialName: '不锈钢',
        specModel: '304-Φ60',
        quantity: 5,
        unit: '件',
      },
    ],
    baseId: 'BOM004',
  },
])

const getVersionCount = (baseId) => {
  return allBomData.value.filter((b) => b.baseId === baseId).length
}

const displayData = computed(() => {
  if (showAllVersions.value) {
    return allBomData.value
  }
  return allBomData.value.filter((b) => b.isCurrent)
})

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'bomCode', label: '清单编码', minWidth: 140, search: { el: 'input', key: 'bomCode' } },
  {
    prop: 'bomName',
    label: '物料清单名称',
    minWidth: 160,
    search: { el: 'input', key: 'bomName' },
  },
  {
    prop: 'version',
    label: '版本号',
    minWidth: 120,
    align: 'center',
    search: { el: 'input', key: 'version' },
  },
  { prop: 'operation', label: '操作', width: 160, fixed: 'right' },
])

const formData = reactive({
  bomCode: '',
  bomName: '',
  version: 'V1.0',
  parentMaterial: '',
  parentMaterialCode: '',
  parentMaterialSpec: '',
  childMaterials: [],
})

const isEdit = ref(false)
const editId = ref(null)

const rules = {
  bomName: [{ required: true, message: '请输入物料清单名称', trigger: 'blur' }],
  parentMaterial: [{ required: true, message: '请选择父物料', trigger: 'change' }],
}

const generateBomCode = () => {
  const year = new Date().getFullYear()
  const maxBaseId = allBomData.value.reduce((max, item) => {
    const num = parseInt(item.baseId.replace('BOM', ''))
    return num > max ? num : max
  }, 0)
  const newId = String(maxBaseId + 1).padStart(3, '0')
  return `BOM${year}${newId}`
}

const handleAddChildMaterial = () => {
  formData.childMaterials.push({
    id: Date.now(),
    materialId: null,
    materialCode: '',
    materialName: '',
    specModel: '',
    category: '',
    unit: '件',
    quantity: 1,
  })
}

const handleMaterialSelect = (materialId, index) => {
  const material = materialList.find((m) => m.id === materialId)
  if (material) {
    formData.childMaterials[index].materialCode = material.materialCode
    formData.childMaterials[index].materialName = material.materialName
    formData.childMaterials[index].specModel = material.specModel
    formData.childMaterials[index].category = material.category
    formData.childMaterials[index].unit = material.unit
  }
}

const handleRemoveChildMaterial = (index) => {
  formData.childMaterials.splice(index, 1)
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(formData, {
    bomCode: generateBomCode(),
    bomName: '',
    version: 'V1.0',
    parentMaterial: '',
    parentMaterialCode: '',
    parentMaterialSpec: '',
    childMaterials: [],
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(formData, {
    bomCode: row.bomCode,
    bomName: row.bomName,
    version: row.version,
    parentMaterial: row.parentMaterial,
    parentMaterialCode: row.parentMaterialCode,
    parentMaterialSpec: row.parentMaterialSpec,
    childMaterials: JSON.parse(JSON.stringify(row.childMaterials || [])),
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (formData.childMaterials.length === 0) {
        ElMessage.warning('请至少添加一个子物料')
        return
      }

      const hasEmptyChild = formData.childMaterials.some((c) => !c.materialName)
      if (hasEmptyChild) {
        ElMessage.warning('请完善子物料信息')
        return
      }

      if (isEdit.value) {
        const index = allBomData.value.findIndex((item) => item.id === editId.value)
        if (index > -1) {
          allBomData.value[index] = {
            ...allBomData.value[index],
            bomName: formData.bomName,
            parentMaterial: formData.parentMaterial,
            parentMaterialCode: formData.parentMaterialCode || `MAT${Date.now()}`,
            parentMaterialSpec: formData.parentMaterialSpec || `成品-${formData.parentMaterial}`,
            childMaterials: JSON.parse(JSON.stringify(formData.childMaterials)),
          }
        }
        ElMessage.success('修改成功')
      } else {
        const maxId = allBomData.value.reduce((max, item) => {
          const id = parseInt(item.id)
          return id > max ? id : max
        }, 0)

        const baseId = formData.bomCode.replace(/BOM\d{4}/, 'BOM')

        const newBom = {
          id: maxId + 1,
          bomCode: formData.bomCode,
          bomName: formData.bomName,
          version: formData.version,
          isCurrent: true,
          parentMaterial: formData.parentMaterial,
          parentMaterialCode: formData.parentMaterialCode || `MAT${Date.now()}`,
          parentMaterialSpec: formData.parentMaterialSpec || `成品-${formData.parentMaterial}`,
          childMaterials: JSON.parse(JSON.stringify(formData.childMaterials)),
          baseId: baseId,
        }

        allBomData.value.push(newBom)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      proTableRef.value?.getTableList()
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleView = (row) => {
  router.push(`/material-manage/bom-manage-detail/${row.id}`)
}

const exportToExcel = (data, fileName = 'BOM列表') => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const handleExportSingle = (row) => {
  const childMaterialStr =
    row.childMaterials?.map((c) => `${c.materialName}(${c.quantity})`).join('、') || '无'
  const exportData = [
    {
      清单编码: row.bomCode,
      物料清单名称: row.bomName,
      版本号: row.version,
      父物料: row.parentMaterial || '无',
      子物料: childMaterialStr,
    },
  ]
  exportToExcel(exportData, `BOM_${row.bomCode}`)
  ElMessage.success('导出成功')
}

const handleExportBatch = (selectedList) => {
  if (!selectedList || selectedList.length === 0) {
    ElMessage.warning('请先选择要导出的BOM')
    return
  }
  const exportData = selectedList.map((row) => ({
    清单编码: row.bomCode,
    物料清单名称: row.bomName,
    版本号: row.version,
    父物料: row.parentMaterial || '无',
    子物料数量: row.childMaterials?.length || 0,
  }))
  exportToExcel(exportData, `BOM列表_${new Date().toLocaleDateString()}`)
  ElMessage.success(`成功导出 ${selectedList.length} 条数据`)
}

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...displayData.value]

      if (params?.bomCode) {
        filteredData = filteredData.filter((item) => item.bomCode.includes(params.bomCode))
      }

      if (params?.bomName) {
        filteredData = filteredData.filter((item) => item.bomName.includes(params.bomName))
      }

      if (params?.version) {
        filteredData = filteredData.filter((item) => item.version.includes(params.version))
      }

      const pageNum = params?.pageNum || 1
      const pageSize = params?.pageSize || 10
      const startIndex = (pageNum - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)

      const dataWithIndex = paginatedData.map((item, index) => ({
        ...item,
        index: startIndex + index + 1,
        versionCount: getVersionCount(item.baseId),
      }))

      resolve({
        data: {
          list: dataWithIndex,
          total: filteredData.length,
        },
      })
    }, 300)
  })
}
</script>

<template>
  <div class="bom-manage-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader="scope">
        <div class="header-controls">
          <div class="header-left">
            <el-button v-if="isDesignerRole" type="primary" :icon="Plus" @click="handleAdd"
              >新建BOM</el-button
            >
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

      <template #bomCode="scope">
        <span>{{ scope.row.bomCode }}</span>
      </template>

      <template #version="scope">
        <div class="version-cell">
          <el-tag size="default" :type="scope.row.isCurrent ? 'success' : 'info'">
            {{ scope.row.version }}
          </el-tag>
          <el-tooltip
            v-if="scope.row.versionCount > 1"
            :content="`该BOM包含${scope.row.versionCount}个历史版本，点击详情页可切换查看`"
            placement="top"
          >
            <span class="version-icon">🔄</span>
          </el-tooltip>
        </div>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button
          v-if="isDesignerRole"
          type="warning"
          link
          :icon="Edit"
          @click="handleEdit(scope.row)"
          >修改</el-button
        >
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="bom-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-title">新建BOM</span>
        </div>
      </template>
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-section">
          <div class="section-title">
            <span class="title-text">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="清单编码">
              <el-input v-model="formData.bomCode" disabled placeholder="系统自动生成" />
            </el-form-item>
            <el-form-item label="物料清单名称" prop="bomName">
              <el-input v-model="formData.bomName" placeholder="请输入物料清单名称" />
            </el-form-item>
            <el-form-item label="版本号">
              <el-input v-model="formData.version" disabled placeholder="默认V1.0" />
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="title-text">父物料（成品分类）</span>
          </div>
          <div class="form-grid">
            <el-form-item label="选择父物料" prop="parentMaterial">
              <el-cascader
                v-model="formData.parentMaterial"
                :options="productCategoryTree"
                :props="{
                  label: 'label',
                  value: 'label',
                  children: 'children',
                  checkStrictly: false,
                  emitPath: false,
                }"
                placeholder="请选择父物料（成品）"
                style="width: 100%"
                clearable
                filterable
              />
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="title-text">子物料</span>
            <el-button type="primary" link :icon="Plus" @click="handleAddChildMaterial">
              添加子物料
            </el-button>
          </div>
          <div class="child-materials-list">
            <div
              v-for="(child, index) in formData.childMaterials"
              :key="child.id"
              class="child-item"
            >
              <div class="child-header">
                <span class="child-index">子物料 {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  link
                  :icon="Delete"
                  @click="handleRemoveChildMaterial(index)"
                >
                  删除
                </el-button>
              </div>
              <div class="child-form">
                <el-select
                  v-model="child.materialId"
                  placeholder="选择物料"
                  style="width: 200px"
                  filterable
                  @change="handleMaterialSelect(child.materialId, index)"
                >
                  <el-option
                    v-for="item in materialList"
                    :key="item.id"
                    :label="`${item.materialName} (${item.materialCode})`"
                    :value="item.id"
                  >
                    <div class="material-option">
                      <span class="material-name">{{ item.materialName }}</span>
                      <span class="material-code">{{ item.materialCode }}</span>
                      <span class="material-spec">{{ item.specModel }}</span>
                    </div>
                  </el-option>
                </el-select>
                <el-input
                  v-model="child.specModel"
                  disabled
                  placeholder="规格型号"
                  style="width: 150px"
                />
                <el-input v-model="child.unit" disabled placeholder="单位" style="width: 80px" />
                <el-input-number
                  v-model="child.quantity"
                  :min="1"
                  placeholder="数量"
                  style="width: 120px"
                />
              </div>
            </div>
            <div v-if="formData.childMaterials.length === 0" class="empty-tip">
              暂无子物料，点击上方按钮添加
            </div>
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
.bom-manage-container {
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
    gap: 8px;

    .version-icon {
      cursor: pointer;
      font-size: 14px;
    }
  }
}

.bom-dialog {
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
    max-height: 65vh;
    overflow-y: auto;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 20px;
    border-top: 1px solid #ebeef5;
  }

  .form-section {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;

    &:last-of-type {
      border-bottom: none;
    }

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

    .child-materials-list {
      .child-item {
        padding: 12px;
        background: #fafafa;
        border-radius: 4px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .child-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .child-index {
            font-size: 14px;
            font-weight: 500;
            color: #606266;
          }
        }

        .child-form {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;

          .material-option {
            display: flex;
            align-items: center;
            gap: 12px;

            .material-name {
              font-weight: 500;
              color: #303133;
            }

            .material-code {
              font-size: 12px;
              color: #909399;
            }

            .material-spec {
              font-size: 12px;
              color: #67c23a;
            }
          }
        }
      }

      .empty-tip {
        text-align: center;
        color: #909399;
        padding: 20px;
        background: #fafafa;
        border-radius: 4px;
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
  .bom-dialog {
    .form-section {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
