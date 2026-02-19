<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, View, Download, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import * as XLSX from 'xlsx'

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

const processOptions = [
  { value: '车削加工', label: '车削加工' },
  { value: '铣削加工', label: '铣削加工' },
  { value: '钻孔工序', label: '钻孔工序' },
  { value: '磨削精加工', label: '磨削精加工' },
  { value: '质量检测', label: '质量检测' },
  { value: '热处理', label: '热处理' },
  { value: '表面处理', label: '表面处理' },
  { value: '组装工序', label: '组装工序' },
]

const allBomData = ref([
  {
    id: 1,
    bomCode: 'BOM20240001',
    bomName: '汽车零部件BOM',
    version: 'V1.0',
    isCurrent: false,
    parentMaterial: '汽车零部件',
    childMaterials: [
      { id: 1, materialName: '铝合金板', quantity: 5, process: '车削加工' },
      { id: 2, materialName: '黄铜', quantity: 10, process: '铣削加工' },
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
    childMaterials: [
      { id: 1, materialName: '铝合金板', quantity: 6, process: '车削加工' },
      { id: 2, materialName: '黄铜', quantity: 12, process: '铣削加工' },
      { id: 3, materialName: 'ABS塑料', quantity: 20, process: '组装工序' },
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
    childMaterials: [
      { id: 1, materialName: 'ABS塑料', quantity: 2, process: '组装工序' },
      { id: 2, materialName: '集成电路', quantity: 100, process: '质量检测' },
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
    childMaterials: [{ id: 1, materialName: '碳钢', quantity: 3, process: '焊接' }],
    baseId: 'BOM003',
  },
  {
    id: 5,
    bomCode: 'BOM20240003',
    bomName: '管道组件BOM',
    version: 'V2.0',
    isCurrent: true,
    parentMaterial: '管道组件',
    childMaterials: [
      { id: 1, materialName: '碳钢', quantity: 4, process: '焊接' },
      { id: 2, materialName: '黄铜', quantity: 8, process: '车削加工' },
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
    childMaterials: [
      { id: 1, materialName: '黄铜', quantity: 15, process: '车削加工' },
      { id: 2, materialName: '不锈钢', quantity: 5, process: '磨削精加工' },
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
  childMaterials: [],
})

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
    materialName: '',
    quantity: 1,
    process: '',
  })
}

const handleRemoveChildMaterial = (index) => {
  formData.childMaterials.splice(index, 1)
}

const handleAdd = () => {
  Object.assign(formData, {
    bomCode: generateBomCode(),
    bomName: '',
    version: 'V1.0',
    parentMaterial: '',
    childMaterials: [],
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

      const hasEmptyChild = formData.childMaterials.some((c) => !c.materialName || !c.process)
      if (hasEmptyChild) {
        ElMessage.warning('请完善子物料信息')
        return
      }

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
        childMaterials: [...formData.childMaterials],
        baseId: baseId,
      }

      allBomData.value.push(newBom)
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
            <el-button type="primary" :icon="Plus" @click="handleAdd">新建BOM</el-button>
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
        <el-button type="success" link :icon="Download" @click="handleExportSingle(scope.row)"
          >导出</el-button
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
                <el-cascader
                  v-model="child.materialName"
                  :options="categoryTreeData"
                  :props="{
                    label: 'label',
                    value: 'label',
                    children: 'children',
                    checkStrictly: false,
                    emitPath: false,
                  }"
                  placeholder="选择物料"
                  style="width: 200px"
                  clearable
                  filterable
                />
                <el-input-number
                  v-model="child.quantity"
                  :min="1"
                  placeholder="数量"
                  style="width: 120px"
                />
                <el-select v-model="child.process" placeholder="选择工序" style="width: 150px">
                  <el-option
                    v-for="item in processOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
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
          gap: 12px;
          align-items: center;
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
