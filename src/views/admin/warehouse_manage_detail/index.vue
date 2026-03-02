<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowLeft } from '@element-plus/icons-vue'
import { getWarehouseDetail, updateWarehouse } from '@/api/warehouse'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const loading = ref(false)
const warehouseData = ref({})
const formData = reactive({})
const formRef = ref()

const warehouseTypeOptions = ref([
  { label: '物料仓库', value: 'MaterialWarehouse' },
  { label: '设备仓库', value: 'EquipmentWarehouse' },
])

const deptOptions = ref([])

const userOptions = ref([])

const loadWarehouseData = async () => {
  loading.value = true
  try {
    const warhouseId = route.params.warhouseId || route.params.id
    const res = await getWarehouseDetail(warhouseId)
    console.log('仓库详情接口返回:', res)

    const item = res.data?.data?.data || {}
    console.log('原始数据:', item)

    const mappedData = {
      id: item.id,
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
      phone: item.phone || '',
      deptName: item.department?.departmentName || '',
      deptId: item.department?.id || '',
      address: item.warhouseLocation || '',
      remark: item.remark || '',
      establishDate: item.createTime ? item.createTime.split('T')[0] : '',
    }

    console.log('映射后数据:', mappedData)

    warehouseData.value = { ...mappedData }
    Object.assign(formData, mappedData)
  } catch (error) {
    console.error('获取仓库详情失败:', error)
    ElMessage.error('获取仓库详情失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  isEdit.value = true
  Object.assign(formData, {
    ...warehouseData.value,
    warehouseType: warehouseData.value.warehouseTypeRaw || warehouseData.value.warehouseType,
    manager: warehouseData.value.managerId || '',
    deptName: warehouseData.value.deptId || '',
  })
}

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消编辑吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      isEdit.value = false
      Object.assign(formData, warehouseData.value)
    })
    .catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = {
          id: warehouseData.value.id,
          warhouseId: warehouseData.value.warehouseCode,
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
        console.log('详情页修改提交数据:', submitData)
        await updateWarehouse(submitData)
        await loadWarehouseData()
        ElMessage.success('保存成功')
        isEdit.value = false
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败，请重试')
      }
    }
  })
}

const handleBack = () => {
  router.push('/warehouse-manage/warehouse-manage-info')
}

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

onMounted(() => {
  loadWarehouseData()
})
</script>

<template>
  <div class="warehouse-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ warehouseData.warehouseName }}</h2>
          <span class="page-subtitle">仓库详情</span>
        </div>
      </div>
      <div class="header-right">
        <template v-if="!isEdit">
          <el-button type="primary" :icon="Edit" @click="handleEdit">编辑</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </template>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">基本信息</span>
        </div>

        <template v-if="!isEdit">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">仓库编码</div>
              <div class="info-value">
                <el-tag size="default">{{ warehouseData.warehouseCode }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">仓库名称</div>
              <div class="info-value">{{ warehouseData.warehouseName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">仓库类型</div>
              <div class="info-value">
                <el-tag size="default">{{ warehouseData.warehouseType }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">仓库负责人</div>
              <div class="info-value">{{ warehouseData.manager }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">联系电话</div>
              <div class="info-value">{{ warehouseData.phone }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">所属部门</div>
              <div class="info-value">
                <el-tag type="success" size="default">{{ warehouseData.deptName }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">仓库地址</div>
              <div class="info-value">{{ warehouseData.address }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">成立时间</div>
              <div class="info-value">{{ warehouseData.establishDate }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
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
          </el-form>
        </template>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">其他信息</span>
        </div>

        <template v-if="!isEdit">
          <div class="extend-info">
            <div class="extend-item">
              <div class="extend-label">备注</div>
              <div class="extend-content">
                <pre class="content-pre">{{ warehouseData.remark || '暂无' }}</pre>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="extend-edit">
            <el-form-item label="备注">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="4"
                placeholder="请输入备注"
              />
            </el-form-item>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.warehouse-detail-container {
  padding: 2px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 18px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;

      .title-area {
        .page-title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1.3;
        }

        .page-subtitle {
          font-size: 16px;
          color: #909399;
        }
      }
    }

    .header-right {
      display: flex;
      gap: 12px;

      .el-button {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  }

  .detail-content {
    .section-card {
      background: #fff;
      border-radius: 4px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #ebeef5;

        .section-title {
          font-size: 22px;
          font-weight: 600;
          color: #303133;
          position: relative;
          padding-left: 12px;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 16px;
            background: #409eff;
            border-radius: 2px;
          }
        }
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        background: #ebeef5;
        padding: 1px;

        .info-item {
          display: flex;
          align-items: stretch;
          background: #fff;
          min-height: 60px;

          .info-label {
            width: 110px;
            padding: 18px 20px;
            background: #fafafa;
            font-size: 18px;
            color: #606266;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            font-weight: 500;
          }

          .info-value {
            flex: 1;
            padding: 18px 20px;
            font-size: 16px;
            color: #303133;
            display: flex;
            align-items: center;
          }
        }
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px 32px;
        padding: 24px;

        :deep(.el-form-item) {
          margin-bottom: 0;

          .el-form-item__label {
            font-size: 18px;
            color: #606266;
            font-weight: 500;
            padding-bottom: 8px;
          }
        }
      }

      .extend-info {
        padding: 20px;

        .extend-item {
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 0;
          }

          .extend-label {
            font-size: 18px;
            color: #606266;
            margin-bottom: 12px;
            font-weight: 500;
          }

          .extend-content {
            background: #fafafa;
            border-radius: 4px;
            padding: 10px 10px;

            .content-pre {
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: inherit;
              line-height: 1.8;
              font-size: 16px;
              color: #303133;
            }
          }
        }
      }

      .extend-edit {
        padding: 16px 24px;
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .warehouse-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .form-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .warehouse-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: 1fr;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>
