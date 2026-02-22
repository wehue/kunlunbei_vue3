<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const loading = ref(false)
const operatorData = ref({})
const formData = reactive({})
const formRef = ref()

const deptOptions = ref([
  { label: '技术部', value: '技术部' },
  { label: '生产部', value: '生产部' },
  { label: '质量部', value: '质量部' },
  { label: '采购部', value: '采购部' },
  { label: '销售部', value: '销售部' },
  { label: '财务部', value: '财务部' },
  { label: '人力资源部', value: '人力资源部' },
])

const positionOptions = ref([
  { label: '工程师', value: '工程师' },
  { label: '技术员', value: '技术员' },
  { label: '操作工', value: '操作工' },
  { label: '质检员', value: '质检员' },
  { label: '采购员', value: '采购员' },
  { label: '销售员', value: '销售员' },
  { label: '会计', value: '会计' },
  { label: '人事专员', value: '人事专员' },
  { label: '主管', value: '主管' },
  { label: '经理', value: '经理' },
])

const mockOperatorData = {
  1: {
    id: 1,
    employeeCode: 'EMP20240001',
    employeeName: '张三',
    deptName: '技术部',
    position: '工程师',
  },
  2: {
    id: 2,
    employeeCode: 'EMP20240002',
    employeeName: '李四',
    deptName: '生产部',
    position: '操作工',
  },
  3: {
    id: 3,
    employeeCode: 'EMP20240003',
    employeeName: '王五',
    deptName: '质量部',
    position: '质检员',
  },
  4: {
    id: 4,
    employeeCode: 'EMP20240004',
    employeeName: '赵六',
    deptName: '采购部',
    position: '采购员',
  },
  5: {
    id: 5,
    employeeCode: 'EMP20240005',
    employeeName: '钱七',
    deptName: '销售部',
    position: '销售员',
  },
  6: {
    id: 6,
    employeeCode: 'EMP20240006',
    employeeName: '孙八',
    deptName: '财务部',
    position: '会计',
  },
  7: {
    id: 7,
    employeeCode: 'EMP20240007',
    employeeName: '周九',
    deptName: '人力资源部',
    position: '人事专员',
  },
  8: {
    id: 8,
    employeeCode: 'EMP20240008',
    employeeName: '吴十',
    deptName: '技术部',
    position: '技术员',
  },
  9: {
    id: 9,
    employeeCode: 'EMP20240009',
    employeeName: '郑十一',
    deptName: '生产部',
    position: '主管',
  },
  10: {
    id: 10,
    employeeCode: 'EMP20240010',
    employeeName: '王十二',
    deptName: '技术部',
    position: '经理',
  },
  11: {
    id: 11,
    employeeCode: 'EMP20240011',
    employeeName: '刘明',
    deptName: '质量部',
    position: '质检员',
  },
  12: {
    id: 12,
    employeeCode: 'EMP20240012',
    employeeName: '陈华',
    deptName: '生产部',
    position: '操作工',
  },
}

const loadOperatorData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = mockOperatorData[id] || mockOperatorData[1]
    operatorData.value = { ...data }
    Object.assign(formData, data)
    loading.value = false
  }, 300)
}

const handleEdit = () => {
  isEdit.value = true
  Object.assign(formData, operatorData.value)
}

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消编辑吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      isEdit.value = false
      Object.assign(formData, operatorData.value)
    })
    .catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      Object.assign(operatorData.value, formData)
      mockOperatorData[operatorData.value.id] = { ...operatorData.value }
      ElMessage.success('保存成功')
      isEdit.value = false
    }
  })
}

const handleBack = () => {
  router.push('/operator-manage/operator-manage-info')
}

const rules = {
  employeeName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  deptName: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  position: [{ required: true, message: '请选择岗位', trigger: 'change' }],
}

onMounted(() => {
  loadOperatorData()
})
</script>

<template>
  <div class="operator-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ operatorData.employeeName }}</h2>
          <span class="page-subtitle">人员详情</span>
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
              <div class="info-label">工号</div>
              <div class="info-value">
                <el-tag size="default">{{ operatorData.employeeCode }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">姓名</div>
              <div class="info-value">{{ operatorData.employeeName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">所属部门</div>
              <div class="info-value">
                <el-tag type="success" size="default">{{ operatorData.deptName }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">岗位</div>
              <div class="info-value">
                <el-tag size="default">{{ operatorData.position }}</el-tag>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="工号">
                <el-input v-model="formData.employeeCode" disabled placeholder="系统自动生成" />
              </el-form-item>
              <el-form-item label="姓名" prop="employeeName">
                <el-input v-model="formData.employeeName" placeholder="请输入姓名" />
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
              <el-form-item label="岗位" prop="position">
                <el-select v-model="formData.position" placeholder="请选择岗位" style="width: 100%">
                  <el-option
                    v-for="item in positionOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.operator-detail-container {
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
    }
  }
}

@media screen and (max-width: 1200px) {
  .operator-detail-container {
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
  .operator-detail-container {
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
