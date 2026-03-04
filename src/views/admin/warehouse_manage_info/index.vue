<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import {
  getWarehouseList,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '@/api/warehouse'
import { getDeptList } from '@/api/dept'
import { getProductionStaffList } from '@/api/productionStaff'

const router = useRouter()

const proTableRef = ref()
const dialogVisible = ref(false)
const formRef = ref()
const isEdit = ref(false)

const warehouseTypeOptions = ref([
  { label: '物料仓库', value: 'MaterialWarehouse' },
  { label: '设备仓库', value: 'EquipmentWarehouse' },
])

const deptOptions = ref([])

const userOptions = ref([])

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
  warhouseId: '',
  warhouseName: '',
  warhouseType: '',
  warhouseManager: { id: '' },
  phone: '',
  department: { id: '', departmentName: '' },
  warhouseLocation: '',
  remark: '',
  createTime: '',
  manager: '',
  deptName: '',
  address: '',
  establishDate: '',
})

const rules = {
  warehouseName: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
  warehouseType: [{ required: true, message: '请选择仓库类型', trigger: 'change' }],
  manager: [{ required: true, message: '请选择仓库负责人', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  deptName: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  address: [{ required: true, message: '请输入仓库地址', trigger: 'blur' }],
  establishDate: [{ required: true, message: '请选择成立时间', trigger: 'change' }],
}

const loadOptions = async () => {
  try {
    const [deptRes, staffRes] = await Promise.all([getDeptList(), getProductionStaffList()])

    const deptData = deptRes.data?.data
    const deptList = Array.isArray(deptData)
      ? deptData
      : Array.isArray(deptData?.data)
        ? deptData.data
        : []
    deptOptions.value = deptList.map((item) => ({
      label: item.departmentName,
      value: item.id,
    }))

    const staffData = staffRes.data?.data
    const staffList = Array.isArray(staffData)
      ? staffData
      : Array.isArray(staffData?.data)
        ? staffData.data
        : []
    userOptions.value = staffList.map((item) => ({
      label: item.productionStaffName,
      value: item.id,
    }))
  } catch (error) {
    console.error('加载选项数据失败:', error)
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    warhouseId: '',
    warhouseName: '',
    warhouseType: '',
    warhouseManager: { id: '' },
    phone: '',
    department: { id: '', departmentName: '' },
    warhouseLocation: '',
    remark: '',
    createTime: '',
    warehouseCode: '',
    warehouseName: '',
    warehouseType: '',
    manager: '',
    deptName: '',
    address: '',
    establishDate: '',
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/warehouse-manage/warehouse-manage-detail/${row.warehouseCode}`)
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    warhouseId: row.warehouseCode,
    warhouseName: row.warhouseName,
    warhouseType: row.warehouseTypeRaw,
    warhouseManager: { id: row.managerId || '' },
    phone: row.phone,
    department: {
      id: row.deptId || '',
      departmentName: row.deptName || '',
    },
    warhouseLocation: row.address,
    remark: row.remark,
    createTime: row.establishDate,
    warehouseCode: row.warehouseCode,
    warehouseName: row.warhouseName,
    warehouseType: row.warehouseTypeRaw,
    manager: row.managerId || '',
    deptName: row.deptId || '',
    address: row.address,
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
    await deleteWarehouse(row.warhouseId || row.warehouseCode)
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除仓库失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = {
          id: formData.id,
          warhouseId: formData.warhouseId || formData.warehouseCode,
          warhouseName: formData.warehouseName,
          warhouseType: formData.warehouseType,
          warhouseManager: {
            id: formData.manager,
          },
          phone: formData.phone,
          department: {
            id: formData.deptName,
          },
          warhouseLocation: formData.address,
          remark: formData.remark,
          createTime: formData.establishDate,
        }

        console.log('提交数据:', submitData)

        if (isEdit.value) {
          await updateWarehouse(submitData)
          ElMessage.success('修改成功')
        } else {
          await createWarehouse(submitData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        proTableRef.value?.getTableList()
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error('操作失败，请重试')
      }
    }
  })
}

const handleCancel = () => {
  dialogVisible.value = false
}

const getTableList = async (params) => {
  try {
    // 构建查询参数，映射前端参数名到后端参数名
    const apiParams = {
      warhouseId: params?.warehouseCode,
      warhouseName: params?.warehouseName,
      warhouseType: params?.warehouseType,
    }

    const res = await getWarehouseList(apiParams)
    console.log('获取仓库列表成功:', res)

    let dataList = res.data?.data?.data || res.data?.data || []

    dataList = dataList.map((item, index) => ({
      ...item,
      index: index + 1,
      warehouseCode: item.warhouseId,
      warehouseName: item.warhouseName,
      warehouseTypeRaw: item.warhouseType,
      warehouseType:
        item.warhouseType === 'MaterialWarehouse'
          ? '物料仓库'
          : item.warhouseType === 'EquipmentWarehouse'
            ? '设备仓库'
            : item.warhouseType,
      manager: item.warhouseManager?.productionStaffName || '',
      managerId: item.warhouseManager?.id || '',
      deptName: item.department?.departmentName || '',
      deptId: item.department?.id || '',
      establishDate: item.createTime ? item.createTime.split('T')[0] : '',
      phone: item.phone || '',
      address: item.warhouseLocation || '',
      remark: item.remark || '',
    }))

    const pageNum = params?.pageNum || 1
    const pageSize = params?.pageSize || 10
    const startIndex = (pageNum - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = dataList.slice(startIndex, endIndex)

    const dataWithIndex = paginatedData.map((item, index) => ({
      ...item,
      index: startIndex + index + 1,
    }))

    return {
      data: {
        list: dataWithIndex,
        total: dataList.length,
      },
    }
  } catch (error) {
    console.error('获取仓库列表失败:', error)
    return {
      data: {
        list: [],
        total: 0,
      },
    }
  }
}

onMounted(() => {
  loadOptions()
})
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
              <el-input v-model="formData.warehouseCode" />
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
              <el-select
                v-model="formData.manager"
                placeholder="请选择仓库负责人"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
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
