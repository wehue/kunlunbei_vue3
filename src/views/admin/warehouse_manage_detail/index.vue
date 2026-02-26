<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const loading = ref(false)
const warehouseData = ref({})
const formData = reactive({})
const formRef = ref()

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

const userOptions = ref([
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
  { label: '钱七', value: '钱七' },
  { label: '孙八', value: '孙八' },
  { label: '周九', value: '周九' },
  { label: '吴十', value: '吴十' },
  { label: '郑十一', value: '郑十一' },
  { label: '王十二', value: '王十二' },
  { label: '刘明', value: '刘明' },
  { label: '陈华', value: '陈华' },
])

const mockWarehouseData = {
  1: { id: 1, warehouseCode: 'WH20240001', warehouseName: '物料仓库A', warehouseType: '物料仓库', manager: '张三', phone: '13800138001', deptName: '采购部', address: '厂区东侧A栋', remark: '存放原材料', establishDate: '2020-01-15' },
  2: { id: 2, warehouseCode: 'WH20240002', warehouseName: '设备仓库A', warehouseType: '设备仓库', manager: '李四', phone: '13800138002', deptName: '生产部', address: '厂区西侧B栋', remark: '存放设备', establishDate: '2020-02-20' },
  3: { id: 3, warehouseCode: 'WH20240003', warehouseName: '物料仓库B', warehouseType: '物料仓库', manager: '王五', phone: '13800138003', deptName: '生产部', address: '车间内部C区', remark: '存放半成品物料', establishDate: '2020-03-10' },
  4: { id: 4, warehouseCode: 'WH20240004', warehouseName: '设备仓库B', warehouseType: '设备仓库', manager: '赵六', phone: '13800138004', deptName: '技术部', address: '厂区北侧D栋', remark: '存放设备备件', establishDate: '2020-04-05' },
  5: { id: 5, warehouseCode: 'WH20240005', warehouseName: '物料仓库C', warehouseType: '物料仓库', manager: '钱七', phone: '13800138005', deptName: '生产部', address: '车间内部E区', remark: '存放工具物料', establishDate: '2020-05-12' },
  6: { id: 6, warehouseCode: 'WH20240006', warehouseName: '设备仓库C', warehouseType: '设备仓库', manager: '孙八', phone: '13800138006', deptName: '生产部', address: '厂区南侧F栋', remark: '存放大型设备', establishDate: '2020-06-18' },
  7: { id: 7, warehouseCode: 'WH20240007', warehouseName: '物料仓库D', warehouseType: '物料仓库', manager: '周九', phone: '13800138007', deptName: '采购部', address: '厂区东侧G栋', remark: '存放原材料', establishDate: '2020-07-22' },
  8: { id: 8, warehouseCode: 'WH20240008', warehouseName: '设备仓库D', warehouseType: '设备仓库', manager: '吴十', phone: '13800138008', deptName: '技术部', address: '厂区西侧H栋', remark: '存放精密设备', establishDate: '2021-01-08' },
  9: { id: 9, warehouseCode: 'WH20240009', warehouseName: '物料仓库E', warehouseType: '物料仓库', manager: '郑十一', phone: '13800138009', deptName: '采购部', address: '厂区北侧I栋', remark: '存放需冷藏物料', establishDate: '2021-02-15' },
  10: { id: 10, warehouseCode: 'WH20240010', warehouseName: '设备仓库E', warehouseType: '设备仓库', manager: '王十二', phone: '13800138010', deptName: '技术部', address: '厂区隔离区J栋', remark: '存放危险设备', establishDate: '2021-03-20' },
  11: { id: 11, warehouseCode: 'WH20240011', warehouseName: '物料仓库F', warehouseType: '物料仓库', manager: '刘明', phone: '13800138011', deptName: '生产部', address: '厂区东侧K栋', remark: '存放包装材料', establishDate: '2021-04-10' },
  12: { id: 12, warehouseCode: 'WH20240012', warehouseName: '设备仓库F', warehouseType: '设备仓库', manager: '陈华', phone: '13800138012', deptName: '技术部', address: '厂区西侧L栋', remark: '存放检测设备', establishDate: '2021-05-05' },
}

const loadWarehouseData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = mockWarehouseData[id] || mockWarehouseData[1]
    warehouseData.value = { ...data }
    Object.assign(formData, data)
    loading.value = false
  }, 300)
}

const handleEdit = () => {
  isEdit.value = true
  Object.assign(formData, warehouseData.value)
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

  await formRef.value.validate((valid) => {
    if (valid) {
      Object.assign(warehouseData.value, formData)
      mockWarehouseData[warehouseData.value.id] = { ...warehouseData.value }
      ElMessage.success('保存成功')
      isEdit.value = false
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
                <el-select v-model="formData.warehouseType" placeholder="请选择仓库类型" style="width: 100%">
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
                <el-select v-model="formData.deptName" placeholder="请选择所属部门" style="width: 100%">
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
              <el-input v-model="formData.remark" type="textarea" :rows="4" placeholder="请输入备注" />
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
