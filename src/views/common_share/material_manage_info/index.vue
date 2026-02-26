<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, View, Download } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'
import { usePermission } from '@/hooks/usePermission'

const { hasPermission, isDesignerRole, isAdminRole } = usePermission()

const canManage = computed(() => isDesignerRole.value || isAdminRole.value)

const router = useRouter()

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

const getLeafCategories = (data, result = []) => {
  data.forEach((item) => {
    if (!item.children || item.children.length === 0) {
      result.push({ id: item.id, label: item.label })
    } else {
      getLeafCategories(item.children, result)
    }
  })
  return result
}

const categoryOptions = getLeafCategories(categoryTreeData)

const locationOptions = [
  { label: '仓库A', value: '仓库A' },
  { label: '仓库B', value: '仓库B' },
  { label: '仓库C', value: '仓库C' },
  { label: '生产线', value: '生产线' },
]

const versionOptions = computed(() => {
  const versions = [...new Set(allMaterials.value.map((m) => m.version))]
  return versions.sort().map((v) => ({ label: v, value: v }))
})

const allMaterials = ref([
  {
    id: 1,
    materialCode: 'MAT20240001',
    materialName: '碳钢板材',
    version: 'V1.0',
    isCurrent: false,
    specModel: 'Q235B-10mm',
    stockQuantity: 500,
    supplier: '北京钢铁集团',
    category: '钢材',
    location: '仓库A',
    baseId: 'MAT001',
  },
  {
    id: 2,
    materialCode: 'MAT20240001',
    materialName: '碳钢板材',
    version: 'V2.0',
    isCurrent: true,
    specModel: 'Q235B-12mm',
    stockQuantity: 300,
    supplier: '北京钢铁集团',
    category: '钢材',
    location: '仓库A',
    baseId: 'MAT001',
  },
  {
    id: 3,
    materialCode: 'MAT20240002',
    materialName: '铝合金板',
    version: 'V1.0',
    isCurrent: true,
    specModel: '6061-T6-5mm',
    stockQuantity: 200,
    supplier: '上海铝业公司',
    category: '铝材',
    location: '仓库B',
    baseId: 'MAT002',
  },
  {
    id: 4,
    materialCode: 'MAT20240003',
    materialName: '黄铜棒材',
    version: 'V1.0',
    isCurrent: false,
    specModel: 'H62-Φ20',
    stockQuantity: 150,
    supplier: '广州铜材厂',
    category: '铜材',
    location: '仓库C',
    baseId: 'MAT003',
  },
  {
    id: 5,
    materialCode: 'MAT20240003',
    materialName: '黄铜棒材',
    version: 'V2.0',
    isCurrent: false,
    specModel: 'H62-Φ25',
    stockQuantity: 100,
    supplier: '广州铜材厂',
    category: '铜材',
    location: '仓库C',
    baseId: 'MAT003',
  },
  {
    id: 6,
    materialCode: 'MAT20240003',
    materialName: '黄铜棒材',
    version: 'V3.0',
    isCurrent: true,
    specModel: 'H62-Φ30',
    stockQuantity: 80,
    supplier: '广州铜材厂',
    category: '铜材',
    location: '仓库C',
    baseId: 'MAT003',
  },
  {
    id: 7,
    materialCode: 'MAT20240004',
    materialName: 'ABS塑料件',
    version: 'V1.0',
    isCurrent: true,
    specModel: 'ABS-标准件',
    stockQuantity: 1000,
    supplier: '深圳塑胶科技',
    category: '塑料件',
    location: '仓库A',
    baseId: 'MAT004',
  },
  {
    id: 8,
    materialCode: 'MAT20240005',
    materialName: '电阻电容',
    version: 'V1.0',
    isCurrent: true,
    specModel: '0402封装',
    stockQuantity: 5000,
    supplier: '东莞电子元件',
    category: '电子元件',
    location: '仓库B',
    baseId: 'MAT005',
  },
  {
    id: 9,
    materialCode: 'MAT20240006',
    materialName: '不锈钢管',
    version: 'V1.0',
    isCurrent: false,
    specModel: '304-Φ50',
    stockQuantity: 200,
    supplier: '北京钢铁集团',
    category: '钢材',
    location: '仓库C',
    baseId: 'MAT006',
  },
  {
    id: 10,
    materialCode: 'MAT20240006',
    materialName: '不锈钢管',
    version: 'V2.0',
    isCurrent: true,
    specModel: '304-Φ60',
    stockQuantity: 150,
    supplier: '北京钢铁集团',
    category: '钢材',
    location: '仓库C',
    baseId: 'MAT006',
  },
])

const getVersionCount = (baseId) => {
  return allMaterials.value.filter((m) => m.baseId === baseId).length
}

const displayData = computed(() => {
  if (showAllVersions.value) {
    return allMaterials.value
  }
  return allMaterials.value.filter((m) => m.isCurrent)
})

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  {
    prop: 'materialCode',
    label: '物料编号',
    minWidth: 140,
    search: { el: 'input', key: 'materialCode' },
  },
  {
    prop: 'materialName',
    label: '物料名称',
    minWidth: 120,
    search: { el: 'input', key: 'materialName' },
  },
  {
    prop: 'version',
    label: '版本号',
    minWidth: 100,
    align: 'center',
    search: { el: 'select', key: 'version' },
    enum: versionOptions,
  },
  {
    prop: 'category',
    label: '分类',
    minWidth: 100,
    search: { el: 'select', key: 'category' },
    enum: categoryOptions,
  },
  { prop: 'location', label: '位置', minWidth: 100 },
  { prop: 'operation', label: '操作', width: 160, fixed: 'right' },
])

const formData = reactive({
  materialCode: '',
  materialName: '',
  specModel: '',
  stockQuantity: 0,
  supplier: '',
  version: 'V1.0',
  category: '',
  location: '',
})

const validateMaterialName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入物料名称'))
    return
  }
  const exists = allMaterials.value.some(
    (item) => item.materialName === value && item.id !== formData.id,
  )
  if (exists) {
    callback(new Error('物料名称已存在，请使用其他名称'))
  } else {
    callback()
  }
}

const validateSpecModel = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入规格型号'))
    return
  }
  const sameMaterial = allMaterials.value.find(
    (item) => item.materialName === formData.materialName && item.id !== formData.id,
  )
  if (sameMaterial && sameMaterial.specModel === value) {
    callback(new Error('相同物料名称下规格型号不能重复'))
  } else {
    callback()
  }
}

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

const rules = {
  materialName: [{ required: true, validator: validateMaterialName, trigger: 'blur' }],
  specModel: [{ required: true, validator: validateSpecModel, trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  location: [{ required: true, message: '请选择位置', trigger: 'change' }],
  stockQuantity: [{ validator: validateStockQuantity, trigger: 'blur' }],
}

const generateMaterialCode = () => {
  const year = new Date().getFullYear()
  const maxBaseId = allMaterials.value.reduce((max, item) => {
    const num = parseInt(item.baseId.replace('MAT', ''))
    return num > max ? num : max
  }, 0)
  const newId = String(maxBaseId + 1).padStart(3, '0')
  return `MAT${year}${newId}`
}

const handleAdd = () => {
  Object.assign(formData, {
    materialCode: generateMaterialCode(),
    materialName: '',
    specModel: '',
    stockQuantity: 0,
    supplier: '',
    version: 'V1.0',
    category: '',
    location: '',
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      const maxId = allMaterials.value.reduce((max, item) => {
        const id = parseInt(item.id)
        return id > max ? id : max
      }, 0)

      const baseId = formData.materialCode.replace(/MAT\d{4}/, 'MAT')

      const newMaterial = {
        id: maxId + 1,
        materialCode: formData.materialCode,
        materialName: formData.materialName,
        version: formData.version,
        isCurrent: true,
        specModel: formData.specModel,
        stockQuantity: formData.stockQuantity,
        supplier: formData.supplier,
        category: formData.category,
        location: formData.location,
        baseId: baseId,
      }

      allMaterials.value.push(newMaterial)
      ElMessage.success('新增成功')
      dialogVisible.value = false
      proTableRef.value?.getTableList()
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleView = (row) => {
  router.push(`/material-manage/material-manage-detail/${row.id}`)
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
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...displayData.value]

      if (params?.materialCode) {
        filteredData = filteredData.filter((item) =>
          item.materialCode.includes(params.materialCode),
        )
      }

      if (params?.materialName) {
        filteredData = filteredData.filter((item) =>
          item.materialName.includes(params.materialName),
        )
      }

      if (params?.version) {
        filteredData = filteredData.filter((item) => item.version.includes(params.version))
      }

      if (params?.category) {
        filteredData = filteredData.filter((item) => item.category === params.category)
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

      <template #materialCode="scope">
        <span>{{ scope.row.materialCode }}</span>
      </template>

      <template #version="scope">
        <div class="version-cell">
          <el-tag size="default" :type="scope.row.isCurrent ? 'success' : 'info'">
            {{ scope.row.version }}
          </el-tag>
          <el-tooltip
            v-if="scope.row.versionCount > 1"
            :content="`该物料包含${scope.row.versionCount}个历史版本，点击详情页可切换查看`"
            placement="top"
          >
            <span class="version-icon">🔄</span>
          </el-tooltip>
        </div>
      </template>

      <template #category="scope">
        <el-tag size="default">{{ scope.row.category }}</el-tag>
      </template>

      <template #location="scope">
        <el-tag type="warning" size="default">{{ scope.row.location }}</el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button type="success" link :icon="Download" @click="handleExportSingle(scope.row)">
          导出
        </el-button>
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
          <span class="dialog-title">新增物料</span>
        </div>
      </template>
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-section">
          <div class="section-title">
            <span class="title-text">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="物料编号">
              <el-input v-model="formData.materialCode" disabled placeholder="系统自动生成" />
            </el-form-item>
            <el-form-item label="物料名称" prop="materialName">
              <el-input v-model="formData.materialName" placeholder="请输入物料名称" />
            </el-form-item>
            <el-form-item label="规格型号" prop="specModel">
              <el-input v-model="formData.specModel" placeholder="请输入规格型号" />
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
              <el-input v-model="formData.version" disabled placeholder="默认V1.0" />
            </el-form-item>
            <el-form-item label="分类" prop="category">
              <el-cascader
                v-model="formData.category"
                :options="categoryTreeData"
                :props="{
                  label: 'label',
                  value: 'label',
                  children: 'children',
                  checkStrictly: false,
                  emitPath: false,
                }"
                placeholder="请选择分类"
                style="width: 100%"
                clearable
                filterable
              />
            </el-form-item>
            <el-form-item label="位置" prop="location">
              <el-select v-model="formData.location" placeholder="请选择位置" style="width: 100%">
                <el-option
                  v-for="item in locationOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
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
