<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'

const router = useRouter()

const proTableRef = ref()
const dialogVisible = ref(false)
const formRef = ref()
const isEdit = ref(false)

const warehouseTypeOptions = ref([
  { label: '物料仓库', value: '物料仓库' },
  { label: '设备仓库', value: '设备仓库' },
])

const deptOptions = ref([
  { label: '技术部', value: '技术部' },
  { label: '生产部', value: '生产部' },
  { label: '质量部', value: '质量部' },
  { label: '采购部', value: '采购部' },
  { label: '销售部', value: '销售部' },
  { label: '财务部', value: '财务部' },
  { label: '人力资源部', value: '人力资源部' },
])

const mockData = ref([
  {
    id: 1,
    warehouseCode: 'WH20240001',
    warehouseName: '物料仓库A',
    warehouseType: '物料仓库',
    manager: '张三',
    phone: '13800138001',
    deptName: '采购部',
    address: '厂区东侧A栋',
    remark: '存放原材料',
    establishDate: '2020-01-15',
  },
  {
    id: 2,
    warehouseCode: 'WH20240002',
    warehouseName: '设备仓库A',
    warehouseType: '设备仓库',
    manager: '李四',
    phone: '13800138002',
    deptName: '生产部',
    address: '厂区西侧B栋',
    remark: '存放设备',
    establishDate: '2020-02-20',
  },
  {
    id: 3,
    warehouseCode: 'WH20240003',
    warehouseName: '物料仓库B',
    warehouseType: '物料仓库',
    manager: '王五',
    phone: '13800138003',
    deptName: '生产部',
    address: '车间内部C区',
    remark: '存放半成品物料',
    establishDate: '2020-03-10',
  },
  {
    id: 4,
    warehouseCode: 'WH20240004',
    warehouseName: '设备仓库B',
    warehouseType: '设备仓库',
    manager: '赵六',
    phone: '13800138004',
    deptName: '技术部',
    address: '厂区北侧D栋',
    remark: '存放设备备件',
    establishDate: '2020-04-05',
  },
  {
    id: 5,
    warehouseCode: 'WH20240005',
    warehouseName: '物料仓库C',
    warehouseType: '物料仓库',
    manager: '钱七',
    phone: '13800138005',
    deptName: '生产部',
    address: '车间内部E区',
    remark: '存放工具物料',
    establishDate: '2020-05-12',
  },
  {
    id: 6,
    warehouseCode: 'WH20240006',
    warehouseName: '设备仓库C',
    warehouseType: '设备仓库',
    manager: '孙八',
    phone: '13800138006',
    deptName: '生产部',
    address: '厂区南侧F栋',
    remark: '存放大型设备',
    establishDate: '2020-06-18',
  },
  {
    id: 7,
    warehouseCode: 'WH20240007',
    warehouseName: '物料仓库D',
    warehouseType: '物料仓库',
    manager: '周九',
    phone: '13800138007',
    deptName: '采购部',
    address: '厂区东侧G栋',
    remark: '存放原材料',
    establishDate: '2020-07-22',
  },
  {
    id: 8,
    warehouseCode: 'WH20240008',
    warehouseName: '设备仓库D',
    warehouseType: '设备仓库',
    manager: '吴十',
    phone: '13800138008',
    deptName: '技术部',
    address: '厂区西侧H栋',
    remark: '存放精密设备',
    establishDate: '2021-01-08',
  },
  {
    id: 9,
    warehouseCode: 'WH20240009',
    warehouseName: '物料仓库E',
    warehouseType: '物料仓库',
    manager: '郑十一',
    phone: '13800138009',
    deptName: '采购部',
    address: '厂区北侧I栋',
    remark: '存放需冷藏物料',
    establishDate: '2021-02-15',
  },
  {
    id: 10,
    warehouseCode: 'WH20240010',
    warehouseName: '设备仓库E',
    warehouseType: '设备仓库',
    manager: '王十二',
    phone: '13800138010',
    deptName: '技术部',
    address: '厂区隔离区J栋',
    remark: '存放危险设备',
    establishDate: '2021-03-20',
  },
  {
    id: 11,
    warehouseCode: 'WH20240011',
    warehouseName: '物料仓库F',
    warehouseType: '物料仓库',
    manager: '刘明',
    phone: '13800138011',
    deptName: '生产部',
    address: '厂区东侧K栋',
    remark: '存放包装材料',
    establishDate: '2021-04-10',
  },
  {
    id: 12,
    warehouseCode: 'WH20240012',
    warehouseName: '设备仓库F',
    warehouseType: '设备仓库',
    manager: '陈华',
    phone: '13800138012',
    deptName: '技术部',
    address: '厂区西侧L栋',
    remark: '存放检测设备',
    establishDate: '2021-05-05',
  },
])

const columns = reactive([
  { type: 'selection', width: 50 },
  { prop: 'index', label: '序号', width: 60 },
  { prop: 'warehouseCode', label: '仓库编码', search: { el: 'input', key: 'warehouseCode' } },
  { prop: 'warehouseName', label: '仓库名称', search: { el: 'input', key: 'warehouseName' } },
  {
    prop: 'warehouseType',
    label: '仓库类型',
    search: { el: 'select', key: 'warehouseType' },
    enum: warehouseTypeOptions,
  },
  { prop: 'manager', label: '仓库负责人' },
  { prop: 'deptName', label: '所属部门' },
  { prop: 'establishDate', label: '成立时间' },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' },
])

const formData = reactive({
  id: null,
  warehouseCode: '',
  warehouseName: '',
  warehouseType: '',
  manager: '',
  phone: '',
  deptName: '',
  address: '',
  remark: '',
  establishDate: '',
})

const rules = {
  warehouseName: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
  warehouseType: [{ required: true, message: '请选择仓库类型', trigger: 'change' }],
  manager: [{ required: true, message: '请输入仓库负责人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  deptName: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  address: [{ required: true, message: '请输入仓库地址', trigger: 'blur' }],
  establishDate: [{ required: true, message: '请选择成立时间', trigger: 'change' }],
}

const generateWarehouseCode = () => {
  const year = new Date().getFullYear()
  const maxId = mockData.value.reduce((max, item) => {
    const id = parseInt(item.id)
    return id > max ? id : max
  }, 0)
  const newId = String(maxId + 1).padStart(4, '0')
  return `WH${year}${newId}`
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    warehouseCode: generateWarehouseCode(),
    warehouseName: '',
    warehouseType: '',
    manager: '',
    phone: '',
    deptName: '',
    address: '',
    remark: '',
    establishDate: '',
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/warehouse-manage/warehouse-manage-detail/${row.id}`)
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    warehouseCode: row.warehouseCode,
    warehouseName: row.warehouseName,
    warehouseType: row.warehouseType,
    manager: row.manager,
    phone: row.phone,
    deptName: row.deptName,
    address: row.address,
    remark: row.remark,
    establishDate: row.establishDate,
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该仓库吗？删除前请确认该仓库不存在关联数据。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const index = mockData.value.findIndex((item) => item.id === row.id)
    if (index > -1) {
      mockData.value.splice(index, 1)
      ElMessage.success('删除成功')
      proTableRef.value?.getTableList()
    }
  } catch {
    // 用户取消
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = mockData.value.findIndex((item) => item.id === formData.id)
        if (index > -1) {
          mockData.value[index] = { ...mockData.value[index], ...formData }
        }
        ElMessage.success('修改成功')
      } else {
        const maxId = mockData.value.reduce((max, item) => {
          const id = parseInt(item.id)
          return id > max ? id : max
        }, 0)
        mockData.value.push({
          id: maxId + 1,
          ...formData,
        })
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

const getTableList = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockData.value]

      if (params?.warehouseCode) {
        filteredData = filteredData.filter((item) =>
          item.warehouseCode.includes(params.warehouseCode),
        )
      }

      if (params?.warehouseName) {
        filteredData = filteredData.filter((item) =>
          item.warehouseName.includes(params.warehouseName),
        )
      }

      if (params?.warehouseType) {
        filteredData = filteredData.filter((item) => item.warehouseType === params.warehouseType)
      }

      const pageNum = params?.pageNum || 1
      const pageSize = params?.pageSize || 10
      const startIndex = (pageNum - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)

      const dataWithIndex = paginatedData.map((item, index) => ({
        ...item,
        index: startIndex + index + 1,
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
  <div class="warehouse-manage-container">
    <ProTable
      ref="proTableRef"
      :columns="columns"
      :request-api="getTableList"
      :init-param="{ searchType: 'fuzzy' }"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增仓库</el-button>
      </template>

      <template #warehouseType="scope">
        <el-tag>{{ scope.row.warehouseType }}</el-tag>
      </template>

      <template #deptName="scope">
        <el-tag type="success">{{ scope.row.deptName }}</el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link :icon="View" @click="handleView(scope.row)">查看</el-button>
        <el-button type="warning" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)"
          >删除</el-button
        >
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑仓库' : '新增仓库'"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="warehouse-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="form-section">
          <div class="section-title">
            <span class="title-text">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="仓库编码">
              <el-input v-model="formData.warehouseCode" disabled placeholder="系统自动生成" />
            </el-form-item>
            <el-form-item label="仓库名称" prop="warehouseName">
              <el-input v-model="formData.warehouseName" placeholder="请输入仓库名称" />
            </el-form-item>
            <el-form-item label="仓库类型" prop="warehouseType">
              <el-select
                v-model="formData.warehouseType"
                placeholder="请选择仓库类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in warehouseTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="仓库负责人" prop="manager">
              <el-input v-model="formData.manager" placeholder="请输入仓库负责人" />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="所属部门" prop="deptName">
              <el-select
                v-model="formData.deptName"
                placeholder="请选择所属部门"
                style="width: 100%"
              >
                <el-option
                  v-for="item in deptOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="仓库地址" prop="address">
              <el-input v-model="formData.address" placeholder="请输入仓库地址" />
            </el-form-item>
            <el-form-item label="成立时间" prop="establishDate">
              <el-date-picker
                v-model="formData.establishDate"
                type="date"
                placeholder="请选择成立时间"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="title-text">其他信息</span>
          </div>
          <el-form-item label="备注">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注"
            />
          </el-form-item>
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
.warehouse-manage-container {
  :deep(.table-search) {
    margin-bottom: 10px !important;
  }

  :deep(.el-table) {
    .el-table__body-wrapper {
      .el-table__body {
        .el-table__row {
          .el-table__cell:last-child {
            .cell {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 4px 8px;
              justify-items: stretch;
              align-items: stretch;

              .el-button {
                width: 100%;
                min-width: 60px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 4px 8px !important;
                margin: 0 !important;

                .el-icon {
                  margin-right: 4px;
                  font-size: 14px;
                }

                span {
                  font-size: 14px;
                  white-space: nowrap;
                }
              }
            }
          }
        }
      }
    }
  }
}

.warehouse-dialog {
  :deep(.el-dialog__header) {
    padding: 14px 21px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 20px;
    border-top: 1px solid #ebeef5;
  }

  .form-section {
    padding: 10px 12px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 26px;

    &:last-of-type {
      border-bottom: none;
    }

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .title-text {
        font-size: 20px;
        font-weight: 500;
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
      gap: 14px 20px;

      :deep(.el-form-item) {
        margin-bottom: 0;

        .el-form-item__label {
          font-size: 16px;
          color: #303133;
          font-weight: 400;
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
      font-size: 16px;
      padding: 10px 20px;
    }
  }
}

@media screen and (max-width: 900px) {
  .warehouse-dialog {
    .form-section {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .warehouse-dialog {
    .form-section {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
